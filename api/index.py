import requests
import os
import re
import time
import random
from urllib.parse import quote
from flask import Flask, request, jsonify

app = Flask(__name__)

SHOPIFY_STORE_NAME = 'lipoplay'
ACCESS_TOKEN = os.environ.get('ACCESS_TOKEN', '')

LOCATION_NAMES = {
    50012455069: "Bodega Principal",
    68132569245: "Bodega Secundaria"
}

CARRITOS_TEMPORALES = {}
CARRITO_EXPIRATION_SECONDS = 3600


def limpiar_carritos_viejos():
    ahora = time.time()
    ids_a_eliminar = [
        cid for cid, data in CARRITOS_TEMPORALES.items()
        if ahora - data.get("created_at", 0) > CARRITO_EXPIRATION_SECONDS
    ]
    for cid in ids_a_eliminar:
        del CARRITOS_TEMPORALES[cid]


def generar_carrito_id():
    return str(random.randint(100000, 999999))


def normalize_text(text):
    replacements = {
        'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
        'ñ': 'n', 'ü': 'u'
    }
    text = text.lower()
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text


def levenshtein_distance(s1, s2):
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)
    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            current_row.append(min(
                previous_row[j + 1] + 1,
                current_row[j] + 1,
                previous_row[j] + (c1 != c2)
            ))
        previous_row = current_row
    return previous_row[-1]


def extract_technical_specs(text, search_voltage=None):
    text_lower = text.lower()
    voltages = []

    for match in re.findall(r'(\d+\.?\d*)\s*v(?:olt)?(?:s)?', text_lower):
        voltages.append(float(match))

    if not voltages:
        for v in [3.7, 7.2, 7.4, 11.1, 14.8, 22.2]:
            if str(v) in text_lower or str(v).replace('.', ',') in text_lower:
                voltages.append(v)

    if search_voltage and voltages:
        voltages.sort(key=lambda v: abs(v - search_voltage))
        voltage = voltages[0]
    elif voltages:
        voltage = voltages[0]
    else:
        voltage = None

    mah = None
    mah_match = re.search(r'(\d+)\s*mah', text_lower)
    if mah_match:
        mah = int(mah_match.group(1))

    return {'voltage': voltage, 'mah': mah, 'all_voltages': voltages}


def calculate_spec_similarity(search_specs, product_specs):
    score = 0
    max_score = 0

    if search_specs['voltage'] is not None and product_specs['voltage'] is not None:
        max_score += 100
        diff = abs(search_specs['voltage'] - product_specs['voltage'])
        if diff == 0:
            score += 100
        elif diff <= 0.5:
            score += 80
        elif diff <= 1.0:
            score += 50
        elif diff <= 2.0:
            score += 20

    if search_specs['mah'] is not None and product_specs['mah'] is not None:
        max_score += 100
        mah_diff = abs(search_specs['mah'] - product_specs['mah'])
        pct = (mah_diff / search_specs['mah']) * 100
        if pct <= 5:
            score += 100
        elif pct <= 10:
            score += 85
        elif pct <= 20:
            score += 70
        elif pct <= 30:
            score += 50
        elif pct <= 50:
            score += 30

    return score / max_score if max_score > 0 else None


def calculate_keyword_match(search_term, product_title):
    search_words = normalize_text(search_term).split()
    product_words = normalize_text(product_title).split()

    if not search_words:
        return 0

    score = 0
    total_weight = 0

    for word in search_words:
        if re.search(r'^\d+$', word):
            weight = 3.0
        elif re.search(r'\d', word):
            weight = 2.0
        elif len(word) > 5:
            weight = 1.5
        else:
            weight = 1.0

        total_weight += weight

        if word in product_words:
            score += weight
        else:
            for pw in product_words:
                if word in pw or pw in word:
                    score += weight * 0.5
                    break

    return score / total_weight if total_weight > 0 else 0


def detect_product_category(search_term):
    norm = normalize_text(search_term)
    category_map = {
        'cargador': ['cargador', 'charger', 'carga', 'multicargador'],
        'bateria':  ['bateria', 'battery', 'pila', 'pilas', 'baterias'],
        'cable':    ['cable', 'conector', 'adaptador'],
        'tester':   ['tester', 'medidor', 'voltimetro'],
        'drone':    ['drone', 'quadcopter'],
        'motor':    ['motor', 'motores'],
    }
    detected = []
    for category, keywords in category_map.items():
        if any(kw in norm for kw in keywords):
            detected.append(category)
    return detected


def calculate_category_match(search_term, product_title):
    s_cats = detect_product_category(search_term)
    p_cats = detect_product_category(product_title)

    if not s_cats:
        return 0

    if 'cargador' in s_cats:
        if 'cargador' in p_cats:
            return 1.0
        if 'bateria' in p_cats and 'cargador' not in p_cats:
            return -0.5

    matches = set(s_cats).intersection(set(p_cats))
    return len(matches) / len(s_cats)


def _shopify_headers():
    return {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': ACCESS_TOKEN,
    }


def get_inventory_locations(inventory_item_id):
    url = (
        f'https://{SHOPIFY_STORE_NAME}.myshopify.com/admin/api/2023-04/'
        f'inventory_levels.json?inventory_item_ids={inventory_item_id}'
    )
    try:
        resp = requests.get(url, headers=_shopify_headers())
        resp.raise_for_status()
        return resp.json().get('inventory_levels', [])
    except Exception as e:
        print(f"Error getting inventory locations: {e}")
        return []


def format_product_info(products):
    formatted = []
    for product in products:
        total_stock = 0
        variants = []

        for variant in product.get('variants', []):
            qty = variant.get('inventory_quantity', 0)
            total_stock += qty

            locations = []
            inv_item_id = variant.get('inventory_item_id')
            if inv_item_id:
                for level in get_inventory_locations(inv_item_id):
                    if level.get('available', 0) > 0:
                        loc_id = level.get('location_id')
                        locations.append({
                            "location_id": loc_id,
                            "location_name": LOCATION_NAMES.get(loc_id, f"Bodega {loc_id}"),
                            "stock": level.get('available', 0),
                        })

            variants.append({
                "variant_id": variant.get('id'),
                "variant_title": variant.get('title', 'Default'),
                "price": variant.get('price'),
                "available": qty > 0,
                "stock": qty,
                "locations": locations,
            })

        handle = product.get('handle', '')
        formatted.append({
            "product_id": product.get('id'),
            "name": product.get('title'),
            "description": product.get('body_html', 'Sin descripción'),
            "price": product['variants'][0].get('price') if product.get('variants') else None,
            "total_stock": total_stock,
            "link": f"https://{SHOPIFY_STORE_NAME}.myshopify.com/products/{handle}",
            "variants": variants,
        })
    return formatted


def get_top_matching_products(search_term, limit=4):
    url = (
        f'https://{SHOPIFY_STORE_NAME}.myshopify.com/admin/api/2023-04/'
        'products.json?limit=250'
    )
    try:
        resp = requests.get(url, headers=_shopify_headers())
        resp.raise_for_status()
        products = resp.json().get('products', [])
    except requests.exceptions.HTTPError as e:
        print(f"HTTP error: {e}")
        return [], "HTTP error occurred while fetching products"
    except requests.exceptions.RequestException as e:
        print(f"Request error: {e}")
        return [], "Network error occurred while fetching products"

    if not products:
        return [], "No products found"

    search_specs = extract_technical_specs(search_term)
    has_search_specs = search_specs['voltage'] is not None or search_specs['mah'] is not None
    scored = []

    for product in products:
        title = product['title']
        product_specs = extract_technical_specs(title, search_specs.get('voltage'))

        max_len = max(len(search_term), len(title))
        text_sim = 1 - levenshtein_distance(search_term.lower(), title.lower()) / max_len if max_len else 0

        keyword = calculate_keyword_match(search_term, title)
        category = calculate_category_match(search_term, title)
        spec_sim = calculate_spec_similarity(search_specs, product_specs)

        if category < 0:
            final = category
        elif category == 1.0 and spec_sim is not None:
            final = category * 0.5 + spec_sim * 0.35 + keyword * 0.1 + text_sim * 0.05
        elif spec_sim is not None:
            final = category * 0.3 + spec_sim * 0.5 + keyword * 0.15 + text_sim * 0.05
        elif has_search_specs:
            final = category * 0.6 + keyword * 0.3 + text_sim * 0.1
        else:
            final = category * 0.5 + keyword * 0.35 + text_sim * 0.15

        scored.append({'product': product, 'score': final})

    scored.sort(key=lambda x: x['score'], reverse=True)
    top = [item['product'] for item in scored[:limit]]

    if not top:
        return [], "No matching products found"
    return top, None


def get_order_tracking_info(email):
    url = (
        f'https://{SHOPIFY_STORE_NAME}.myshopify.com/admin/api/2023-04/'
        f'orders.json?email={email}&status=any'
    )
    try:
        resp = requests.get(url, headers=_shopify_headers())
        resp.raise_for_status()
        orders = resp.json().get('orders', [])
    except requests.exceptions.HTTPError as e:
        print(f"HTTP error: {e}")
        return None, "HTTP error occurred while fetching the order details."
    except requests.exceptions.RequestException as e:
        print(f"Request error: {e}")
        return None, "Network error occurred while fetching the order details."

    if not orders:
        return None, "No orders found for this email."

    recent = orders[0]
    fulfillments = recent.get('fulfillments', [])
    if not fulfillments:
        return None, "No tracking information found for the most recent order."

    f = fulfillments[0]
    return {
        "tracking_number": f['tracking_numbers'][0] if f.get('tracking_numbers') else None,
        "tracking_company": f.get('tracking_company'),
        "tracking_url": f['tracking_urls'][0] if f.get('tracking_urls') else None,
    }, None


@app.route('/get_product_availability', methods=['POST'])
def product_availability():
    data = request.get_json()
    search_term = data.get('product_name') if data else None

    if not search_term:
        return jsonify({"error": "Please provide a product name or search term"}), 400

    top_products, error = get_top_matching_products(search_term, limit=4)
    if error:
        return jsonify({"error": error}), 400
    if not top_products:
        return jsonify({"error": "No products found matching your search"}), 404

    return jsonify({
        "search_term": search_term,
        "results_count": len(top_products),
        "products": format_product_info(top_products),
    })


@app.route('/get_order_tracking_status', methods=['POST'])
def order_tracking_status():
    data = request.get_json()
    email = data.get('email') if data else None

    if not email:
        return jsonify({"error": "Please provide an email address"}), 400

    tracking_info, error = get_order_tracking_info(email)
    if error:
        return jsonify({"error": error}), 400

    return jsonify(tracking_info)


@app.route('/create_cart_link', methods=['POST'])
def create_cart_link():
    data = request.get_json()
    if not data or 'items' not in data:
        return jsonify({"error": "Please provide items parameter"}), 400

    items_input = data['items']
    if not items_input:
        return jsonify({"error": "Items cannot be empty"}), 400

    cart_items = []
    total_qty = 0
    summary = []

    if isinstance(items_input, str):
        for pair in items_input.split(','):
            pair = pair.strip()
            if not pair:
                continue
            if ':' not in pair or pair.count(':') != 1:
                return jsonify({"error": f"Invalid format: '{pair}'. Use 'variant_id:quantity'"}), 400
            vid_str, qty_str = pair.split(':')
            try:
                vid, qty = int(vid_str.strip()), int(qty_str.strip())
            except ValueError:
                return jsonify({"error": f"Invalid numbers in: '{pair}'"}), 400
            if qty < 1:
                return jsonify({"error": "Quantity must be at least 1"}), 400
            cart_items.append(f"{vid}:{qty}")
            total_qty += qty
            summary.append({"variant_id": vid, "quantity": qty})

    elif isinstance(items_input, list):
        for item in items_input:
            if not isinstance(item, dict):
                return jsonify({"error": "Each item must be an object with variant_id and quantity"}), 400
            vid = item.get('variant_id')
            qty = item.get('quantity', 1)
            if not vid:
                return jsonify({"error": "Each item must have a variant_id"}), 400
            if not isinstance(qty, int) or qty < 1:
                return jsonify({"error": "Quantity must be a positive integer"}), 400
            cart_items.append(f"{vid}:{qty}")
            total_qty += qty
            summary.append({"variant_id": vid, "quantity": qty})
    else:
        return jsonify({"error": "Items must be a string or an array"}), 400

    if not cart_items:
        return jsonify({"error": "No valid items provided"}), 400

    cart_str = ",".join(cart_items)
    note = quote("Pedido generado por bot")
    base = f"https://{SHOPIFY_STORE_NAME}.myshopify.com/cart"

    return jsonify({
        "cart_url": f"{base}/{cart_str}?note={note}",
        "checkout_url": f"{base}/{cart_str}?note={note}&checkout=true",
        "items_count": total_qty,
        "items_summary": summary,
    })


@app.route('/crear_carrito', methods=['POST'])
def crear_carrito():
    limpiar_carritos_viejos()
    carrito_id = generar_carrito_id()
    while carrito_id in CARRITOS_TEMPORALES:
        carrito_id = generar_carrito_id()
    CARRITOS_TEMPORALES[carrito_id] = {"items": [], "created_at": time.time()}
    return jsonify({
        "carrito_id": carrito_id,
        "mensaje": "Carrito creado. Usa este ID para agregar productos.",
    })


@app.route('/agregar_producto', methods=['POST'])
def agregar_producto():
    limpiar_carritos_viejos()
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    carrito_id = str(data.get('carrito_id', '')).strip()
    variant_id = str(data.get('variant_id', '')).strip()
    cantidad = data.get('cantidad', '1')

    if not carrito_id:
        return jsonify({"error": "carrito_id is required"}), 400
    if not variant_id:
        return jsonify({"error": "variant_id is required"}), 400

    try:
        vid_int = int(variant_id)
        qty_int = int(cantidad)
    except ValueError:
        return jsonify({"error": "variant_id and cantidad must be numbers"}), 400

    if qty_int < 1:
        return jsonify({"error": "cantidad must be at least 1"}), 400

    if carrito_id not in CARRITOS_TEMPORALES:
        return jsonify({"error": "Carrito no encontrado o expirado. Crea uno nuevo."}), 404

    carrito = CARRITOS_TEMPORALES[carrito_id]

    for item in carrito["items"]:
        if item["variant_id"] == vid_int:
            item["cantidad"] += qty_int
            return jsonify({
                "mensaje": "Cantidad actualizada para el producto",
                "productos_en_carrito": len(carrito["items"]),
                "items": carrito["items"],
            })

    if len(carrito["items"]) >= 5:
        return jsonify({"error": "Maximum 5 products per cart"}), 400

    carrito["items"].append({"variant_id": vid_int, "cantidad": qty_int})
    return jsonify({
        "mensaje": "Producto agregado al carrito",
        "productos_en_carrito": len(carrito["items"]),
        "items": carrito["items"],
    })


@app.route('/obtener_link_carrito', methods=['POST'])
def obtener_link_carrito():
    limpiar_carritos_viejos()
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    carrito_id = str(data.get('carrito_id', '')).strip()
    if not carrito_id:
        return jsonify({"error": "carrito_id is required"}), 400

    if carrito_id not in CARRITOS_TEMPORALES:
        return jsonify({"error": "Carrito no encontrado o expirado. Crea uno nuevo."}), 404

    carrito = CARRITOS_TEMPORALES[carrito_id]
    if not carrito["items"]:
        return jsonify({"error": "El carrito está vacío"}), 400

    cart_items = []
    total_qty = 0
    for item in carrito["items"]:
        cart_items.append(f"{item['variant_id']}:{item['cantidad']}")
        total_qty += item["cantidad"]

    cart_str = ",".join(cart_items)
    note = quote("Pedido generado por bot")
    base = f"https://{SHOPIFY_STORE_NAME}.myshopify.com/cart"

    items_snapshot = list(carrito["items"])
    del CARRITOS_TEMPORALES[carrito_id]

    return jsonify({
        "cart_url": f"{base}/{cart_str}?note={note}",
        "checkout_url": f"{base}/{cart_str}?note={note}&checkout=true",
        "items_count": total_qty,
        "items": items_snapshot,
    })
