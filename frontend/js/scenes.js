/* Scenic opening for all 27 governorates with multilingual captions. */
(() => {
  const scenes = [
    {id:'giza',name:'أهرامات الجيزة',nameEn:'Pyramids of Giza',province:'الجيزة',provinceEn:'Giza'},
    {id:'alex',name:'قلعة قايتباي',nameEn:'Qaitbay Citadel',province:'الإسكندرية',provinceEn:'Alexandria'},
    {id:'aswan',name:'معبد أبو سمبل الكبير',nameEn:'Great Temple of Abu Simbel',province:'أسوان',provinceEn:'Aswan'},
    {id:'luxor',name:'معابد الكرنك',nameEn:'Karnak Temples',province:'الأقصر',provinceEn:'Luxor'},
    {id:'matrouh',name:'بحيرات واحة سيوة',nameEn:'Siwa Oasis Salt Lakes',province:'مطروح',provinceEn:'Matrouh'},
    {id:'newvalley',name:'الصحراء البيضاء — الفرافرة',nameEn:'White Desert — Farafra',province:'الوادي الجديد',provinceEn:'New Valley'},
    {id:'redsea',name:'ساحل مرسى علم',nameEn:'Marsa Alam Coast',province:'البحر الأحمر',provinceEn:'Red Sea'},
    {id:'qalyubia',name:'القناطر الخيرية',nameEn:'Qanater El-Khayreya',province:'القليوبية',provinceEn:'Qalyubia'},
    {id:'cairo',name:'قلعة صلاح الدين ومسجد محمد علي',nameEn:'Saladin Citadel & Mohamed Ali Mosque',province:'القاهرة',provinceEn:'Cairo'},
    {id:'beheira',name:'بيوت رشيد الأثرية',nameEn:'Historic Houses of Rosetta (Rashid)',province:'البحيرة',provinceEn:'Beheira'},
    {id:'kafr',name:'بحيرة البرلس',nameEn:'Lake Burullus',province:'كفر الشيخ',provinceEn:'Kafr El-Sheikh'},
    {id:'dakahlia',name:'كورنيش النيل بالمنصورة',nameEn:'Nile Corniche at Mansoura',province:'الدقهلية',provinceEn:'Dakahlia'},
    {id:'damietta',name:'اللسان برأس البر',nameEn:'Ras El-Bar Point',province:'دمياط',provinceEn:'Damietta'},
    {id:'gharbia',name:'مسجد السيد البدوي بطنطا',nameEn:'Al-Sayed Al-Badawi Mosque in Tanta',province:'الغربية',provinceEn:'Gharbia'},
    {id:'monufia',name:'ريف دنشواي وأبراج الحمام',nameEn:'Denshway Countryside & Dovecotes',province:'المنوفية',provinceEn:'Monufia'},
    {id:'sharqia',name:'تل بسطة',nameEn:'Tell Basta',province:'الشرقية',provinceEn:'Sharqia'},
    {id:'portsaid',name:'مبنى هيئة قناة السويس التاريخي',nameEn:'Historic Suez Canal Building',province:'بورسعيد',provinceEn:'Port Said'},
    {id:'ismailia',name:'بحيرة التمساح',nameEn:'Lake Timsah',province:'الإسماعيلية',provinceEn:'Ismailia'},
    {id:'suez',name:'ساحل العين السخنة',nameEn:'Ain Sokhna Coast',province:'السويس',provinceEn:'Suez'},
    {id:'northsinai',name:'شاطئ النخيل بالعريش',nameEn:'Palm Beach at Al-Arish',province:'شمال سيناء',provinceEn:'North Sinai'},
    {id:'southsinai',name:'دير سانت كاترين',nameEn:'Saint Catherine Monastery',province:'جنوب سيناء',provinceEn:'South Sinai'},
    {id:'fayoum',name:'شلالات وادي الريان',nameEn:'Wadi El-Rayan Waterfalls',province:'الفيوم',provinceEn:'Fayoum'},
    {id:'beni',name:'هرم ميدوم',nameEn:'Meidum Pyramid',province:'بني سويف',provinceEn:'Beni Suef'},
    {id:'minya',name:'مقابر بني حسن ووادي النيل',nameEn:'Beni Hassan Tombs & The Nile',province:'المنيا',provinceEn:'Minya'},
    {id:'asyut',name:'الدير المحرق بالقوصية',nameEn:'Al-Muharraq Monastery in Qusiya',province:'أسيوط',provinceEn:'Asyut'},
    {id:'sohag',name:'معبد سيتي الأول بأبيدوس',nameEn:'Seti I Temple at Abydos',province:'سوهاج',provinceEn:'Sohag'},
    {id:'qena',name:'معبد دندرة',nameEn:'Dendera Temple',province:'قنا',provinceEn:'Qena'}
  ];

  const sceneDurationMs = 5000;
  let index = 0, hero = null, timer = null, remaining = sceneDurationMs, lastTick = 0, revision = 0;
  let imageLayer = null, caption = null, count = null;
  const isNight = () => document.body.classList.contains('night');
  const canMove = () => !document.hidden && !document.body.classList.contains('motion-off');
  const asset = (s, night) => night ? `assets/scene-${s.id}-night.webp` : s.id === 'giza' ? null : `assets/scene-${s.id}.webp`;

  function formatCaption(s) {
    const lang = (window.I18N && window.I18N.current) || 'ar';
    if (lang === 'ar') return `${s.name} — محافظة ${s.province}`;
    const pTrans = window.EhkyHeritageTranslations && window.EhkyHeritageTranslations.provinces && window.EhkyHeritageTranslations.provinces[s.id];
    const pName = (pTrans && (pTrans[lang] || pTrans.en)) || s.provinceEn || s.province;
    return `${s.nameEn || s.name} — ${pName}`;
  }

  function tick() {
    const now = Date.now();
    if (canMove()) {
      remaining -= now - lastTick;
      if (remaining <= 0) {
        remaining = sceneDurationMs;
        show(index + 1);
      }
    }
    lastTick = now;
  }

  function preloadNext() {
    const next = scenes[(index + 1) % scenes.length];
    const src = asset(next, isNight());
    if (src) {
      const img = new Image();
      img.src = src;
    }
  }

  async function show(next, themeOnly = false) {
    if (!hero?.isConnected) return;
    const generation = ++revision, target = hero, layer = imageLayer;
    const wanted = (next + scenes.length) % scenes.length, s = scenes[wanted], night = isNight();
    try {
      let incoming = null;
      const src = asset(s, night);
      if (src) {
        incoming = new Image();
        incoming.className = 'scene-still';
        incoming.alt = '';
        incoming.setAttribute('aria-hidden', 'true');
        incoming.src = src;
        await incoming.decode();
        if (generation !== revision || target !== hero || !target.isConnected) return;
        if (s.id === 'giza') incoming.classList.add('scene-giza');
        layer.append(incoming);
        incoming.getBoundingClientRect();
        incoming.classList.add('is-active');
      }
      if (generation !== revision || target !== hero) return;
      const old = [...layer.querySelectorAll('.scene-still')].filter(el => el !== incoming);
      old.forEach(el => el.classList.remove('is-active'));
      setTimeout(() => old.forEach(el => el.remove()), 1500);
      index = wanted;
      if (!themeOnly) remaining = sceneDurationMs;
      target.dataset.scene = s.id;
      target.dataset.sceneMode = night ? 'night' : 'day';
      const video = target.querySelector('video');
      video.style.opacity = src ? '0' : '1';
      caption.textContent = formatCaption(s);
      count.textContent = `${index + 1} / ${scenes.length}`;
      if (!src && canMove()) video.play().catch(() => {}); else video.pause();
      preloadNext();
    } catch {
      if (generation === revision) caption.textContent = formatCaption(s);
    }
  }

  function attach() {
    const found = document.querySelector('.hero.cinema');
    if (found === hero) return;
    clearInterval(timer);
    timer = null;
    hero = found;
    revision++;
    if (!hero) return;
    imageLayer = document.createElement('div');
    imageLayer.className = 'scene-images';
    imageLayer.setAttribute('aria-hidden', 'true');
    hero.prepend(imageLayer);
    const existing = hero.querySelector('.scene-caption');
    existing.classList.add('scene-place');
    existing.removeAttribute('aria-hidden');
    existing.innerHTML = '<span class="scene-place-name"></span><small data-i18n="scenicSubTitle">تصوّر فني متحرك · ٢٧ محافظة</small>';
    caption = existing.querySelector('.scene-place-name');
    caption.textContent = formatCaption(scenes[0]);
    const controls = document.createElement('div');
    controls.className = 'scene-controls';
    controls.setAttribute('aria-label', 'Change Province Scene');
    controls.innerHTML = '<button type="button" aria-label="Previous">←</button><span class="scene-count" dir="ltr">1 / 27</span><button type="button" aria-label="Next">→</button>';
    hero.append(controls);
    count = controls.querySelector('.scene-count');
    const buttons = controls.querySelectorAll('button');
    buttons[0].onclick = () => show(index - 1);
    buttons[1].onclick = () => show(index + 1);
    remaining = sceneDurationMs;
    lastTick = Date.now();
    timer = setInterval(tick, 250);
    show(index, true);
  }

  new MutationObserver(attach).observe(document.getElementById('app'), { childList: true });
  document.addEventListener('visibilitychange', () => { lastTick = Date.now(); });
  let previousNight = isNight();
  new MutationObserver(() => {
    const night = isNight();
    if (night !== previousNight) {
      previousNight = night;
      show(index, true);
    }
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });

  window.addEventListener('ehkyLanguageChanged', () => {
    if (caption && hero) {
      caption.textContent = formatCaption(scenes[index]);
    }
  });

  attach();
})();
