/**
 * Strategiskskole.dk — AI Chat Widget
 * ------------------------------------
 * Indsæt følgende linje i bunden af <body> på alle dine HTML-sider
 * (eller lige inden </body>):
 *
 *   <script src="/chatbot.js"></script>
 *
 * VIGTIGT: Opdater WORKER_URL nedenfor med din Cloudflare Worker-URL,
 * efter du har deployet chatbot-worker.js.
 */

(function () {
  "use strict";

  // ─── Konfiguration ───────────────────────────────────────────────────────────
  const WORKER_URL = "https://strategi-chat.strategiskskole.workers.dev";
  const BRAND_COLOR = "#1a3a5c";      // Mørkeblå — tilpas til din branding
  const ACCENT_COLOR = "#2a6496";     // Lysere blå til hover og links
  const WELCOME_MSG  =
    "Hej! Jeg er din assistent på Strategiskskole.dk. " +
    "Stil mig gerne spørgsmål om strategisk skoleledelse, Thomas Kjerstens forløb eller " +
    "hvordan du booker et uforpligtende samtale. Hvordan kan jeg hjælpe dig?";

  // ─── Undgå dobbelt-initialisering ────────────────────────────────────────────
  if (document.getElementById("ssk-chat-root")) return;

  // ─── Hjælpefunktion: opret element med attributter ───────────────────────────
  function el(tag, attrs, ...children) {
    const node = document.createElement(tag);
    if (attrs) {
      Object.entries(attrs).forEach(([k, v]) => {
        if (k === "style" && typeof v === "object") {
          Object.assign(node.style, v);
        } else if (k.startsWith("on")) {
          node.addEventListener(k.slice(2), v);
        } else {
          node.setAttribute(k, v);
        }
      });
    }
    children.forEach((c) => {
      if (typeof c === "string") node.appendChild(document.createTextNode(c));
      else if (c) node.appendChild(c);
    });
    return node;
  }

  // ─── Tilstand ─────────────────────────────────────────────────────────────────
  let isOpen    = false;
  let isLoading = false;
  let history   = [];   // [{role:"user"|"assistant", content:"..."}]

  // ─── CSS ──────────────────────────────────────────────────────────────────────
  const style = el("style");
  style.textContent = `
    #ssk-chat-root * { box-sizing: border-box; font-family: 'Segoe UI', Arial, sans-serif; }

    /* Boble-knap */
    #ssk-bubble {
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      width: 58px; height: 58px; border-radius: 50%;
      background: ${BRAND_COLOR}; color: #fff;
      border: none; cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,0,0,0.25);
      display: flex; align-items: center; justify-content: center;
      transition: transform .2s, box-shadow .2s;
    }
    #ssk-bubble:hover { transform: scale(1.08); box-shadow: 0 6px 20px rgba(0,0,0,0.3); }
    #ssk-bubble svg { width: 28px; height: 28px; fill: #fff; }

    /* Notifikations-badge (skjult som standard) */
    #ssk-badge {
      position: absolute; top: 2px; right: 2px;
      width: 14px; height: 14px; border-radius: 50%;
      background: #e74c3c; border: 2px solid #fff;
      display: none;
    }

    /* Chat-vindue */
    #ssk-window {
      position: fixed; bottom: 96px; right: 24px; z-index: 9998;
      width: 360px; max-width: calc(100vw - 32px);
      height: 500px;
      max-height: calc(100vh - 120px);
      max-height: calc(100dvh - 120px);
      border-radius: 16px; overflow: hidden;
      background: #fff;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
      display: flex; flex-direction: column;
      transition: opacity .2s, transform .2s;
    }
    #ssk-window.ssk-hidden {
      opacity: 0; transform: translateY(12px) scale(.97); pointer-events: none;
    }

    /* Header */
    #ssk-header {
      background: ${BRAND_COLOR}; color: #fff;
      padding: 14px 16px; display: flex; align-items: center; gap: 10px;
      flex-shrink: 0;
    }
    #ssk-header-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: rgba(255,255,255,.15);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    #ssk-header-avatar svg { width: 20px; height: 20px; fill: #fff; }
    #ssk-header-title { font-weight: 700; font-size: 14px; line-height: 1.2; }
    #ssk-header-sub   { font-size: 11px; opacity: .8; margin-top: 1px; }
    #ssk-close {
      margin-left: auto; background: none; border: none; color: #fff;
      cursor: pointer; padding: 4px; border-radius: 6px; line-height: 1;
      opacity: .8; font-size: 20px; transition: opacity .15s;
    }
    #ssk-close:hover { opacity: 1; }

    /* Beskeder */
    #ssk-messages {
      flex: 1; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 10px;
      background: #f8f9fa;
    }
    #ssk-messages::-webkit-scrollbar { width: 5px; }
    #ssk-messages::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }

    .ssk-msg {
      max-width: 82%; line-height: 1.5; font-size: 13.5px;
      padding: 10px 13px; border-radius: 14px; word-wrap: break-word;
    }
    .ssk-msg-user {
      background: ${BRAND_COLOR}; color: #fff;
      align-self: flex-end; border-bottom-right-radius: 4px;
    }
    .ssk-msg-bot {
      background: #fff; color: #222;
      align-self: flex-start; border-bottom-left-radius: 4px;
      box-shadow: 0 1px 4px rgba(0,0,0,.08);
    }
    .ssk-msg-bot a { color: ${ACCENT_COLOR}; }

    /* Skrive-indikator (tre prikker) */
    #ssk-typing {
      display: none; align-self: flex-start;
      background: #fff; padding: 10px 16px; border-radius: 14px;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 4px rgba(0,0,0,.08);
    }
    #ssk-typing span {
      display: inline-block; width: 7px; height: 7px;
      border-radius: 50%; background: #aaa; margin: 0 2px;
      animation: ssk-bounce .9s infinite;
    }
    #ssk-typing span:nth-child(2) { animation-delay: .15s; }
    #ssk-typing span:nth-child(3) { animation-delay: .30s; }
    @keyframes ssk-bounce {
      0%, 80%, 100% { transform: translateY(0); }
      40%            { transform: translateY(-6px); }
    }

    /* Input-område */
    #ssk-footer {
      padding: 10px 12px; background: #fff;
      border-top: 1px solid #e9ecef;
      display: flex; gap: 8px; align-items: flex-end;
      flex-shrink: 0;
    }
    #ssk-input {
      flex: 1; border: 1px solid #dde; border-radius: 22px;
      padding: 9px 14px; font-size: 13.5px; outline: none; resize: none;
      max-height: 100px; overflow-y: auto; line-height: 1.4;
      transition: border-color .15s;
    }
    #ssk-input:focus { border-color: ${BRAND_COLOR}; }
    #ssk-send {
      width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
      background: ${BRAND_COLOR}; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background .15s;
    }
    #ssk-send:hover { background: ${ACCENT_COLOR}; }
    #ssk-send:disabled { background: #ccc; cursor: default; }
    #ssk-send svg { width: 18px; height: 18px; fill: #fff; }

    /* Fejlbesked */
    .ssk-error { color: #c0392b; font-style: italic; font-size: 13px; }

    @media (max-width: 480px) {
      #ssk-window {
        right: 8px; left: 8px; bottom: 76px;
        width: auto; max-width: none;
        max-height: calc(100vh - 96px);
        max-height: calc(100dvh - 96px);
      }
      #ssk-bubble { right: 12px; bottom: 12px; }
    }
  `;
  document.head.appendChild(style);

  // ─── SVG-ikoner ───────────────────────────────────────────────────────────────
  const SVG_CHAT = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
  </svg>`;
  const SVG_CLOSE = `×`;
  const SVG_SEND = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
  </svg>`;
  const SVG_BOT = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2a2 2 0 0 1 2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1 2-2m0 5c2.67 0 8 1.34 8 4v2H4v-2c0-2.66 5.33-4 8-4z"/>
  </svg>`;

  // ─── Byg DOM ──────────────────────────────────────────────────────────────────
  const root = el("div", { id: "ssk-chat-root" });

  // Boble
  const bubble = el("button", { id: "ssk-bubble", "aria-label": "Åbn chat" });
  bubble.innerHTML = SVG_CHAT;
  const badge = el("div", { id: "ssk-badge" });
  bubble.appendChild(badge);

  // Vindue
  const win = el("div", { id: "ssk-window", class: "ssk-hidden",
    role: "dialog", "aria-label": "Chat med Strategiskskole.dk" });

  // Header
  const header = el("div", { id: "ssk-header" });
  const avatar = el("div", { id: "ssk-header-avatar" });
  avatar.innerHTML = SVG_BOT;
  const titleWrap = el("div");
  titleWrap.appendChild(el("div", { id: "ssk-header-title" }, "Strategiskskole.dk"));
  titleWrap.appendChild(el("div", { id: "ssk-header-sub"   }, "AI-assistent · svarer på dansk"));
  const closeBtn = el("button", { id: "ssk-close", "aria-label": "Luk chat" }, SVG_CLOSE);
  header.append(avatar, titleWrap, closeBtn);

  // Beskeder
  const messages = el("div", { id: "ssk-messages", role: "log", "aria-live": "polite" });
  const typingEl = el("div", { id: "ssk-typing" });
  typingEl.innerHTML = "<span></span><span></span><span></span>";

  // Velkomstbesked
  addBotMessage(WELCOME_MSG);

  // Footer
  const footer  = el("div", { id: "ssk-footer" });
  const input   = el("textarea", {
    id: "ssk-input", rows: "1",
    placeholder: "Skriv din besked her…",
    "aria-label": "Skriv besked",
    onkeydown: handleKey,
    oninput: autoResize,
  });
  const sendBtn = el("button", { id: "ssk-send", "aria-label": "Send besked", onclick: sendMessage });
  sendBtn.innerHTML = SVG_SEND;
  footer.append(input, sendBtn);

  win.append(header, messages, typingEl, footer);
  root.append(bubble, win);
  document.body.appendChild(root);

  // ─── Event listeners ──────────────────────────────────────────────────────────
  bubble.addEventListener("click", toggleChat);
  closeBtn.addEventListener("click", toggleChat);

  // ─── Funktioner ───────────────────────────────────────────────────────────────
  function toggleChat() {
    isOpen = !isOpen;
    win.classList.toggle("ssk-hidden", !isOpen);
    bubble.innerHTML = isOpen
      ? `<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`
      : SVG_CHAT;
    badge.style.display = "none";
    if (isOpen) {
      setTimeout(() => input.focus(), 50);
      scrollBottom();
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function autoResize() {
    this.style.height = "auto";
    this.style.height = Math.min(this.scrollHeight, 100) + "px";
  }

  function addBotMessage(text) {
    const div = el("div", { class: "ssk-msg ssk-msg-bot" });
    div.innerHTML = formatText(text);
    messages.appendChild(div);
    // Scroll så toppen af bot-beskeden er synlig — brugeren scroller selv ned
    requestAnimationFrame(() => {
      div.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  }

  function addUserMessage(text) {
    messages.appendChild(el("div", { class: "ssk-msg ssk-msg-user" }, text));
    scrollBottom();
  }

  function addErrorMessage(text) {
    const div = el("div", { class: "ssk-msg ssk-msg-bot ssk-error" }, text);
    messages.appendChild(div);
    scrollBottom();
  }

  function formatText(text) {
    // Konverter **fed** → <strong>, *kursiv* → <em>, linjeskift → <br>
    return text
      .replace(/&/g,  "&amp;")
      .replace(/</g,  "&lt;")
      .replace(/>/g,  "&gt;")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g,     "<em>$1</em>")
      .replace(/\n/g, "<br>");
  }

  function scrollBottom() {
    requestAnimationFrame(() => {
      messages.scrollTop = messages.scrollHeight;
    });
  }

  function setLoading(state) {
    isLoading = state;
    sendBtn.disabled = state;
    typingEl.style.display = state ? "flex" : "none";
    if (state) scrollBottom();
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text || isLoading) return;

    input.value = "";
    input.style.height = "auto";
    addUserMessage(text);

    history.push({ role: "user", content: text });
    setLoading(true);

    try {
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: history.slice(-6) }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.error) throw new Error(data.error);
      const reply = data.reply || "Beklager, jeg kunne ikke generere et svar.";

      history.push({ role: "assistant", content: reply });
      addBotMessage(reply);

      // Vis badge hvis vinduet er lukket
      if (!isOpen) {
        badge.style.display = "block";
      }
    } catch (err) {
      console.error("[SSK Chat]", err);
      addErrorMessage(
        "Beklager, der opstod en fejl. Prøv igen eller kontakt Thomas direkte på " +
        "thomas@strategiskskole.dk eller +45 61 65 73 65."
      );
      // Fjern den fejlslagne bruger-besked fra historikken
      history.pop();
    } finally {
      setLoading(false);
      input.focus();
    }
  }
})();
