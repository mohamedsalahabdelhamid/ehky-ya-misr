/**
 * ==============================================================================
 * EHKY YA MISR - HORUS ROYAL CHATBOT COMPONENT (حورس الحكيم)
 * ==============================================================================
 * Independent, decoupled AI / Knowledge guide for Egyptian Heritage.
 * Upgraded from Shamsa RAG architecture to support ultra-fast local reasoning
 * on CPU without heavy 5GB weights, with Gemini API compatibility.
 * ==============================================================================
 */

(function () {
  'use strict';

  // Global Chatbot Configuration
  window.EhkyChatbotConfig = Object.assign({
    // Set to true when remote AI API is ready
    USE_REMOTE_API: false,
    apiUrl: 'http://localhost:5000/api/chat',
    
    // Character Settings (Horus the Royal Guide)
    avatarUrl: 'assets/horus-character-3d.webp',
    botName: 'حورس الحكيم',
    botTitle: 'المرشد التراثي الذكي لمصر',
    welcomeMessage: 'أهلاً بك في محراب الحضارة المصرية العريقة! أنا حورس، مرشدك التراثي الذكي. اسألني عن الحرف التقليدية الـ 16، أشهر الأكلات التراثية، سوق الحرفيين وكيفية الطلب بالعمولة، أو تاريخ أي محافظة من محافظات مصر الـ 27.',
    
    // Quick Questions
    quickQuestions: [
      'ما هي الحرف التراثية الموثقة؟',
      'أشهر أكلات مصر ومطاعمها؟',
      'كيف أطلب بالعمولة من الحرفيين؟',
      'طرق الدفع وحماية المشتري؟'
    ]
  }, window.EhkyChatbotConfig || {});

  // Normalize Arabic letters
  const normalizeArabic = (s) =>
    (s || '')
      .replace(/[إأآ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/[^\w\s\u0600-\u06FF]/gi, '')
      .toLowerCase()
      .trim();

  // Comprehensive Knowledge Base (Offline & CPU-friendly)
  function getLocalResponse(query) {
    const q = normalizeArabic(query);

    // 1. Crafts
    if (/مركب|مراكب|سفن|صيد|فلوكه/.test(q)) {
      return '⛵ صناعة المراكب وسفن الصيد التراثية: مسجلة في الإسكندرية (أبو قير والأنفوشي). تعتمد على أخشاب التوت والسنط والكافور والمسامير المجلفنة وخيوط الكتان العازلة لتأمين الملاحة في البحر المتوسط وبحيرة مريوط.';
    }
    if (/خوص|سعف|نخيل|نخل|سلال/.test(q)) {
      return '🌴 صناعة الخوص ومنتجات النخيل: حرفة فرعونية أصيلة في الفيوم (قرية الإعلام). يقوم الحرفيون بغزل سعف النخيل والجريد لصنع السلال والأطباق والمقاعد الصديقة للبيئة. شيخة الصنعة المسجلة لدينا هي الحاجة كاملة.';
    }
    if (/نحاس|نقش|صواني|مبخره|مبخرة/.test(q)) {
      return '✨ النقش والزخرفة على النحاس: من أعرق فنون القاهرة التاريخية (خان الخليلي وحي الجمالية). ينقش الحرفيون الزخارف الفاطمية والمملوكية يدويًا. يمكنك التواصل مع عم رجب النحاس وطلب قطعتك بالعمولة مباشرة من الموقع!';
    }
    if (/فخار|طمي|صلصال|قله|قلل|طاجن/.test(q)) {
      return '🏺 صناعة الفخار والقلل والطهي الصحي: تشتهر بها قنا وقرية الفواخير بمصر القديمة. يشكل الطمي النيلي على دولاب الفخار بمهارة عالية. شيخ الصنعة لدينا هو عم قاسم القناوي.';
    }
    if (/فانوس|فوانيس|رمضان|صفيح/.test(q)) {
      return '🏮 صناعة الفوانيس الشعبية: تراث قاهري أصيل يتوارثه صناع حي السيدة زينب (بركة الفيل). تُصنع الفوانيس من الصفيح والزجاج الملون باللحام اليدوي، ولدينا الأسطى رمضان الفوال معتمد لتنفيذ طلبيات الفوانيس التراثية.';
    }
    if (/ارابيسك|خشب|خراطه|صدف/.test(q)) {
      return '🪵 فن الأرابيسك وخراطة وتطعيم الخشب: ينبض به شارع باب الوزير بالدرب الأحمر. يعتمد على تعشيق قطع خشب الزان والماهوجني وتطعيمها بالصدف البحري. شيخ الصنعة هو عم فوزي الخراط.';
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
      return '🎓 صناعة الكواكيل والعمامة الأزهرية: بالجمالية بالقاهرة، تجهز خيوط الحرير والكتان لكواكيل العلماء والطلبة لحفظ سمت الزي الأزهري الموقر.';
    }
    if (/قصبجي|تطريز|كسوه|سيرما/.test(q)) {
      return '🧵 فن القصبجي والتطريز بالسيرما: اشتهر بصناعة كسوة الكعبة المشرفة وتطريز الآيات القرآنية والملابس التراثية بخيوط الذهب والفضة.';
    }

    // 2. Foods
    if (/اكل|طعام|كشري|ملوخيه|فول|طعميه|حواوشي|فطير|فسيخ|كبده/.test(q)) {
      if (/كشري/.test(q)) {
        return '🍲 الكشري المصري: أشهر أكلة شعبية تجمع الأرز والعدس البني والمكرونة والشعرية مع البصل المقرمش (الورد) والصلصة والدقة الحارة. يمكنك الضغط على زر "خريطة أشهر مطاعم الأكلة" في صفحة الأكلات للوصول لأفضل المطاعم عبر خرائط جوجل مباشرة!';
      }
      if (/ملوخيه/.test(q)) {
        return '🌿 الملوخية المصرية بالأرانب والطشة: ملكة المائدة المصرية منذ الفراعنة؛ سرها في طشة الثوم والكزبرة الجافة والشهقة التراثية. تجد في صفحة الأكلات وصفها وأشهر المطاعم القاهرية لتقديمها.';
      }
      if (/فول|فلافل|طعميه/.test(q)) {
        return '🧆 الفول المدمس والفلافل (الطعمية المصرية): فطور مصر القومي؛ يُدمس الفول في القدرة النحاسية وتُعد الطعمية بحمص وكرات وسمسم ذهبي مقرمش.';
      }
      if (/حواوشي/.test(q)) {
        return '🥩 الحواوشي البلدي: رغيف الخبز البلدي المحشو باللحم المفروم المتبل بالبصل والفلفل والمخبوز في الفرن الحجري، وتعتبر قرية العزيزية بالشرقية مهد هذه الأكلة.';
      }
      if (/فسيخ|رنجه/.test(q)) {
        return '🐟 الفسيخ والأسماك المملحة: طقس فرعوني يمتد لأكثر من 4000 عام في شم النسيم، وتعد نبروه بالدقهلية عاصمة الفسيخ الأولى في مصر.';
      }
      return '🇪🇬 الأكلات التراثية في المنصة تشمل: الكشري المصري، الملوخية بالأرانب، الفول والفلافل، الحواوشي، الكبدة الإسكندراني، الفطير المشلتت، الأرز المعمر، والفسيخ. يمكنك تصفح قسم "الأكلات المصرية" والبحث عن أشهر المطاعم على خريطة جوجل بضغطة زر!';
    }

    // 3. Artisans, Protection & Buying
    if (/حرفي|بائع|صانع|طلب|عموله|سوق|شراء|اسعار/.test(q)) {
      return '🛡️ سوق الحرفيين وحماية المشتري:\n1. وفرنا لك نخبة من شيوخ الصنعة المعتمدين (مثل عم رجب النحاس، الحاجة كاملة، أسطى حامد مرزوق، عم فوزي الخراط، عم قاسم القناوي، أسطى رمضان الفوال).\n2. يمكنك محادثة الصانع مباشرة عبر زر "شات مباشر مع الصانع" للاستفسار أو طلب مقاسات خاصة (عمولة).\n3. أموالك في أمان تام: نحمي المشتري والسائح من الاستغلال، ولا يتم صرف المبلغ إلا بعد استلام المنتج ومطابقته للمواصفات.';
    }

    // 4. Payment Methods
    if (/دفع|كاش|فودافون|فيزا|ماستركارد|بنك|محفظه|فلوس/.test(q)) {
      return '💳 طرق الدفع المتاحة في المنصة:\n• بطاقات الدفع البنكية (Visa / MasterCard / ميزة) الآمنة والمشفرة.\n• محافظ المحمول وفودافون كاش (Vodafone Cash) على رقمنا المعتمد: 010 2345 6789، مع رفع إيصال التحويل وحماية كاملة للحقوق حتى استلام الطلب.';
    }

    // 5. Governorates
    if (/محافظ|قاهره|اسكندريه|فيوم|اسوان|اقصر|سينا|سوهاج|قنا|مطروح/.test(q)) {
      return '🗺️ تغطي منصة «احكي يا مصر» محافظات مصر الـ 27 بالكامل! من الإسكندرية ومطروح وبورسعيد شمالاً، إلى الأقصر وأسوان جنوباً، والوادي الجديد وسيناء شرقاً وغرباً. ادخل قسم "الخريطة" لاختيار محافظتك واكتشاف كنوزها التراثية.';
    }

    // Fallback general guidance
    return 'معك حورس الحكيم.. يمكنني إرشادك في:\n1. تفاصيل الحرف الـ 16 وأماكن ورشها ومقاطع الفيديو التوثيقية.\n2. الأكلات المصرية وتحديد أماكن تذوقها على خرائط جوجل.\n3. التواصل مع الحرفيين وطلب المنتجات بالعمولة والدفع الآمن.\nعن ماذا تود أن تسأل بالتحديد؟';
  }

  // Build Component DOM
  function createChatbotDOM() {
    const cfg = window.EhkyChatbotConfig;

    // Chat Window
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
        <span>𓅃</span>
        <span>مرشد التراث الذكي — حفظ الهوية المصرية وحماية الزوار من الاستغلال</span>
      </div>

      <div class="pharaoh-messages-area" id="pharaohMessages"></div>

      <div class="pharaoh-suggestions-row" id="pharaohSuggestions">
        ${cfg.quickQuestions.map(q => `<button type="button" class="pharaoh-suggest-chip" data-q="${q}">${q}</button>`).join('')}
      </div>

      <form class="pharaoh-chat-form" id="pharaohForm">
        <input type="text" class="pharaoh-chat-input" id="pharaohInput" placeholder="اسأل حورس عن الحرف، الأكلات، الحرفيين…" autocomplete="off" required>
        <button type="submit" class="pharaoh-send-btn" aria-label="إرسال">←</button>
      </form>
    `;

    document.body.appendChild(chatWindow);
    return { chatWindow };
  }

  // Component Controller
  function initChatbot() {
    const { chatWindow } = createChatbotDOM();
    const messages = document.getElementById('pharaohMessages');
    const input = document.getElementById('pharaohInput');
    const form = document.getElementById('pharaohForm');
    const closeBtn = document.getElementById('pharaohCloseBtn');
    const suggestions = document.getElementById('pharaohSuggestions');

    function addMessage(text, isUser = false) {
      const msg = document.createElement('div');
      msg.className = `pharaoh-msg ${isUser ? 'pharaoh-msg-user' : 'pharaoh-msg-bot'}`;
      msg.innerHTML = text.replace(/\n/g, '<br>');
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

      // Typing feedback
      const typing = document.createElement('div');
      typing.className = 'pharaoh-msg pharaoh-msg-bot pharaoh-typing';
      typing.textContent = 'حورس يفكر في سجلات التراث…';
      messages.appendChild(typing);
      messages.scrollTop = messages.scrollHeight;

      setTimeout(async () => {
        typing.remove();
        if (window.EhkyChatbotConfig.USE_REMOTE_API) {
          try {
            const res = await fetch(window.EhkyChatbotConfig.apiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: text })
            });
            if (res.ok) {
              const data = await res.json();
              addMessage(data.reply || data.message || 'تم استقبال الرد.');
              return;
            }
          } catch (e) {
            console.warn('[Chatbot] Remote API failed, falling back to local reasoning:', e);
          }
        }
        const answer = getLocalResponse(text);
        addMessage(answer, false);
      }, 350);
    }

    // Bindings
    closeBtn.addEventListener('click', closeChat);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = input.value;
      input.value = '';
      handleUserQuery(q);
    });

    suggestions.addEventListener('click', (e) => {
      const chip = e.target.closest('.pharaoh-suggest-chip');
      if (chip && chip.dataset.q) {
        handleUserQuery(chip.dataset.q);
      }
    });

    // Connect to Floating Horus Companion Dock
    const horusBtn = document.getElementById('horusGuideBtn');
    const horusBubble = document.getElementById('horusBubble');
    if (horusBtn) horusBtn.addEventListener('click', () => openChat());
    if (horusBubble) horusBubble.addEventListener('click', () => openChat());

    // Expose Global Helper
    window.openEhkyChatbot = openChat;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
  } else {
    initChatbot();
  }
})();
