(function() {
    'use strict';

    var WEBHOOK_URL = 'https://hook.us1.make.com/rmnk5e9oj29k1w6fodfxnvb66y1d614o';

    if (!document.querySelector('meta[name="viewport"]')) {
        var meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
        document.head.appendChild(meta);
    }

    var css = '' +
        '#lp-chat-widget, #lp-chat-widget *, #lp-chat-widget *::before, #lp-chat-widget *::after { margin: 0 !important; padding: 0 !important; box-sizing: border-box !important; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important; line-height: normal !important; }' +
        '#lp-chat-widget { position: fixed !important; bottom: 24px !important; right: 24px !important; z-index: 999999 !important; }' +
        '#lp-chat-widget .lp-window.lp-hidden { display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; }' +
        '#lp-chat-widget .lp-toggle { width: 62px !important; height: 62px !important; border-radius: 50% !important; background: #2e7d32 !important; border: none !important; cursor: pointer !important; display: flex !important; align-items: center !important; justify-content: center !important; box-shadow: 0 4px 20px rgba(46,125,50,0.45) !important; transition: transform 0.3s, box-shadow 0.3s !important; touch-action: manipulation !important; }' +
        '#lp-chat-widget .lp-toggle:hover { transform: scale(1.08) !important; box-shadow: 0 6px 28px rgba(46,125,50,0.55) !important; }' +
        '#lp-chat-widget .lp-toggle svg { width: 28px !important; height: 28px !important; fill: white !important; }' +
        '#lp-chat-widget .lp-window { position: fixed !important; bottom: 104px !important; right: 24px !important; width: 375px !important; height: 560px !important; background: white !important; border-radius: 18px !important; box-shadow: 0 10px 40px rgba(0,0,0,0.15) !important; display: flex !important; flex-direction: column !important; overflow: hidden !important; border: 1px solid #e8e8e8 !important; }' +
        '#lp-chat-widget .lp-header { background: #2e7d32 !important; padding: 14px 18px !important; color: white !important; display: flex !important; justify-content: space-between !important; align-items: center !important; min-height: 64px !important; flex-shrink: 0 !important; }' +
        '#lp-chat-widget .lp-header-info { display: flex !important; align-items: center !important; gap: 11px !important; flex: 1 !important; }' +
        '#lp-chat-widget .lp-avatar { width: 42px !important; height: 42px !important; background: rgba(255,255,255,0.2) !important; border-radius: 50% !important; display: flex !important; align-items: center !important; justify-content: center !important; font-weight: 600 !important; font-size: 15px !important; color: white !important; flex-shrink: 0 !important; border: 2px solid rgba(255,215,0,0.6) !important; }' +
        '#lp-chat-widget .lp-title { display: flex !important; flex-direction: column !important; }' +
        '#lp-chat-widget .lp-name { font-weight: 600 !important; font-size: 15px !important; color: white !important; }' +
        '#lp-chat-widget .lp-status { font-size: 11px !important; color: rgba(255,255,255,0.85) !important; display: flex !important; align-items: center !important; gap: 5px !important; margin-top: 2px !important; }' +
        '#lp-chat-widget .lp-dot { width: 7px !important; height: 7px !important; background: #FFD700 !important; border-radius: 50% !important; display: inline-block !important; }' +
        '#lp-chat-widget .lp-header-actions { display: flex !important; align-items: center !important; gap: 6px !important; }' +
        '#lp-chat-widget .lp-btn { width: 34px !important; height: 34px !important; border-radius: 50% !important; background: rgba(255,255,255,0.18) !important; border: none !important; cursor: pointer !important; display: flex !important; align-items: center !important; justify-content: center !important; transition: background 0.2s !important; touch-action: manipulation !important; }' +
        '#lp-chat-widget .lp-btn:hover { background: rgba(255,255,255,0.3) !important; }' +
        '#lp-chat-widget .lp-btn svg { width: 18px !important; height: 18px !important; fill: white !important; }' +
        '#lp-chat-widget .lp-messages { flex: 1 !important; overflow-y: auto !important; padding: 12px !important; display: flex !important; flex-direction: column !important; gap: 8px !important; background: #f5f7f5 !important; -webkit-overflow-scrolling: touch !important; overscroll-behavior: contain !important; touch-action: pan-y !important; }' +
        '#lp-chat-widget .lp-msg { max-width: 88% !important; display: flex !important; flex-direction: column !important; }' +
        '#lp-chat-widget .lp-msg-content { padding: 10px 14px !important; border-radius: 16px !important; font-size: 14px !important; line-height: 1.55 !important; word-wrap: break-word !important; }' +
        '#lp-chat-widget .lp-msg-user { align-self: flex-end !important; align-items: flex-end !important; }' +
        '#lp-chat-widget .lp-msg-user .lp-msg-content { background: #2e7d32 !important; color: white !important; border-bottom-right-radius: 4px !important; }' +
        '#lp-chat-widget .lp-msg-bot { align-self: flex-start !important; align-items: flex-start !important; width: 100% !important; max-width: 100% !important; }' +
        '#lp-chat-widget .lp-msg-bot .lp-msg-content { background: white !important; color: #333 !important; border-bottom-left-radius: 4px !important; box-shadow: 0 1px 3px rgba(0,0,0,0.08) !important; width: 100% !important; }' +
        '#lp-chat-widget .lp-product-card { background: #f9fbf9 !important; border: 1px solid #d4edda !important; border-radius: 12px !important; padding: 12px 14px !important; margin: 6px 0 !important; }' +
        '#lp-chat-widget .lp-product-title { font-weight: 700 !important; font-size: 14px !important; color: #1b5e20 !important; margin-bottom: 4px !important; display: block !important; }' +
        '#lp-chat-widget .lp-product-desc { font-size: 13px !important; color: #555 !important; margin-bottom: 6px !important; display: block !important; }' +
        '#lp-chat-widget .lp-product-price { font-size: 15px !important; font-weight: 700 !important; color: #2e7d32 !important; margin-bottom: 8px !important; display: block !important; }' +
        '#lp-chat-widget .lp-product-warning { font-size: 12px !important; color: #e65100 !important; margin-bottom: 8px !important; display: block !important; }' +
        '#lp-chat-widget .lp-product-btn { display: inline-block !important; padding: 7px 16px !important; background: #2e7d32 !important; color: white !important; text-decoration: none !important; border-radius: 20px !important; font-size: 13px !important; font-weight: 600 !important; transition: background 0.2s !important; }' +
        '#lp-chat-widget .lp-product-btn:hover { background: #1b5e20 !important; color: white !important; text-decoration: none !important; }' +
        '#lp-chat-widget .lp-divider { border: none !important; border-top: 1px solid #e8e8e8 !important; margin: 4px 0 !important; }' +
        '#lp-chat-widget .lp-plain-text { white-space: pre-wrap !important; }' +
        '#lp-chat-widget .lp-typing { display: flex !important; gap: 4px !important; padding: 10px 14px !important; background: white !important; border-radius: 16px !important; border-bottom-left-radius: 4px !important; box-shadow: 0 1px 3px rgba(0,0,0,0.08) !important; align-self: flex-start !important; }' +
        '#lp-chat-widget .lp-typing span { width: 8px !important; height: 8px !important; background: #2e7d32 !important; border-radius: 50% !important; animation: lpBounce 1.4s infinite ease-in-out !important; }' +
        '#lp-chat-widget .lp-typing span:nth-child(1) { animation-delay: -0.32s !important; }' +
        '#lp-chat-widget .lp-typing span:nth-child(2) { animation-delay: -0.16s !important; }' +
        '@keyframes lpBounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }' +
        '#lp-chat-widget .lp-input-wrap { padding: 12px !important; background: white !important; border-top: 1px solid #eee !important; flex-shrink: 0 !important; }' +
        '#lp-chat-widget .lp-form { display: flex !important; gap: 8px !important; align-items: center !important; }' +
        '#lp-chat-widget .lp-input { flex: 1 !important; padding: 11px 16px !important; border: 1px solid #e0e0e0 !important; border-radius: 24px !important; font-size: 15px !important; outline: none !important; background: #fafafa !important; color: #333 !important; touch-action: manipulation !important; -webkit-appearance: none !important; }' +
        '#lp-chat-widget .lp-input:focus { border-color: #2e7d32 !important; box-shadow: 0 0 0 2px rgba(46,125,50,0.12) !important; background: white !important; }' +
        '#lp-chat-widget .lp-send { width: 44px !important; height: 44px !important; border-radius: 50% !important; background: #2e7d32 !important; border: none !important; cursor: pointer !important; display: flex !important; align-items: center !important; justify-content: center !important; flex-shrink: 0 !important; transition: transform 0.2s !important; }' +
        '#lp-chat-widget .lp-send:hover { transform: scale(1.05) !important; background: #1b5e20 !important; }' +
        '#lp-chat-widget .lp-send:disabled { opacity: 0.55 !important; cursor: not-allowed !important; transform: none !important; }' +
        '#lp-chat-widget .lp-send svg { width: 20px !important; height: 20px !important; fill: white !important; margin-left: 2px !important; }' +
        '#lp-chat-widget .lp-powered { text-align: center !important; padding: 6px !important; font-size: 11px !important; color: #aaa !important; background: white !important; border-top: 1px solid #f0f0f0 !important; flex-shrink: 0 !important; }' +
        '@media (max-width: 600px) {' +
        '#lp-chat-widget { bottom: 16px !important; right: 16px !important; }' +
        '#lp-chat-widget .lp-toggle.lp-mobile-hidden { display: none !important; }' +
        '#lp-chat-widget .lp-window { position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100% !important; height: 100% !important; height: 100dvh !important; max-height: 100dvh !important; border-radius: 0 !important; border: none !important; }' +
        '#lp-chat-widget .lp-header { padding: 14px 16px !important; padding-top: max(14px, env(safe-area-inset-top)) !important; }' +
        '#lp-chat-widget .lp-input-wrap { padding: 10px 12px !important; padding-bottom: max(10px, env(safe-area-inset-bottom)) !important; }' +
        '}' +
        'body.lp-chat-open { overflow: hidden !important; position: fixed !important; width: 100% !important; height: 100% !important; }';

    var html = '<div id="lp-chat-widget">' +
        '<button class="lp-toggle" aria-label="Abrir chat con Cristina">' +
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/><path d="M7 9h10v2H7zm0-3h10v2H7z"/></svg>' +
        '</button>' +
        '<div class="lp-window lp-hidden">' +
        '<div class="lp-header">' +
        '<div class="lp-header-info">' +
        '<div class="lp-avatar">CM</div>' +
        '<div class="lp-title">' +
        '<span class="lp-name">Cristina Mesa</span>' +
        '<span class="lp-status"><span class="lp-dot"></span> En línea · Lipoplay</span>' +
        '</div>' +
        '</div>' +
        '<div class="lp-header-actions">' +
        '<button class="lp-btn lp-reset" aria-label="Nueva conversación" title="Nueva conversación"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg></button>' +
        '<button class="lp-btn lp-close" aria-label="Cerrar chat" title="Cerrar chat"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>' +
        '</div>' +
        '</div>' +
        '<div class="lp-messages"><div class="lp-msg lp-msg-bot"><div class="lp-msg-content">¡Hola! Soy Cristina 👋 ¿En qué puedo ayudarte hoy?</div></div></div>' +
        '<div class="lp-input-wrap">' +
        '<form class="lp-form"><input type="text" class="lp-input" placeholder="Escribe tu mensaje..." autocomplete="off"><button type="submit" class="lp-send" aria-label="Enviar mensaje"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button></form>' +
        '</div>' +
        '<div class="lp-powered">Asistente virtual · Lipoplay.cl</div>' +
        '</div>' +
        '</div>';

    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container.firstChild);

    var sessionId = sessionStorage.getItem('lp_chat_session');
    if (!sessionId) {
        sessionId = 'lp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('lp_chat_session', sessionId);
    }

    var widget = document.getElementById('lp-chat-widget');
    var isOpen = false;
    var isProcessing = false;
    var toggle = widget.querySelector('.lp-toggle');
    var chatWindow = widget.querySelector('.lp-window');
    var messages = widget.querySelector('.lp-messages');
    var form = widget.querySelector('.lp-form');
    var input = widget.querySelector('.lp-input');
    var sendBtn = widget.querySelector('.lp-send');
    var resetBtn = widget.querySelector('.lp-reset');
    var closeBtn = widget.querySelector('.lp-close');

    function isMobile() { return window.innerWidth <= 600; }

    function updateViewportHeight() {
        if (!isOpen || !isMobile()) return;
        if (window.visualViewport) {
            var vh = window.visualViewport.height;
            chatWindow.style.height = vh + 'px';
            chatWindow.style.maxHeight = vh + 'px';
            messages.scrollTop = messages.scrollHeight;
        }
    }

    function toggleChat() {
        isOpen = !isOpen;
        if (isOpen) {
            chatWindow.classList.remove('lp-hidden');
            if (isMobile()) {
                toggle.classList.add('lp-mobile-hidden');
                document.body.classList.add('lp-chat-open');
                updateViewportHeight();
            }
            setTimeout(function() { input.focus(); }, 100);
        } else {
            chatWindow.classList.add('lp-hidden');
            toggle.classList.remove('lp-mobile-hidden');
            document.body.classList.remove('lp-chat-open');
            chatWindow.style.height = '';
            chatWindow.style.maxHeight = '';
        }
    }

    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', updateViewportHeight);
        window.visualViewport.addEventListener('scroll', updateViewportHeight);
    }

    input.addEventListener('focus', function() {
        if (isMobile()) { setTimeout(function() { updateViewportHeight(); messages.scrollTop = messages.scrollHeight; }, 300); }
    });
    input.addEventListener('blur', function() {
        if (isMobile()) { setTimeout(updateViewportHeight, 100); }
    });

    function hasProductFormat(text) {
        return /\*\*.*\*\*/.test(text) && /\[Ver producto\]/i.test(text);
    }

    function parseProductBlocks(text) {
        var fragment = document.createDocumentFragment();
        var blocks = text.split(/---+/);
        blocks.forEach(function(block) {
            block = block.trim();
            if (!block) return;
            if (/\*\*.*\*\*/.test(block)) {
                var card = document.createElement('div');
                card.className = 'lp-product-card';
                var lines = block.split('\n');
                lines.forEach(function(line) {
                    line = line.trim();
                    if (!line) return;
                    var boldMatch = line.match(/^\*\*(.+)\*\*$/);
                    var priceMatch = line.match(/\*\*Precio:\s*(.+)\*\*/i) || line.match(/Precio:\s*(.+)/i);
                    var linkMatch = line.match(/\[Ver producto\]\((https?:\/\/[^\)]+)\)/i);
                    var warnMatch = line.match(/⚠️\s*(.+)/);
                    if (linkMatch) {
                        var btn = document.createElement('a');
                        btn.href = linkMatch[1];
                        btn.target = '_blank';
                        btn.rel = 'noopener noreferrer';
                        btn.className = 'lp-product-btn';
                        btn.textContent = '🛒 Ver producto';
                        card.appendChild(btn);
                    } else if (priceMatch) {
                        var price = document.createElement('span');
                        price.className = 'lp-product-price';
                        price.textContent = 'Precio: ' + priceMatch[1];
                        card.appendChild(price);
                    } else if (warnMatch) {
                        var warn = document.createElement('span');
                        warn.className = 'lp-product-warning';
                        warn.textContent = '⚠️ ' + warnMatch[1].replace(/^["']|["']$/g, '');
                        card.appendChild(warn);
                    } else if (boldMatch) {
                        var title = document.createElement('span');
                        title.className = 'lp-product-title';
                        title.textContent = boldMatch[1];
                        card.appendChild(title);
                    } else {
                        var desc = document.createElement('span');
                        desc.className = 'lp-product-desc';
                        desc.textContent = line;
                        card.appendChild(desc);
                    }
                });
                fragment.appendChild(card);
            } else {
                var p = document.createElement('span');
                p.className = 'lp-plain-text';
                p.textContent = block;
                fragment.appendChild(p);
            }
        });
        return fragment;
    }

    function parseSimpleMessage(text) {
        var fragment = document.createDocumentFragment();
        var urlRegex = /(https?:\/\/[^\s]+)/g;
        var boldRegex = /\*\*(.+?)\*\*/g;
        var parts = text.split(urlRegex);
        parts.forEach(function(part) {
            if (urlRegex.test(part)) {
                var btn = document.createElement('a');
                btn.href = part;
                btn.target = '_blank';
                btn.rel = 'noopener noreferrer';
                btn.className = 'lp-product-btn';
                btn.textContent = '🛒 Ver producto';
                fragment.appendChild(document.createElement('br'));
                fragment.appendChild(btn);
            } else {
                var sub = part.split(boldRegex);
                sub.forEach(function(s, i) {
                    if (i % 2 === 1) {
                        var b = document.createElement('strong');
                        b.textContent = s;
                        fragment.appendChild(b);
                    } else if (s) {
                        fragment.appendChild(document.createTextNode(s));
                    }
                });
            }
        });
        urlRegex.lastIndex = 0;
        return fragment;
    }

    function appendMessage(text, sender) {
        var div = document.createElement('div');
        div.className = 'lp-msg ' + (sender === 'user' ? 'lp-msg-user' : 'lp-msg-bot');
        var content = document.createElement('div');
        content.className = 'lp-msg-content';
        if (sender === 'bot') {
            if (hasProductFormat(text)) {
                content.appendChild(parseProductBlocks(text));
            } else {
                content.appendChild(parseSimpleMessage(text));
            }
        } else {
            content.textContent = text;
        }
        div.appendChild(content);
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }

    function showTyping() {
        var div = document.createElement('div');
        div.className = 'lp-typing';
        div.id = 'lp-typing-indicator';
        div.innerHTML = '<span></span><span></span><span></span>';
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }

    function removeTyping() {
        var typing = document.getElementById('lp-typing-indicator');
        if (typing) typing.remove();
    }

    function resetChat() {
        sessionId = 'lp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('lp_chat_session', sessionId);
        messages.innerHTML = '';
        appendMessage('¡Hola! Soy Cristina 👋 ¿En qué puedo ayudarte hoy?', 'bot');
        input.focus();
    }

    async function sendMessage(message) {
        isProcessing = true;
        sendBtn.disabled = true;
        input.value = '';
        appendMessage(message, 'user');
        showTyping();
        try {
            var response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: message, session_id: sessionId, timestamp: new Date().toISOString() })
            });
            removeTyping();
            if (!response.ok) throw new Error('Error');
            var responseText = await response.text();
            var reply = '';
            try {
                var data = JSON.parse(responseText);
                reply = data.reply || data.response || data.message || data.text || responseText;
            } catch (e) { reply = responseText; }
            if (reply && reply.trim() && reply.toLowerCase() !== 'accepted') {
                appendMessage(reply, 'bot');
            } else {
                appendMessage('Disculpa, no pude procesar tu mensaje. Intenta de nuevo.', 'bot');
            }
        } catch (error) {
            removeTyping();
            appendMessage('Lo siento, ocurrió un error. Por favor intenta de nuevo.', 'bot');
        } finally {
            isProcessing = false;
            sendBtn.disabled = false;
            input.focus();
        }
    }

    toggle.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);
    resetBtn.addEventListener('click', resetChat);
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        var message = input.value.trim();
        if (message && !isProcessing) sendMessage(message);
    });
})();
