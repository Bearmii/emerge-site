/**
 * Immersive /ai page driver.
 *
 * Composes the orb (4 visual states), background particle field, mic
 * waveform, and word-by-word reply rendering. Speaks via /api/chat with
 * fallback to the local intent matcher exposed by ai-engine.js.
 */

(() => {
  const orbEl = document.getElementById('orb');
  const utteranceEl = document.getElementById('ai-utterance');
  const historyEl = document.getElementById('ai-history');
  const historyToggleEl = document.getElementById('ai-history-toggle');
  const suggestionsEl = document.getElementById('ai-suggestions');
  const inputEl = document.getElementById('ai-input');
  const sendBtn = document.getElementById('ai-send');
  const micBtn = document.getElementById('ai-mic');
  const muteBtn = document.getElementById('ai-mute');
  const bgCanvas = document.getElementById('ai-bg-canvas');
  const orbWaveCanvas = document.getElementById('orb-wave');

  if (!orbEl) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- State machine ----------
  let orbState = 'idle';
  function setOrbState(s) {
    orbState = s;
    orbEl.classList.remove('is-idle', 'is-listening', 'is-thinking', 'is-speaking');
    orbEl.classList.add('is-' + s);
    orbEl.dataset.state = s;
  }
  setOrbState('idle');

  // ---------- Conversation history ----------
  const history = [];
  let voiceOn = false;

  // ---------- Word-by-word renderer ----------
  let renderToken = 0;
  function renderUtterance(text) {
    renderToken++;
    const my = renderToken;
    utteranceEl.classList.remove('dim');
    utteranceEl.innerHTML = '';
    const words = text.split(/(\s+)/);
    let delay = 0;
    words.forEach((w) => {
      if (!w.trim()) {
        utteranceEl.appendChild(document.createTextNode(w));
        return;
      }
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = w;
      span.style.animationDelay = `${delay}ms`;
      utteranceEl.appendChild(span);
      delay += reduceMotion ? 0 : 35;
    });
    if (my !== renderToken) return; // superseded
  }

  function dimUtterance() {
    utteranceEl.classList.add('dim');
  }

  function pushHistory(role, text) {
    history.push({ role, content: text });
    const div = document.createElement('div');
    div.className = 'turn ' + role;
    div.textContent = (role === 'user' ? 'You: ' : '') + text;
    historyEl.appendChild(div);
    historyEl.scrollTop = historyEl.scrollHeight;
  }

  historyToggleEl.addEventListener('click', () => {
    const open = historyEl.classList.toggle('open');
    historyToggleEl.textContent = open ? 'Hide history' : 'Show history';
  });

  // ---------- Speech synthesis with state binding ----------
  function speakReply(text) {
    if (!voiceOn || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.05;
      u.onstart = () => setOrbState('speaking');
      u.onend = () => setOrbState('idle');
      u.onerror = () => setOrbState('idle');
      window.speechSynthesis.speak(u);
    } catch (_) { /* noop */ }
  }

  muteBtn.addEventListener('click', () => {
    voiceOn = !voiceOn;
    muteBtn.setAttribute('aria-pressed', String(voiceOn));
    muteBtn.textContent = voiceOn ? '🔈 Voice on' : '🔊 Voice off';
    if (!voiceOn && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  });

  // ---------- Voice input + waveform ----------
  let audioCtx = null, analyser = null, micStream = null, waveRAF = null;
  function startWave() {
    if (!analyser) return;
    const ctx2d = orbWaveCanvas.getContext('2d');
    const w = orbWaveCanvas.width = orbWaveCanvas.clientWidth;
    const h = orbWaveCanvas.height = orbWaveCanvas.clientHeight;
    const buf = new Uint8Array(analyser.frequencyBinCount);
    function draw() {
      analyser.getByteTimeDomainData(buf);
      ctx2d.clearRect(0, 0, w, h);
      ctx2d.lineWidth = 2;
      ctx2d.strokeStyle = 'rgba(255, 220, 180, 0.85)';
      ctx2d.beginPath();
      const slice = w / buf.length;
      for (let i = 0; i < buf.length; i++) {
        const v = (buf[i] - 128) / 128;
        const y = h / 2 + v * (h * 0.35);
        if (i === 0) ctx2d.moveTo(0, y);
        else ctx2d.lineTo(i * slice, y);
      }
      ctx2d.stroke();
      waveRAF = requestAnimationFrame(draw);
    }
    draw();
  }
  function stopWave() {
    if (waveRAF) cancelAnimationFrame(waveRAF);
    waveRAF = null;
    if (orbWaveCanvas.getContext('2d')) {
      const c = orbWaveCanvas.getContext('2d');
      c.clearRect(0, 0, orbWaveCanvas.width, orbWaveCanvas.height);
    }
  }

  async function startListening() {
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const src = audioCtx.createMediaStreamSource(micStream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 1024;
      src.connect(analyser);
      startWave();
    } catch (e) { /* no mic permission — waveform just stays empty */ }
  }
  function stopListening() {
    stopWave();
    if (micStream) {
      micStream.getTracks().forEach((t) => t.stop());
      micStream = null;
    }
  }

  let rec = null, listening = false;
  micBtn.addEventListener('click', async () => {
    if (listening) {
      rec?.stop();
      return;
    }
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Rec) {
      renderUtterance("Voice input isn't supported in this browser. Try Chrome or Edge — or just type.");
      return;
    }
    rec = new Rec();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.continuous = false;
    rec.onstart = () => {
      listening = true;
      micBtn.setAttribute('aria-pressed', 'true');
      micBtn.textContent = '🛑';
      setOrbState('listening');
      startListening();
    };
    rec.onresult = (e) => {
      const t = e.results[0][0].transcript;
      inputEl.value = t;
      handle(t);
    };
    rec.onend = rec.onerror = () => {
      listening = false;
      micBtn.setAttribute('aria-pressed', 'false');
      micBtn.textContent = '🎤';
      stopListening();
      if (orbState === 'listening') setOrbState('idle');
    };
    rec.start();
  });

  // ---------- Background particle field ----------
  function startBg() {
    if (reduceMotion) return;
    const ctx2d = bgCanvas.getContext('2d');
    let w, h;
    function size() {
      w = bgCanvas.width = window.innerWidth * window.devicePixelRatio;
      h = bgCanvas.height = window.innerHeight * window.devicePixelRatio;
      bgCanvas.style.width = window.innerWidth + 'px';
      bgCanvas.style.height = window.innerHeight + 'px';
    }
    size();
    window.addEventListener('resize', size);

    const N = Math.min(180, Math.floor((window.innerWidth * window.innerHeight) / 12000));
    const particles = Array.from({ length: N }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      r: 0.6 + Math.random() * 1.6,
      hue: 200 + Math.random() * 60,
      a: 0.15 + Math.random() * 0.5,
    }));

    let mx = w / 2, my = h / 2;
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX * window.devicePixelRatio;
      my = e.clientY * window.devicePixelRatio;
    });

    function tick() {
      ctx2d.clearRect(0, 0, w, h);
      for (const p of particles) {
        // gentle pull toward mouse
        const dx = mx - p.x, dy = my - p.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 200000) {
          p.vx += (dx / Math.sqrt(d2)) * 0.0015;
          p.vy += (dy / Math.sqrt(d2)) * 0.0015;
        }
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        // damping
        p.vx *= 0.995; p.vy *= 0.995;

        ctx2d.beginPath();
        ctx2d.fillStyle = `hsla(${p.hue}, 90%, 70%, ${p.a})`;
        ctx2d.arc(p.x, p.y, p.r * window.devicePixelRatio, 0, Math.PI * 2);
        ctx2d.fill();
      }
      requestAnimationFrame(tick);
    }
    tick();
  }
  startBg();

  // ---------- Suggestions ----------
  const seedSuggestions = [
    { label: 'Find a connector', text: 'I need to integrate Salesforce with NetSuite — what do you have?' },
    { label: 'New NetSuite go-live', text: "We're starting a new NetSuite implementation — where do we begin?" },
    { label: 'Managed support', text: 'Tell me about your managed NetSuite support tiers.' },
    { label: 'Customization', text: 'I have a SuiteScript 2.1 customization need.' },
    { label: 'Book a call', text: 'I want to talk to a real person.' }
  ];
  function renderSuggestions(items) {
    suggestionsEl.innerHTML = '';
    (items || seedSuggestions).forEach((s) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = s.label;
      b.addEventListener('click', () => handle(s.text));
      suggestionsEl.appendChild(b);
    });
  }
  renderSuggestions();

  // ---------- Greeting ----------
  renderUtterance(
    "I'm the eMerge concierge. I can find the right NetSuite connector for your stack, answer questions, or set up a call. What are you trying to connect or fix?"
  );

  // ---------- Server / fallback ----------
  async function callServer(messages, context) {
    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, context }),
      });
      if (!r.ok) throw new Error(String(r.status));
      const data = await r.json();
      if (data && data.reply) return data;
      return null;
    } catch { return null; }
  }

  function localFallback(text) {
    // Reuse intents from ai-engine.js via window.eMergeAI? Engine doesn't expose
    // localIntent directly, so we replicate a slim version here keyed to the
    // new positioning.
    const t = text.toLowerCase();
    if (/connect|integrat|sync|talk to/.test(t)) {
      return {
        reply: "We have 80+ pre-built NetSuite connectors covering CRM (Salesforce, HubSpot), eCommerce (Shopify, BigCommerce), payments (Stripe), tax (Avalara), logistics (ShipStation), EDI, banking, and BI. Which system are you trying to connect to NetSuite?",
        actions: [{ type: 'navigate', target: 'connectors' }],
      };
    }
    if (/implement|go.?live|new netsuite/.test(t)) {
      return { reply: 'For a new NetSuite go-live we run a fixed-scope phase one — discovery, configuration, data migration, training, and hyper-care. Want details, or shall I open the implementation page?', actions: [{ type: 'navigate', target: 'implementation' }] };
    }
    if (/support|sla|managed|admin/.test(t)) {
      return { reply: 'Our managed support tiers are on-demand, standard (with SLAs), and embedded. Named consultants, not ticket-roulette. Open the page?', actions: [{ type: 'navigate', target: 'support' }] };
    }
    if (/custom|suitescript|suiteflow|workflow/.test(t)) {
      return { reply: 'We build SuiteScript 2.1, SuiteFlow, custom records and workbooks — designed so the next admin can read them. Want to see what we cover?', actions: [{ type: 'navigate', target: 'customization' }] };
    }
    if (/contact|book|talk|call|email/.test(t)) {
      return { reply: "Opening the contact form. Tell me your name and email and I'll fill it in.", actions: [{ type: 'navigate', target: 'contact' }] };
    }
    return {
      reply: "I can find a NetSuite connector, scope an implementation, explain our support tiers, or schedule a call. What's the situation?",
      actions: [],
    };
  }

  // ---------- Handle ----------
  async function handle(text) {
    if (!text || !text.trim()) return;
    inputEl.value = '';
    pushHistory('user', text);
    history.length > 1 && dimUtterance();
    setOrbState('thinking');

    const messages = history.slice();
    const ctx = { path: '/ai', title: 'eMerge AI Consultant', heading: 'AI Concierge' };

    let result = await callServer(messages, ctx);
    if (!result) result = localFallback(text);

    setOrbState('idle');
    renderUtterance(result.reply);
    pushHistory('assistant', result.reply);
    if (voiceOn) speakReply(result.reply);

    // Dispatch any actions via the shared engine (with a small delay so the
    // user sees the reply before any navigation).
    if (Array.isArray(result.actions) && result.actions.length && window.eMergeAI?.dispatch) {
      setTimeout(() => window.eMergeAI.dispatch(result.actions), 1100);
    }
  }

  sendBtn.addEventListener('click', () => handle(inputEl.value));
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handle(inputEl.value); }
  });

  // ---------- Keyboard shortcuts ----------
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { location.href = '/'; }
    if (e.key === '/' && document.activeElement !== inputEl) {
      e.preventDefault(); inputEl.focus();
    }
  });
})();
