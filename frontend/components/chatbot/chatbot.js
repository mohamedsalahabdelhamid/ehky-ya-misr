/**
 * ==============================================================================
 * EHKY YA MISR - HORUS CHATBOT COMPONENT (حورس)
 * ==============================================================================
 * Independent AI / Knowledge guide for Egyptian Heritage.
 * Multilingual support: Arabic, English, French, Italian, German.
 * ==============================================================================
 */

(function () {
  'use strict';

  const I18N_DATA = {
    ar: {
      botName: 'حورس',
      botTitle: 'مرشدك التراثي الذكي',
      notice: 'مرشد التراث الذكي — حفظ الهوية المصرية وحماية الزوار',
      placeholder: 'اسأل حورس عن الحرف، الأكلات، الحرفيين…',
      welcome: 'أهلاً بك في محراب الحضارة المصرية العريقة! أنا حورس، مرشدك التراثي الذكي. اسألني عن الحرف التقليدية الـ 16، أشهر الأكلات التراثية، سوق الحرفيين وكيفية الطلب بالعمولة، أو تاريخ أي محافظة من محافظات مصر الـ 27.',
      thinking: 'حورس بيفكر…',
      quick: [
        'ما هي الحرف التراثية الموثقة؟',
        'أشهر أكلات مصر ومطاعمها؟',
        'كيف أطلب بالعمولة من الحرفيين؟',
        'طرق الدفع وحماية المشتري؟'
      ]
    },
    en: {
      botName: 'Horus',
      botTitle: 'Smart Living Heritage Guide',
      notice: 'AI Heritage Guide — Preserving Egyptian Identity & Protecting Visitors',
      placeholder: 'Ask Horus about crafts, foods, artisans…',
      welcome: 'Welcome to Egypt! I am Horus, your intelligent heritage guide. Ask me about the 16 documented traditional crafts, famous heritage cuisines, the verified artisan marketplace, or any of Egypt\'s 27 governorates.',
      thinking: 'Horus is thinking…',
      quick: [
        'Documented Heritage Crafts?',
        'Egyptian Foods & Restaurants?',
        'Commission an Artisan?',
        'Buyer Protection & Payment?'
      ]
    },
    fr: {
      botName: 'Horus',
      botTitle: 'Guide du Patrimoine Vivant',
      notice: 'Guide du Patrimoine — Préservation de l\'identité égyptienne',
      placeholder: 'Demandez à Horus sur l\'artisanat, la gastronomie…',
      welcome: 'Bienvenue en Égypte ! Je suis Horus, votre guide patrimonial intelligent. Interrogez-moi sur les 16 métiers d\'artisanat traditionnel, la cuisine égyptienne, ou les 27 gouvernorats.',
      thinking: 'Horus réfléchit…',
      quick: [
        'Artisanats traditionnels ?',
        'Cuisine et restaurants égyptiens ?',
        'Commander auprès d\'un artisan ?',
        'Paiement et protection acheteur ?'
      ]
    },
    it: {
      botName: 'Horus',
      botTitle: 'Guida al Patrimonio Vivente',
      notice: 'Guida intelligente — Conservazione dell\'identità egiziana',
      placeholder: 'Chiedi a Horus di artigianato, cucina, maestri…',
      welcome: 'Benvenuti in Egitto! Sono Horus, la tua guida intelligente al patrimonio culturale. Chiedimi dei 16 mestieri tradizionali, della cucina tipica o dei 27 governatorati.',
      thinking: 'Horus sta pensando…',
      quick: [
        'Artigianato tradizionale ?',
        'Cucina egiziana e ristoranti ?',
        'Ordinare su misura dagli artigiani ?',
        'Pagamento e protezione acquirente ?'
      ]
    },
    de: {
      botName: 'Horus',
      botTitle: 'Smarter Kulturerbe-Guide',
      notice: 'Intelligenter Guide — Schutz des ägyptischen Erbes',
      placeholder: 'Fragen Sie Horus nach Handwerk, Speisen, Meistern…',
      welcome: 'Willkommen in Ägypten! Ich bin Horus, Ihr intelligenter Kulturerbe-Begleiter. Fragen Sie mich nach den 16 traditionellen Handwerken, typischen Gerichten oder den 27 Gouvernements.',
      thinking: 'Horus denkt nach…',
      quick: [
        'Dokumentierte Traditionshandwerke?',
        'Ägyptische Küche & Restaurants?',
        'Maßanfertigung bei Handwerkern?',
        'Zahlung & Käuferschutz?'
      ]
    }
  };

  const getLang = () => (window.I18N && window.I18N.current) || 'ar';
  const getStrings = () => I18N_DATA[getLang()] || I18N_DATA.ar;

  window.EhkyChatbotConfig = Object.assign({
    USE_REMOTE_API: false,
    apiUrl: 'http://localhost:5000/api/chat',
    avatarUrl: 'assets/horus-avatar-head.webp'
  }, window.EhkyChatbotConfig || {});

  const normalizeQuery = (s) =>
    (s || '')
      .replace(/[إأآ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .toLowerCase()
      .trim();

  function getLocalResponse(query) {
    const q = normalizeQuery(query);
    const lang = getLang();

    // Multilingual English / European responses
    if (lang !== 'ar') {
      if (/craft|handicraft|artisan|boat|wood|copper|pottery|textile|lantern|nay|sculpt|weaving|subha/.test(q)) {
        return '🏺 **Egypt’s 16 Documented Crafts**:\n• Shipbuilding & Boats (Alexandria)\n• Palm-leaf Weaving (Fayoum)\n• Copper Engraving & Chasing (Cairo)\n• Pottery Making (Qena & Fustat)\n• Traditional Ramadan Lanterns (Cairo)\n• Arabesque Woodwork & Inlay (Cairo)\n• Nay & Cane Flute Making (Giza)\n• Akhmim Handloom Weaving (Sohag)\n• Alabaster Sculpture (Luxor)\nBrowse the "Heritage" section to watch videos and explore!';
      }
      if (/food|eat|dish|koshary|molokhia|falafel|taameya|hawawshi|feteer|restaurant/.test(q)) {
        return '🍲 **Authentic Egyptian Cuisine**:\n• Koshary (rice, brown lentils, pasta, crispy onions & spicy sauce)\n• Molokhia (fragrant jute stew with garlic-coriander tasha)\n• Falafel / Taameya (golden fava bean patties)\n• Hawawshi (spiced minced beef in stone-baked baladi bread)\n• Feteer Meshaltet (flaky artisan butter pastry)\nClick "Egyptian Foods" to find top-rated authentic restaurants on Google Maps!';
      }
      if (/artisan|buy|order|commission|price|fair|protect|escrow/.test(q)) {
        return '🛡️ **Verified Artisan Market & Buyer Protection**:\n1. Connect directly with authentic master craftsmen without middleman markup.\n2. Request customized sizes or colors via direct chat.\n3. Secure payment guarantee: Funds are held safely and only released after delivery and inspection.';
      }
      if (/pay|payment|cash|card|visa|mastercard|vodafone/.test(q)) {
        return '💳 **Supported Secure Payments**:\n• Credit/Debit cards (Visa, MasterCard, Meeza).\n• Mobile Wallets & Vodafone Cash (+20 100 123 4567).\nProtected by our platform escrow guarantee.';
      }
      if (/map|province|governorate|cairo|alex|aswan|luxor|sinai|giza/.test(q)) {
        return '🗺️ **27 Governorates Interactive Map**:\nEhky Ya Misr documents cultural heritage across all 27 Egyptian governorates! Visit the "Map" section to click and explore each province\'s distinct history.';
      }
      return 'I am Horus, your Living Heritage Guide.\nI can assist you with:\n1. Details of the 16 traditional crafts and workshops.\n2. Egyptian foods & top restaurant locations on Google Maps.\n3. Fair trade artisan commissions & secure escrow payment.\nWhat would you like to explore?';
    }

    // Arabic responses
    if (/مركب|مراكب|سفن|صيد|فلوكه/.test(q)) {
      return '⛵ صناعة المراكب وسفن الصيد التراثية: مسجلة في الإسكندرية (أبو قير والأنفوشي). تعتمد على أخشاب التوت والسنط والكافور والمسامير المجلفنة وخيوط الكتان العازلة لتأمين الملاحة في البحر المتوسط وبحيرة مريوط.';
    }
    if (/خوص|سعف|نخيل|نخل|سلال/.test(q)) {
      return '🌴 صناعة الخوص ومنتجات النخيل: حرفة فرعونية أصيلة في الفيوم (قرية الإعلام). يقوم الحرفيون بغزل سعف النخيل والجريد لصنع السلال والأطباق والمقاعد الصديقة للبيئة.';
    }
    if (/نحاس|نقش|صواني|مبخره|مبخرة/.test(q)) {
      return '✨ النقش والزخرفة على النحاس: من أعرق فنون القاهرة التاريخية (خان الخليلي وحي الجمالية). ينقش الحرفيون الزخارف الفاطمية والمملوكية يدويًا.';
    }
    if (/فخار|طمي|صلصال|قله|قلل|طاجن/.test(q)) {
      return '🏺 صناعة الفخار والقلل والطهي الصحي: تشتهر بها قنا وقرية الفواخير بمصر القديمة. يشكل الطمي النيلي على دولاب الفخار بمهارة عالية.';
    }
    if (/فانوس|فوانيس|رمضان|صفيح/.test(q)) {
      return '🏮 صناعة الفوانيس الشعبية: تراث قاهري أصيل يتوارثه صناع حي السيدة زينب (بركة الفيل). تُصنع من الصفيح والزجاج الملون باللحام اليدوي.';
    }
    if (/ارابيسك|خشب|خراطه|صدف/.test(q)) {
      return '🪵 فن الأرابيسك وخراطة وتطعيم الخشب: ينبض به شارع باب الوزير بالدرب الأحمر. يعتمد على تعشيق قطع خشب الزان والماهوجني وتطعيمها بالصدف البحري.';
    }
    if (/عطاره|اعشاب|توابل|بهارات/.test(q)) {
      return '🌿 مهنة العطارة وطب الأعشاب: مركزها سوق العطارين بحي الحسين بالقاهرة الفاطمية. تتوارث العائلات وصفات التداوي بالأعشاب الطبيعية والزيوت العطرية.';
    }
    if (/صباغه|الوان|حرير|درب احمر/.test(q)) {
      return '🎨 الصباغة اليدوية: في مصبغة سلامة التاريخية بالدرب الأحمر الممتدة لأكثر من 120 عاماً، تُصبغ أقمشة الصوف والحرير بالأصباغ المعدنية والطبيعية الثابتة.';
    }
    if (/ناي|موسيقى|عزف|غاب/.test(q)) {
      return '🎶 صناعة الناي وآلات النفخ الشعبية: مهارة متوارثة بالجيزة، تُصنع من الغاب البلدي وتثقب بدقة بالغة وفق المقامات الموسيقية الشرقية.';
    }
    if (/سبحه|سبح|يسر|عاج|كهرمان/.test(q)) {
      return '📿 خياطة وصناعة السبح: فن يدوي يزدهر في خان الخليلي؛ يعتمد على خامات خشب الصندل واليسر الطبيعي والعاج الصناعي.';
    }
    if (/كواكيل|طربوش|ازهر|عمامه/.test(q)) {
      return '🎓 صناعة الكواكيل والعمامة الأزهرية: بالجمالية بالقاهرة، تجهز خيوط الحرير والكتان لكواكيل العلماء والطلبة.';
    }
    if (/قصبجي|تطريز|كسوه|سيرما/.test(q)) {
      return '🧵 فن القصبجي والتطريز بالسيرما: اشتهر بصناعة كسوة الكعبة المشرفة وتطريز الآيات القرآنية والملابس التراثية بخيوط الذهب والفضة.';
    }
    if (/حرف|حرفيه|صناعات/.test(q)) {
      return '🏺 تضم منصة «احكي يا مصر» 16 حرفة تراثية موثقة بالفيديو والخطوات والخامات، من الإسكندرية للقاهرة وقنا والأقصر وأسوان. تصفح قسم "التراث" لمشاهدتها كاملة!';
    }
    if (/اكل|طعام|كشري|ملوخيه|فول|طعميه|حواوشي|فطير|فسيخ|كبده/.test(q)) {
      if (/كشري/.test(q)) return '🍲 الكشري المصري: أشهر أكلة شعبية تجمع الأرز والعدس البني والمكرونة والشعرية مع البصل المقرمش والصلصة والدقة الحارة. يمكنك البحث عن أشهر المطاعم عبر خرائط جوجل في قسم الأكلات!';
      if (/ملوخيه/.test(q)) return '🌿 الملوخية المصرية بالأرانب والطشة: ملكة المائدة المصرية منذ الفراعنة؛ سرها في طشة الثوم والكزبرة الجافة والشهقة التراثية.';
      if (/فول|فلافل|طعميه/.test(q)) return '🧆 الفول المدمس والفلافل (الطعمية المصرية): فطور مصر القومي؛ يُدمس الفول في القدرة النحاسية وتُعد الطعمية بحمص وكرات وسمسم ذهبي مقرمش.';
      if (/حواوشي/.test(q)) return '🥩 الحواوشي البلدي: رغيف الخبز البلدي المحشو باللحم المفروم المتبل بالبصل والفلفل والمخبوز في الفرن الحجري.';
      if (/فسيخ|رنجه/.test(q)) return '🐟 الفسيخ والأسماك المملحة: طقس فرعوني يمتد لأكثر من 4000 عام في شم النسيم.';
      return '🇪🇬 الأكلات التراثية تشمل: الكشري، الملوخية، الفول والفلافل، الحواوشي، الكبدة الإسكندراني، الفطير المشلتت، الأرز المعمر، والفسيخ. تصفح قسم "الأكلات المصرية" وابحث عن أشهر المطاعم على خريطة جوجل!';
    }
    if (/حرفي|بائع|صانع|طلب|عموله|سوق|شراء|اسعار/.test(q)) {
      return '🛡️ سوق الحرفيين وحماية المشتري:\n1. نخبة من شيوخ الصنعة المعتمدين متاحين للتواصل المباشر.\n2. يمكنك محادثة الصانع عبر زر "شات مباشر" للاستفسار أو طلب مقاسات خاصة.\n3. أموالك في أمان تام: لا يتم صرف المبلغ إلا بعد استلام المنتج ومطابقته للمواصفات.';
    }
    if (/دفع|كاش|فودافون|فيزا|ماستركارد|بنك|محفظه|فلوس/.test(q)) {
      return '💳 طرق الدفع المتاحة:\n• بطاقات الدفع البنكية (Visa / MasterCard / ميزة).\n• محافظ المحمول وفودافون كاش على رقمنا المعتمد: 010 2345 6789، مع حماية كاملة للحقوق.';
    }
    if (/محافظ|قاهره|اسكندريه|فيوم|اسوان|اقصر|سينا|سوهاج|قنا|مطروح/.test(q)) {
      return '🗺️ تغطي منصة «احكي يا مصر» محافظات مصر الـ 27 بالكامل! ادخل قسم "الخريطة" لاختيار محافظتك واكتشاف كنوزها التراثية.';
    }

    return 'معاك حورس.. يمكنني إرشادك في:\n1. تفاصيل الحرف الـ 16 وأماكن ورشها.\n2. الأكلات المصرية وأماكن تذوقها على خرائط جوجل.\n3. التواصل مع الحرفيين والدفع الآمن.\nعن ماذا تود أن تسأل؟';
  }

  function createChatbotDOM() {
    const cfg = window.EhkyChatbotConfig;
    const str = getStrings();
    const chatWindow = document.createElement('aside');
    chatWindow.className = 'pharaoh-chat-window';
    chatWindow.id = 'pharaohChatWindow';
    chatWindow.hidden = true;
    chatWindow.innerHTML = `
      <div class="pharaoh-chat-header">
        <div class="pharaoh-chat-header-info">
          <div class="pharaoh-header-avatar">
            <img src="${cfg.avatarUrl}" alt="${str.botName}">
          </div>
          <div class="pharaoh-header-details">
            <strong id="pharaohBotName">${str.botName}</strong>
            <small id="pharaohBotTitle">${str.botTitle}</small>
          </div>
        </div>
        <button class="pharaoh-chat-close-btn" id="pharaohCloseBtn" aria-label="Close">×</button>
      </div>

      <div class="pharaoh-team-notice" id="pharaohNotice">
        <span>𓅃</span>
        <span>${str.notice}</span>
      </div>

      <div class="pharaoh-messages-area" id="pharaohMessages"></div>

      <div class="pharaoh-suggestions-row" id="pharaohSuggestions">
        ${str.quick.map(q => `<button type="button" class="pharaoh-suggest-chip" data-q="${q}">${q}</button>`).join('')}
      </div>

      <form class="pharaoh-chat-form" id="pharaohForm">
        <input type="text" class="pharaoh-chat-input" id="pharaohInput" placeholder="${str.placeholder}" autocomplete="off" required>
        <button type="submit" class="pharaoh-send-btn" aria-label="Send">←</button>
      </form>
    `;
    document.body.appendChild(chatWindow);
    return { chatWindow };
  }

  function initChatbot() {
    const { chatWindow } = createChatbotDOM();
    const messages = document.getElementById('pharaohMessages');
    const input = document.getElementById('pharaohInput');
    const form = document.getElementById('pharaohForm');
    const closeBtn = document.getElementById('pharaohCloseBtn');
    const suggestions = document.getElementById('pharaohSuggestions');

    function refreshChatbotLanguage() {
      const str = getStrings();
      const botName = document.getElementById('pharaohBotName');
      const botTitle = document.getElementById('pharaohBotTitle');
      const notice = document.getElementById('pharaohNotice');
      if (botName) botName.textContent = str.botName;
      if (botTitle) botTitle.textContent = str.botTitle;
      if (notice) notice.innerHTML = `<span>𓅃</span><span>${str.notice}</span>`;
      if (input) input.placeholder = str.placeholder;
      if (suggestions) {
        suggestions.innerHTML = str.quick.map(q => `<button type="button" class="pharaoh-suggest-chip" data-q="${q}">${q}</button>`).join('');
      }
    }

    window.addEventListener('ehkyLanguageChanged', () => {
      refreshChatbotLanguage();
    });

    function addMessage(text, isUser = false) {
      const msg = document.createElement('div');
      msg.className = `pharaoh-msg ${isUser ? 'pharaoh-msg-user' : 'pharaoh-msg-bot'}`;
      msg.innerHTML = text.replace(/\n/g, '<br>');
      messages.appendChild(msg);
      messages.scrollTop = messages.scrollHeight;
    }

    function openChat(presetQuery = null) {
      chatWindow.hidden = false;

      // HIDE HORUS DOCK WHEN CHAT IS OPEN
      const dock = document.getElementById('horusDock');
      if (dock) {
        dock.classList.add('horus-hidden');
        dock.style.display = 'none';
      }

      if (!messages.children.length) {
        addMessage(getStrings().welcome, false);
      }
      if (presetQuery) {
        handleUserQuery(presetQuery);
      } else {
        setTimeout(() => input.focus(), 150);
      }
    }

    function closeChat() {
      chatWindow.hidden = true;

      // SHOW HORUS DOCK AGAIN WHEN CHAT IS CLOSED
      const dock = document.getElementById('horusDock');
      if (dock) {
        dock.classList.remove('horus-hidden');
        dock.style.display = 'flex';
      }
    }

    async function handleUserQuery(query) {
      if (!query || !query.trim()) return;
      const text = query.trim();
      addMessage(text, true);

      const str = getStrings();
      const typing = document.createElement('div');
      typing.className = 'pharaoh-msg pharaoh-msg-bot pharaoh-typing';
      typing.textContent = str.thinking;
      messages.appendChild(typing);
      messages.scrollTop = messages.scrollHeight;

      setTimeout(async () => {
        typing.remove();
        if (window.EhkyChatbotConfig.USE_REMOTE_API) {
          try {
            const res = await fetch(window.EhkyChatbotConfig.apiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: text, lang: getLang() })
            });
            if (res.ok) {
              const data = await res.json();
              addMessage(data.reply || data.message || 'Received response.');
              return;
            }
          } catch (e) {
            console.warn('[Chatbot] Remote API failed, falling back to local:', e);
          }
        }
        const answer = getLocalResponse(text);
        addMessage(answer, false);
      }, 350);
    }

    closeBtn.addEventListener('click', closeChat);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = input.value;
      input.value = '';
      handleUserQuery(q);
    });
    suggestions.addEventListener('click', (e) => {
      const chip = e.target.closest('.pharaoh-suggest-chip');
      if (chip && chip.dataset.q) handleUserQuery(chip.dataset.q);
    });

    const horusBtn = document.getElementById('horusGuideBtn');
    if (horusBtn) horusBtn.addEventListener('click', () => openChat());

    window.openEhkyChatbot = openChat;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
  } else {
    initChatbot();
  }
})();
