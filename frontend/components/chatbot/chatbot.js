/**
 * ==============================================================================
 * EHKY YA MISR - PHARAONIC CHATBOT COMPONENT (حكيم مصر)
 * ==============================================================================
 * This module is completely decoupled from the main application.
 * The Chatbot Team can customize this file, change the API endpoint,
 * or replace it entirely with their own widget/SDK.
 * ==============================================================================
 */

(function () {
  'use strict';

  // Global Chatbot Configuration (Can be overridden by external scripts)
  window.EhkyChatbotConfig = Object.assign({
    // Set to true when the Chatbot Backend / AI model is ready
    USE_REMOTE_API: false,
    
    // The endpoint the Chatbot Team will host (e.g., Node.js / Python / FastAPI / LangChain)
    apiUrl: 'http://localhost:5000/api/chat',
    
    // Visual Settings
    avatarUrl: 'assets/pharaoh-avatar.svg',
    botName: 'حكيم مصر',
    botTitle: 'المرشد التراثي الذكي',
    welcomeMessage: 'أهلاً بك يا صديقي في ذاكرة مصر الخالدة! أنا حكيم مصر، اسألني عن الحرف التقليدية، تاريخ المحافظات، أو أسرار الأجداد.',
    
    // Default Quick Question Chips
    quickQuestions: [
      'ما هي صناعة المراكب؟',
      'ما الخامات والأدوات؟',
      'كيف يصنع المركب؟'
    ]
  }, window.EhkyChatbotConfig || {});

  // Normalize Arabic letters for local regex fallback
  const normalizeArabic = (s) =>
    (s || '')
      .replace(/[إأآ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .trim();

  // Local Knowledge Fallback (used when backend is offline or before integration)
  function getLocalResponse(query) {
    const n = normalizeArabic(query);
    if (/خامات|ادوات|خشب/.test(n)) {
      return 'تعتمد صناعة المراكب بالإسكندرية على أخشاب متينة كالتوت والسنط والكافور واللبخ والخشب السويدي، بالإضافة للمسامير والدهانات وخيوط الكتان لسد الفواصل، وأدوات النجارة والحدادة.';
    } else if (/خطوات|كيف|ازاي|يصنع|تصنيع/.test(n)) {
      return 'رحلة صنع المركب تبدأ بتجهيز وتقطيع الأخشاب ← بناء العمود الفقري والضلوع ← تكسية الهيكل بالألواح ← سد الفواصل بخيوط الكتان لمنع تسرب المياه ← وأخيراً التشطيب والدهان.';
    } else if (/مكان|فين|اسكندريه|منطقه/.test(n)) {
      return 'الحرفة مسجلة بمحافظة الإسكندرية، وتحديداً في ورش الأنفوشي وأبو قير العريقة.';
    } else if (/مراكب|حرفه|فلوكه|سفن/.test(n)) {
      return 'صناعة المراكب والسفن التراثية هي فن تتوارثه أجيال من النجارين والحدادين في الموانئ المصرية، لتوفير مراكب الصيد والفلوكات التاريخية.';
    }
    return 'معلوماتي الحالية مستندة إلى سجلات التراث الموثقة في الديمو. يمكنك سؤالي عن الخامات، أدوات الصناعة، أو خطوات بناء المراكب، أو انتظر ربط التيم بنموذج الذكاء الاصطناعي الكامل!';
  }

  // Build Component DOM
  function createChatbotDOM() {
    const cfg = window.EhkyChatbotConfig;

    // 1. Floating Launcher
    const launcher = document.createElement('div');
    launcher.className = 'pharaoh-chat-launcher';
    launcher.id = 'pharaohChatLauncher';
    launcher.setAttribute('role', 'button');
    launcher.setAttribute('aria-label', `محادثة مع ${cfg.botName}`);
    launcher.innerHTML = `
      <div class="pharaoh-avatar-circle">
        <img src="${cfg.avatarUrl}" alt="${cfg.botName}">
      </div>
      <div class="pharaoh-launcher-text">
        <span class="pharaoh-launcher-title">${cfg.botName} <span>✧</span></span>
        <span class="pharaoh-launcher-desc">${cfg.botTitle}</span>
      </div>
    `;

    // 2. Chat Window
    const chatWindow = document.createElement('aside');
    chatWindow.className = 'pharaoh-chat-window';
    chatWindow.id = 'pharaohChatWindow';
    chatWindow.hidden = true;
    chatWindow.innerHTML = `
      <div class="pharaoh-chat-header">
        <div class="pharaoh-chat-header-info">
          <div class="pharaoh-header-avatar">
            <img src="${cfg.avatarUrl}" alt="${cfg.botName}">
          </div>
          <div class="pharaoh-header-details">
            <strong>${cfg.botName}</strong>
            <small>${cfg.botTitle}</small>
          </div>
        </div>
        <button class="pharaoh-chat-close-btn" id="pharaohCloseBtn" aria-label="إغلاق المحادثة">×</button>
      </div>

      <div class="pharaoh-team-notice">
        <span>🏛️</span>
        <span>نموذج الشات الفرعوني المستقل — مهيأ لربط فريق الذكاء الاصطناعي</span>
      </div>

      <div class="pharaoh-messages-area" id="pharaohMessages"></div>

      <div class="pharaoh-suggestions-row" id="pharaohSuggestions">
        ${cfg.quickQuestions.map(q => `<button type="button" class="pharaoh-suggest-chip" data-q="${q}">${q}</button>`).join('')}
      </div>

      <form class="pharaoh-chat-form" id="pharaohForm">
        <input type="text" class="pharaoh-chat-input" id="pharaohInput" placeholder="اسأل عن تراث وحرف مصر…" autocomplete="off" required>
        <button type="submit" class="pharaoh-send-btn" aria-label="إرسال">←</button>
      </form>
    `;

    document.body.appendChild(launcher);
    document.body.appendChild(chatWindow);

    return { launcher, chatWindow };
  }

  // Component Controller
  function initChatbot() {
    const { launcher, chatWindow } = createChatbotDOM();
    const messages = document.getElementById('pharaohMessages');
    const input = document.getElementById('pharaohInput');
    const form = document.getElementById('pharaohForm');
    const closeBtn = document.getElementById('pharaohCloseBtn');
    const suggestions = document.getElementById('pharaohSuggestions');

    function addMessage(text, isUser = false) {
      const msg = document.createElement('div');
      msg.className = `pharaoh-msg ${isUser ? 'pharaoh-msg-user' : 'pharaoh-msg-bot'}`;
      msg.textContent = text;
      messages.appendChild(msg);
      messages.scrollTop = messages.scrollHeight;
    }

    function openChat(presetQuery = null) {
      chatWindow.hidden = false;
      if (!messages.children.length) {
        addMessage(window.EhkyChatbotConfig.welcomeMessage, false);
      }
      if (presetQuery) {
        handleUserQuery(presetQuery);
      } else {
        setTimeout(() => input.focus(), 150);
      }
    }

    function closeChat() {
      chatWindow.hidden = true;
    }

    async function handleUserQuery(query) {
      if (!query || !query.trim()) return;
      const text = query.trim();
      addMessage(text, true);

      // Show typing indicator or instant answer
      const cfg = window.EhkyChatbotConfig;

      if (cfg.USE_REMOTE_API && cfg.apiUrl) {
        try {
          const res = await fetch(cfg.apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
          });
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          const data = await res.json();
          addMessage(data.reply || data.message || 'تم استلام الرد بنجاح.');
        } catch (err) {
          console.warn('[EhkyChatbot] Remote API failed, using fallback:', err);
          addMessage(getLocalResponse(text), false);
        }
      } else {
        // Instant Local Mode
        setTimeout(() => {
          addMessage(getLocalResponse(text), false);
        }, 300);
      }
    }

    // Event Listeners
    launcher.addEventListener('click', () => openChat());
    closeBtn.addEventListener('click', closeChat);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = input.value;
      input.value = '';
      handleUserQuery(val);
    });

    suggestions.addEventListener('click', (e) => {
      const btn = e.target.closest('.pharaoh-suggest-chip');
      if (btn && btn.dataset.q) {
        handleUserQuery(btn.dataset.q);
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !chatWindow.hidden) {
        closeChat();
      }
    });

    // Public API for other scripts (e.g. "اسأل عن الحرفة" button in craft page)
    window.openEhkyChatbot = openChat;
    window.closeEhkyChatbot = closeChat;
  }

  // Auto initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
  } else {
    initChatbot();
  }
})();

