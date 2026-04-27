/**
 * eMerge AI Engine
 *
 * Powers both the persistent chat widget (chat.html, all pages in chat mode)
 * and the immersive full AI experience (/ai). Supports:
 *   - Text input
 *   - Voice input (Web Speech API SpeechRecognition)
 *   - Voice output (speechSynthesis)
 *   - Action dispatch (navigate, fill form, submit form, scroll, etc.)
 *   - Server LLM via /api/chat with graceful local fallback
 */

(function () {
  const PAGES = {
    home: '/',
    services: '/#services',
    connectors: '/connectors.html',
    implementation: '/implementation.html',
    support: '/support.html',
    customization: '/customization.html',
    // legacy pillar names (kept so AI/links from older content still resolve)
    stabilization: '/support.html',
    optimization: '/customization.html',
    rescue: '/implementation.html',
    'technical-debt': '/customization.html',
    technical_debt: '/customization.html',
    contact: '/contact.html',
    chat: '/chat.html',
    'full-ai': '/ai',
    ai: '/ai',
    index: '/',
  };

  const KNOWLEDGE = {
    company:
      "eMerge Solutions is a NetSuite specialist firm with a library of 80+ pre-built connectors plus implementation, support and customization services. We turn 6-week integrations into 6-day connector deployments.",
    pillars: {
      connectors:
        'Our connector library covers 80+ pre-built NetSuite integrations: CRM (Salesforce, HubSpot), eCommerce (Shopify, BigCommerce), payments (Stripe), tax (Avalara), logistics (ShipStation), EDI, banking, and BI. Each is monitored, maintained, and deployed in days.',
      implementation:
        'NetSuite implementation: fixed-scope phase one go-lives. Discovery, configuration, data migration, training, hyper-care. Also for new module rollouts and stalled implementations.',
      support:
        'Managed NetSuite support with SLAs. Tiers from on-demand to embedded. Named consultants, release coverage, connector monitoring, quarterly health checks.',
      customization:
        'SuiteScript 2.1, SuiteFlow, custom records and workbooks, custom UIs. Source-controlled with SDF. Built so the admin reading the code in two years can still maintain it.',
    },
    connectors: [
      'Salesforce', 'HubSpot', 'Shopify', 'BigCommerce', 'Stripe', 'Avalara',
      'ShipStation', 'EDI (X12, EDIFACT)', 'Banking & Plaid', 'Snowflake'
    ],
    differentiators: [
      'A connector library, not bespoke integrations — time-to-value in days, not months.',
      'NetSuite specialists end-to-end. Hands-on with SuiteScript, SuiteFlow, and SuiteAnalytics.',
      'Empathy first: when NetSuite is failing, it is almost always a configuration issue, not a personal failure.',
    ],
  };

  // ---------- Page context (sent to model) ----------
  function getPageContext() {
    return {
      path: location.pathname,
      title: document.title,
      heading: (document.querySelector('main h1') || document.querySelector('h1') || {}).textContent || '',
      hasContactForm: !!document.getElementById('contact-form'),
    };
  }

  // ---------- Voice (Web Speech API) ----------
  function makeRecognizer(onResult, onEnd) {
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Rec) return null;
    const rec = new Rec();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (e) => onResult(e.results[0][0].transcript);
    rec.onend = onEnd;
    rec.onerror = onEnd;
    return rec;
  }
  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.05;
      u.pitch = 1;
      window.speechSynthesis.speak(u);
    } catch (_) { /* ignore */ }
  }

  // ---------- Local intent fallback ----------
  function localIntent(text) {
    const t = text.toLowerCase();
    // Navigation
    const navMatch =
      /(go to|open|navigate to|take me to|show( me)?)\s+(the\s+)?(home|services?|stabili[sz]ation|optimi[sz]ation|rescue|technical[\s-]?debt|contact|chat|ai|full ai)/i.exec(t);
    if (navMatch) {
      const target = navMatch[4].replace(/\s+/g, '-');
      const key = target.includes('debt') ? 'technical-debt'
        : target.includes('ai') ? 'full-ai'
        : target.includes('servic') ? 'services'
        : target.includes('stabil') ? 'stabilization'
        : target.includes('optim') ? 'optimization'
        : target.includes('rescue') ? 'rescue'
        : target.includes('contact') ? 'contact'
        : target.includes('chat') ? 'chat'
        : 'home';
      return {
        reply: `Taking you to the ${key.replace('-', ' ')} page.`,
        actions: [{ type: 'navigate', target: key }],
      };
    }

    // Contact / book
    if (/\b(contact|book|schedule|talk to|call|consult|reach out|email)\b/.test(t)) {
      return {
        reply: "Opening our contact form. Want me to fill it in for you? Just say something like 'fill in name Jane email jane@acme.com'.",
        actions: [{ type: 'navigate', target: 'contact' }],
      };
    }

    // Fill form parsing
    const nameM = /name\s+(?:is\s+)?([A-Z][A-Za-z'.\- ]{1,40}?)(?=,|\sand\b|\semail\b|\smessage\b|$)/i.exec(text);
    const emailM = /([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/.exec(text);
    const msgM = /(?:message|note|say|tell them)\s+(?:is\s+)?(.+?)$/i.exec(text);
    if (nameM || emailM || msgM) {
      const fields = {};
      if (nameM) fields.name = nameM[1].trim();
      if (emailM) fields.email = emailM[1].trim();
      if (msgM) fields.message = msgM[1].trim();
      return {
        reply: `Filling in ${Object.keys(fields).join(', ')}. Say 'submit' when you're ready to send.`,
        actions: [
          { type: 'navigate-if-needed', target: 'contact' },
          { type: 'fill-contact', fields },
        ],
      };
    }
    if (/\b(submit|send it|send the form|fire away)\b/.test(t)) {
      return { reply: 'Submitting the form now.', actions: [{ type: 'submit-contact' }] };
    }

    // Knowledge
    if (/\b(who are you|what.{0,5}emerge|what do you do|services?)\b/.test(t)) {
      return {
        reply:
          KNOWLEDGE.company +
          ' We offer Connectors, Implementation, Support, and Customization.',
        actions: [],
      };
    }
    // Connector lookup
    const connMatch = KNOWLEDGE.connectors.find((c) => t.includes(c.toLowerCase().split(' ')[0]));
    if (connMatch || /connect|integrat|sync/.test(t)) {
      return {
        reply: connMatch
          ? `Yes — ${connMatch} is one of our pre-built NetSuite connectors. We can deploy it in days. Want to see the connector library?`
          : KNOWLEDGE.pillars.connectors + ' Want to browse the library?',
        actions: [{ type: 'navigate', target: 'connectors' }],
      };
    }
    if (/implement|go.?live|new netsuite|module/.test(t)) return { reply: KNOWLEDGE.pillars.implementation, actions: [{ type: 'navigate', target: 'implementation' }] };
    if (/support|managed|sla|admin/.test(t)) return { reply: KNOWLEDGE.pillars.support, actions: [{ type: 'navigate', target: 'support' }] };
    if (/custom|suitescript|suite ?flow|workflow|workbook/.test(t)) return { reply: KNOWLEDGE.pillars.customization, actions: [{ type: 'navigate', target: 'customization' }] };
    if (/saved search|odbc|suiteanalytics/.test(t)) {
      return {
        reply:
          'NetSuite specifics like saved searches, SuiteAnalytics workbooks, and ODBC / SuiteAnalytics Connect are core to our customization and connector work. Want to talk to a consultant?',
        actions: [{ type: 'suggest', target: 'contact' }],
      };
    }
    if (/why (you|emerge)|independent|unbiased|license/.test(t)) {
      return { reply: KNOWLEDGE.differentiators.join(' '), actions: [] };
    }

    return {
      reply:
        "I can navigate the site, explain our NetSuite services (Stabilization, Optimization, Rescue, Technical Debt), or fill out the contact form for you. What would you like to do?",
      actions: [],
    };
  }

  // ---------- Action dispatcher ----------
  function dispatch(actions) {
    if (!actions || !actions.length) return;
    for (const a of actions) {
      try { runAction(a); } catch (e) { console.warn('action failed', a, e); }
    }
  }
  function runAction(a) {
    switch (a.type) {
      case 'navigate': {
        const url = PAGES[a.target] || a.target;
        if (location.pathname !== url.split('#')[0]) {
          location.href = url;
        } else if (url.includes('#')) {
          const id = url.split('#')[1];
          const el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
        return;
      }
      case 'navigate-if-needed': {
        const url = PAGES[a.target] || a.target;
        const onContact = location.pathname.endsWith('/contact.html') || location.pathname === '/contact.html';
        if (a.target === 'contact' && !onContact) {
          // store fill-contact intent for next page
          const next = sessionStorage.getItem('emerge_pending_actions');
          const list = next ? JSON.parse(next) : [];
          list.push({ type: 'fill-contact-pending' });
          sessionStorage.setItem('emerge_pending_actions', JSON.stringify(list));
          location.href = url;
        }
        return;
      }
      case 'fill-contact': {
        const fields = a.fields || {};
        const onContact = !!document.getElementById('contact-form');
        if (!onContact) {
          sessionStorage.setItem('emerge_contact_fields', JSON.stringify(fields));
          location.href = PAGES.contact;
          return;
        }
        if (fields.name) setVal('#name', fields.name);
        if (fields.email) setVal('#email', fields.email);
        if (fields.message) setVal('#message', fields.message);
        return;
      }
      case 'submit-contact': {
        const f = document.getElementById('contact-form');
        if (!f) {
          sessionStorage.setItem('emerge_submit_pending', '1');
          location.href = PAGES.contact;
          return;
        }
        f.requestSubmit();
        return;
      }
      case 'scroll-to': {
        const el = document.getElementById(a.target);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      case 'read-page': {
        const text = document.querySelector('main')?.innerText || '';
        speak(text.slice(0, 1200));
        return;
      }
      case 'suggest':
        return; // pure suggestion (chip rendering handled in UI)
      default:
        return;
    }
  }
  function setVal(sel, value) {
    const el = document.querySelector(sel);
    if (!el) return;
    el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // Run any cross-page pending actions
  function consumePending() {
    const fields = sessionStorage.getItem('emerge_contact_fields');
    if (fields && document.getElementById('contact-form')) {
      try { runAction({ type: 'fill-contact', fields: JSON.parse(fields) }); } catch (_) {}
      sessionStorage.removeItem('emerge_contact_fields');
    }
    if (sessionStorage.getItem('emerge_submit_pending') && document.getElementById('contact-form')) {
      sessionStorage.removeItem('emerge_submit_pending');
      // give the user a moment to see the prefilled form
      setTimeout(() => runAction({ type: 'submit-contact' }), 600);
    }
  }
  document.addEventListener('DOMContentLoaded', consumePending);

  // ---------- Server call ----------
  async function callServer(messages, context) {
    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, context }),
      });
      if (!r.ok) throw new Error('status ' + r.status);
      const data = await r.json();
      if (data && data.reply) return data;
      throw new Error('bad shape');
    } catch (e) {
      return null;
    }
  }

  // ---------- UI factory ----------
  function createWidget(opts = {}) {
    const mount = opts.mount || document.body;
    const mode = opts.mode || 'launcher'; // 'launcher' | 'embedded'
    const titleText = opts.title || 'Ask eMerge';
    const intro = opts.intro ||
      "Hi! I'm your eMerge guide. Ask about NetSuite services, or tell me what you need (e.g. 'I have failing saved searches'). I can also navigate the site for you.";

    const launcher = mode === 'launcher' ? document.createElement('button') : null;
    if (launcher) {
      launcher.className = 'chat-launcher';
      launcher.setAttribute('aria-label', 'Open chat');
      launcher.innerHTML = '<span aria-hidden="true">💬</span> <span>Chat with us</span>';
      mount.appendChild(launcher);
    }

    const box = document.createElement('div');
    box.className = mode === 'embedded' ? 'ai-frame' : 'chat-widget';
    box.innerHTML = `
      <div class="chat-header">
        <div><strong>${titleText}</strong> <span class="pill" id="ce-mode">${opts.modePill || 'AI'}</span></div>
        <div class="controls">
          <button type="button" id="ce-mute" aria-pressed="false" aria-label="Toggle voice replies" title="Voice replies">🔊</button>
          ${mode === 'launcher' ? '<button type="button" id="ce-close" aria-label="Close chat">×</button>' : ''}
        </div>
      </div>
      <div class="chat-messages" id="ce-messages" aria-live="polite"></div>
      <div class="chat-suggestions" id="ce-suggestions"></div>
      <div class="chat-input">
        <button type="button" class="icon-btn" id="ce-mic" aria-pressed="false" aria-label="Hold to speak" title="Voice input">🎤</button>
        <input type="text" id="ce-input" placeholder="Ask anything, or say 'go to rescue'…" autocomplete="off" />
        <button type="button" id="ce-send">Send</button>
      </div>
    `;
    mount.appendChild(box);

    const messagesEl = box.querySelector('#ce-messages');
    const input = box.querySelector('#ce-input');
    const send = box.querySelector('#ce-send');
    const mic = box.querySelector('#ce-mic');
    const muteBtn = box.querySelector('#ce-mute');
    const close = box.querySelector('#ce-close');
    const suggestionsEl = box.querySelector('#ce-suggestions');

    let voiceOn = false; // off by default — only speaks if user enables
    let history = [];

    function appendMessage(role, text, opts = {}) {
      const el = document.createElement('div');
      el.className = `chat-msg ${role}`;
      el.textContent = text;
      if (opts.actionChip) {
        const chip = document.createElement('span');
        chip.className = 'action-chip';
        chip.textContent = opts.actionChip;
        el.appendChild(document.createElement('br'));
        el.appendChild(chip);
      }
      messagesEl.appendChild(el);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
    function showTyping() {
      const t = document.createElement('div');
      t.className = 'typing';
      t.id = 'ce-typing';
      t.innerHTML = '<span></span><span></span><span></span>';
      messagesEl.appendChild(t);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
    function hideTyping() {
      document.getElementById('ce-typing')?.remove();
    }

    function setSuggestions(items) {
      suggestionsEl.innerHTML = '';
      (items || []).forEach((s) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = s.label;
        b.addEventListener('click', () => handle(s.text || s.label));
        suggestionsEl.appendChild(b);
      });
    }
    setSuggestions(opts.suggestions || [
      { label: 'Stabilization', text: 'Tell me about NetSuite stabilization' },
      { label: 'Rescue', text: 'My implementation is failing' },
      { label: 'Book a call', text: 'I want to contact you' },
    ]);

    appendMessage('bot', intro);

    async function handle(text) {
      if (!text || !text.trim()) return;
      appendMessage('user', text);
      history.push({ role: 'user', content: text });
      input.value = '';
      showTyping();

      const ctx = getPageContext();
      let result = await callServer(history, ctx);
      if (!result) {
        result = localIntent(text);
        if (result) result.source = 'local';
      } else {
        result.source = 'server';
      }
      hideTyping();

      const reply = result?.reply || "Sorry, I didn't catch that.";
      const actions = result?.actions || [];
      const chipText = actions.length ? actions.map((a) => a.type + (a.target ? ':' + a.target : '')).join(' · ') : '';
      appendMessage('bot', reply, { actionChip: chipText || undefined });
      history.push({ role: 'assistant', content: reply });
      if (voiceOn) speak(reply);
      // small delay so the user reads before the page jumps
      setTimeout(() => dispatch(actions), 400);
    }

    send.addEventListener('click', () => handle(input.value));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); handle(input.value); }
    });

    // Voice replies toggle
    muteBtn.addEventListener('click', () => {
      voiceOn = !voiceOn;
      muteBtn.setAttribute('aria-pressed', String(voiceOn));
      muteBtn.textContent = voiceOn ? '🔈' : '🔊';
      muteBtn.title = voiceOn ? 'Voice replies on' : 'Voice replies off';
      if (!voiceOn && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    });

    // Voice input — single shot
    let listening = false;
    let rec = null;
    mic.addEventListener('click', () => {
      if (listening) {
        rec?.stop();
        return;
      }
      rec = makeRecognizer(
        (transcript) => { input.value = transcript; handle(transcript); },
        () => {
          listening = false;
          mic.setAttribute('aria-pressed', 'false');
          mic.textContent = '🎤';
        }
      );
      if (!rec) {
        appendMessage('system', 'Voice input not supported in this browser. Try Chrome or Edge.');
        return;
      }
      listening = true;
      mic.setAttribute('aria-pressed', 'true');
      mic.textContent = '🛑';
      rec.start();
    });

    if (close && launcher) {
      close.addEventListener('click', () => {
        box.classList.remove('open');
        launcher.classList.remove('hidden');
      });
      launcher.addEventListener('click', () => {
        box.classList.add('open');
        launcher.classList.add('hidden');
        setTimeout(() => input.focus(), 50);
      });
    }
    if (mode === 'embedded') {
      box.classList.add('open');
      setTimeout(() => input.focus(), 100);
    }

    return { box, handle };
  }

  // ---------- Persistent mode-toggle bubble ----------
  // Shown on every non-AI page. Lets users cycle Normal ↔ Chat ↔ AI.
  function currentMode() {
    if (location.pathname === '/ai' || location.pathname.endsWith('/ai.html')) return 'ai';
    if (sessionStorage.getItem('emerge_chat_mode') === '1') return 'chat';
    return 'normal';
  }
  function mountModeToggle() {
    if (location.pathname === '/ai' || location.pathname.endsWith('/ai.html')) return; // /ai has its own back affordance
    if (document.querySelector('.mode-toggle')) return; // already mounted
    const mode = currentMode();

    const bubble = document.createElement('button');
    bubble.className = 'mode-toggle';
    bubble.type = 'button';
    bubble.setAttribute('aria-haspopup', 'menu');
    bubble.setAttribute('aria-expanded', 'false');
    bubble.innerHTML = `<span class="spark"></span> <span class="label">${labelFor(mode)}</span>`;

    const menu = document.createElement('div');
    menu.className = 'mode-menu';
    menu.setAttribute('role', 'menu');
    menu.innerHTML = `
      <button type="button" data-mode="normal" role="menuitem" aria-current="${mode === 'normal'}">
        📄 Classic site ${mode === 'normal' ? '<span class="pill-active">current</span>' : ''}
      </button>
      <button type="button" data-mode="chat" role="menuitem" aria-current="${mode === 'chat'}">
        💬 Chat alongside ${mode === 'chat' ? '<span class="pill-active">current</span>' : ''}
      </button>
      <button type="button" data-mode="ai" role="menuitem" aria-current="${mode === 'ai'}">
        ✦ Full AI experience
      </button>
      <div class="menu-hint">Switch any time. Your place on the page is kept.</div>
    `;

    document.body.appendChild(bubble);
    document.body.appendChild(menu);

    bubble.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      bubble.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target) && !bubble.contains(e.target)) {
        menu.classList.remove('open');
        bubble.setAttribute('aria-expanded', 'false');
      }
    });

    menu.querySelectorAll('button[data-mode]').forEach((b) => {
      b.addEventListener('click', () => {
        const target = b.dataset.mode;
        const onChatLanding = location.pathname.endsWith('/chat.html');
        if (target === 'normal') {
          disableChatMode();
          // Leave the chat-landing page so it doesn't re-enable chat mode on load
          if (onChatLanding) location.href = '/';
          else location.reload();
        } else if (target === 'chat') {
          enableChatMode();
          if (onChatLanding) location.href = '/'; // already in chat mode; show it on home
          else location.reload();
        } else if (target === 'ai') {
          location.href = '/ai';
        }
      });
    });
  }
  function labelFor(mode) {
    if (mode === 'chat') return 'Chat mode · switch';
    if (mode === 'ai') return 'AI mode · switch';
    return '✦ Try AI mode';
  }

  // ---------- Auto-mount persistent chat across pages ----------
  // chat.html (or any page) can call eMergeAI.enableChatMode() to set a session
  // flag; subsequent page loads with ai-engine.js will auto-spawn the launcher.
  function enableChatMode() {
    sessionStorage.setItem('emerge_chat_mode', '1');
  }
  function disableChatMode() {
    sessionStorage.removeItem('emerge_chat_mode');
  }
  function isChatMode() {
    return sessionStorage.getItem('emerge_chat_mode') === '1';
  }
  function autoMount() {
    if (!isChatMode()) return;
    // Don't auto-mount on the full-ai page (it has its own embedded widget)
    if (location.pathname === '/ai' || location.pathname.endsWith('/ai.html')) return;
    // Don't double-mount
    if (document.querySelector('.chat-launcher') || document.querySelector('.chat-widget')) return;
    createWidget({ mode: 'launcher', title: 'Ask eMerge', modePill: 'NetSuite AI' });
  }
  document.addEventListener('DOMContentLoaded', autoMount);

  // Expose
  window.eMergeAI = {
    createWidget,
    speak,
    dispatch,
    PAGES,
    enableChatMode,
    disableChatMode,
    isChatMode,
    mountModeToggle,
    currentMode,
  };
})();
