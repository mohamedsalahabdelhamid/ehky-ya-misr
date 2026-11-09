'use strict';

/**
 * ==============================================================================
 * EHKY YA MISR - MAIN APPLICATION CONTROLLER
 * ==============================================================================
 * • Multilingual (ar, en, fr, it, de) with RTL/LTR support.
 * • Hybrid Video Player: Local offline MP4 playback vs YouTube in-page embed with CC.
 * • Egyptian Traditional Foods Directory with Google Maps restaurants search.
 * • Fair Trade Artisans Marketplace: Direct live chat, custom commission orders.
 * • Buyer Protection & Checkout Modal: Credit Cards & Vodafone Cash (010 2345 6789).
 * • Animated Horus Royal Companion with context-aware guidance.
 * ==============================================================================
 */

const app = document.getElementById('app');

// Application State
let currentLang = 'ar';
let userRole = 'tourist'; // 'tourist' or 'artisan'
let selectedProvince = 'alex';
let category = 'all';
let locality = 'all';
let searchTerm = '';
let era = 'all';
let mapZoom = 1;
let activeVideoSource = 'hybrid'; // 'local' or 'youtube'
let provincesData = [];
let categoriesData = [];

// Init Stored Preferences
try {
  currentLang = localStorage.getItem('ehky-lang') || 'ar';
  userRole = localStorage.getItem('ehky-role') || 'tourist';
} catch (e) {}

// Vector Graphics
const boatSvg = `<svg class="boat" viewBox="0 0 260 160" aria-hidden="true"><path d="M20 111Q130 151 244 98L211 140Q122 169 48 139Z" fill="#77522f" stroke="#eed4a0" stroke-width="3"/><path d="M45 121Q133 144 224 115M59 132Q135 150 211 128" stroke="#d5ae71" fill="none" stroke-width="2"/><path d="M128 18V118M128 21L202 98H134Z" stroke="#fff1d2" fill="#eddfbd" stroke-width="3"/><path d="M120 35L66 101H120Z" fill="#fff5d8" opacity=".8"/><path d="M10 154Q40 147 68 154T123 154T181 154T246 154" fill="none" stroke="#336f79" stroke-width="4"/></svg>`;

const crumb = (htmlText) => `<div class="crumb"><a href="#home">${t('navHome')}</a> / ${htmlText}</div>`;

function t(key) {
  if (window.I18N && typeof window.I18N.t === 'function') {
    return window.I18N.t(key);
  }
  return key;
}

// -----------------------------------------------------------------------------
// HORUS COMPANION SPEECH UPDATER
// -----------------------------------------------------------------------------
function updateHorusGuidance(routeKey) {
  const bubble = document.getElementById('horusSpeechText');
  if (!bubble) return;

  const messages = {
    home: {
      ar: 'أهلاً بك في مصر! اختر وجهتك لاكتشاف الكنوز التراثية وحرف الأجداد 𓅃',
      en: 'Welcome to Egypt! Choose your destination to uncover living heritage 𓅃',
      fr: 'Bienvenue en Égypte ! Choisissez une destination pour découvrir le patrimoine 𓅃',
      it: 'Benvenuti in Egitto! Esplorate il patrimonio vivente 𓅃',
      de: 'Willkommen in Ägypten! Entdecken Sie das lebendige Kulturerbe 𓅃'
    },
    map: {
      ar: 'خريطة الـ 27 محافظة.. انقر على أي محافظة لمعرفة تاريخها وحرفها وأكلاتها.',
      en: 'Map of 27 Governorates.. Click any province to explore its crafts & culture.',
      fr: 'Carte des 27 gouvernorats.. Cliquez pour découvrir les trésors locaux.',
      it: 'Mappa dei 27 governatorati.. Cliccate per scoprire tradizioni e artigianato.',
      de: 'Karte der 27 Gouvernements.. Klicken Sie, um lokales Handwerk zu erkunden.'
    },
    heritage: {
      ar: 'هنا تجتمع براعة الأجداد في الحرف والفنون والتقاليد الأصيلة.',
      en: 'Here ancestral mastery gathers in crafts, folklore, and living traditions.',
      fr: 'Ici se réunit la maîtrise ancestrale de l’artisanat et des traditions.',
      it: 'Qui si unisce la maestria artigianale e le tradizioni viventi.',
      de: 'Hier versammelt sich die meisterhafte Handwerkskunst der Vorfahren.'
    },
    foods: {
      ar: 'أكلات مصر التراثية! انقر على زر الخريطة لأي أكلة لتصل لأشهر مطاعمها 🍲',
      en: 'Traditional Egyptian Culinary Arts! Click Google Maps to find authentic restaurants 🍲',
      fr: 'Saveurs authentiques ! Cliquez sur la carte pour trouver les meilleurs restaurants 🍲',
      it: 'Cucina tradizionale egiziana! Cliccate per trovare i migliori ristoranti tipici 🍲',
      de: 'Traditionelle ägyptische Küche! Finden Sie die besten Restaurants auf Google Maps 🍲'
    },
    artisans: {
      ar: 'سوق الحرفيين المعتمدين.. نوفر لك الأمان والطلب بالعمولة وحماية تامة من الاستغلال 🛡️',
      en: 'Verified Artisans Market.. Fair trade, custom orders & complete buyer protection 🛡️',
      fr: 'Marché des artisans vérifiés.. Commerce équitable et protection des acheteurs 🛡️',
      it: 'Mercato degli artigiani certificati.. Commercio equo e ordini personalizzati 🛡️',
      de: 'Verifizierter Handwerkermarkt.. Fairer Handel und garantierter Käuferschutz 🛡️'
    },
    craft: {
      ar: 'شاهد التوثيق المرئي عالي الجودة وتواصل مباشرة مع شيخ الصنعة لطلب قطعتك!',
      en: 'Watch the high-definition documentary and chat directly with the master craftsman!',
      fr: 'Regardez le documentaire et échangez en direct avec le maître artisan !',
      it: 'Guardate il documentario e chattate direttamente con il maestro artigiano!',
      de: 'Sehen Sie sich die Dokumentation an und sprechen Sie direkt mit dem Handwerksmeister!'
    },
    food: {
      ar: 'أصل الطبخ المصري وحكايته.. تذوق التاريخ في كل لقمة!',
      en: 'The authentic story of Egyptian cooking.. Taste living history in every bite!',
      fr: 'L’histoire culinaire égyptienne.. Savourez l’histoire à chaque bouchée !',
      it: 'La storia della cucina egiziana.. Assaporate la tradizione!',
      de: 'Die Geschichte der ägyptischen Küche.. Erleben Sie Tradition mit jedem Bissen!'
    }
  };

  const pool = messages[routeKey] || messages.home;
  bubble.textContent = pool[currentLang] || pool.ar;
}

// -----------------------------------------------------------------------------
// NAVIGATION ROUTES HTML COMPONENT
// -----------------------------------------------------------------------------
function routes() {
  return `
    <div class="routes">
      <button class="route" data-route="map">
        <div>
          <h2>${t('routeMapTitle')}</h2>
          <p>${t('routeMapDesc')}</p>
        </div>
        <span class="num">01</span>
        <span class="go">${t('routeMapGo')} <span class="circle">←</span></span>
      </button>

      <button class="route" data-route="heritage">
        <div>
          <h2>${t('routeHeritageTitle')}</h2>
          <p>${t('routeHeritageDesc')}</p>
        </div>
        <span class="num">02</span>
        <span class="go">${t('routeHeritageGo')} <span class="circle">←</span></span>
      </button>

      <button class="route" data-route="artisans">
        <div>
          <h2>${t('navArtisans')} 🛡️</h2>
          <p>${currentLang === 'ar' ? 'تواصل مع شيوخ الصنعة واطلب قطعتك بالعمولة بأمان تام.' : 'Direct access to verified master artisans and custom commissions.'}</p>
        </div>
        <span class="num">03</span>
        <span class="go">${currentLang === 'ar' ? 'سوق الحرفيين' : 'View Market'} <span class="circle">←</span></span>
      </button>

      <button class="route" data-route="foods">
        <div>
          <h2>${t('navFoods')} 🍲</h2>
          <p>${currentLang === 'ar' ? 'تذوق أصل الأكلات الشعبية واعرف أشهر المطاعم على الخريطة.' : 'Discover traditional dishes and find top authentic restaurants on Google Maps.'}</p>
        </div>
        <span class="num">04</span>
        <span class="go">${currentLang === 'ar' ? 'دليل الأكلات' : 'Food Guide'} <span class="circle">←</span></span>
      </button>
    </div>
  `;
}

// -----------------------------------------------------------------------------
// 1. HOME VIEW
// -----------------------------------------------------------------------------
function home() {
  const cats = [
    { id: 'craft', title: t('catCraft') },
    { id: 'food', title: t('catFood') },
    { id: 'music', title: t('catMusic') },
    { id: 'story', title: t('catStory') }
  ];

  return `
    <section class="hero cinema">
      <video class="scene-video" autoplay muted loop playsinline preload="metadata" poster="assets/giza-daylight.png" aria-hidden="true">
        <source src="assets/giza-daylight.mp4" type="video/mp4">
      </video>
      <div class="scene-shade" aria-hidden="true"></div>
      <div class="hero-copy">
        <span class="eyebrow">${t('heroEyebrow')}</span>
        <h1>${t('heroTitle')}<em>${t('heroTitleEm')}</em></h1>
        <p>${t('heroDesc')}</p>
        <span class="quiet">${t('heroSubNotice')}</span>
      </div>
      <div class="hero-routes">${routes()}</div>
      <span class="scene-caption">${currentLang === 'ar' ? 'تصور فني بحركة كاميرا · الجيزة، مصر' : 'Artistic camera scenic view · Giza, Egypt'}</span>
    </section>

    <div class="container">
      <div class="timeline" aria-label="استكشاف الفترات الزمنية">
        ${[
          ['ancient', currentLang === 'ar' ? 'مصر القديمة' : 'Ancient Egypt'],
          ['coptic', currentLang === 'ar' ? 'العصر القبطي' : 'Coptic Era'],
          ['islamic', currentLang === 'ar' ? 'العصر الإسلامي' : 'Islamic Era'],
          ['modern', currentLang === 'ar' ? 'العصر الحديث' : 'Modern Era']
        ].map(x => `<button data-era="${x[0]}">${x[1]}</button>`).join('')}
      </div>

      <div class="section-head" id="heritageCategories" tabindex="-1">
        <h2>${currentLang === 'ar' ? 'تراث مصر.. بكل ألوانه' : 'Living Heritage of Egypt'}</h2>
      </div>

      <div class="categories">
        ${cats.map(x => `
          <button class="cat" data-cat="${x.id}">
            <div class="photo ${x.id}" role="img" aria-label="صورة فنية توضيحية"></div>
            <span>${x.title}</span>
            <small>←</small>
          </button>
        `).join('')}
      </div>

      <!-- Fair Trade Protection Highlight -->
      <section class="intro-strip" style="background:linear-gradient(135deg, rgba(212,175,55,0.08), rgba(18,61,66,0.08));border:1px solid var(--gold);margin:40px 0;padding:30px;border-radius:18px">
        <h2>${currentLang === 'ar' ? 'حماية السياح والمشترين من الاستغلال' : 'Fair Trade: Protecting Tourists & Buyers'}</h2>
        <div>
          <p>${currentLang === 'ar' 
            ? 'نوفر لك خط اتصال مباشر مع شيوخ الصنعة في مصر؛ لتطلب قطعتك الأصلية بالعمولة أو المقاسات المطلوبة بالأسعار العادلة الحقيقية، مع ضمان المنصة الكامل للدفع حتى استلام القطعة وفحصها.'
            : 'Direct connection with verified Egyptian master craftsmen. Order authentic pieces or bespoke commissions at genuine fair prices, with complete buyer escrow protection.'}</p>
          <div style="display:flex;gap:12px;margin-top:15px;flex-wrap:wrap">
            <a href="#artisans" class="pill" style="background:var(--gold);color:#0f2147;font-weight:bold">${t('navArtisans')} ←</a>
            <a href="#foods" class="pill">${t('navFoods')} 📍</a>
          </div>
        </div>
      </section>
    </div>
  `;
}

// -----------------------------------------------------------------------------
// 2. INTERACTIVE MAP VIEW
// -----------------------------------------------------------------------------
function mapArtwork() {
  return `
    <div class="map-viewport" id="mapViewport">
      <div class="map-world" id="mapWorld">
        <img class="floating-country" src="assets/egypt-floating-south-v2.webp" alt="مجسم فني لمصر وحرفها التقليدية" draggable="false">
        ${provincesData.map(p => {
          const pos = p.mapPos || [50, 50];
          return `
            <button class="map-spot ${p.id === selectedProvince ? 'active' : ''}" 
                    data-prov="${p.id}" 
                    data-map-prov="${p.id}" 
                    style="left:${pos[0]}%;top:${pos[1]}%" 
                    aria-label="${p.name}" 
                    title="${p.name}">
              <span class="spot-pulse"></span>
              <span class="spot-core"></span>
              <span class="spot-label">${p.name}</span>
            </button>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function mapPage() {
  const p = provincesData.find(x => x.id === selectedProvince) || provincesData[0] || { id: 'alex', name: 'الإسكندرية' };

  return `
    <div class="page map-page">
      ${crumb(t('navMap'))}
      <div class="map-header">
        <div>
          <span class="eyebrow">${t('routeMapTitle')}</span>
          <h1>${currentLang === 'ar' ? 'خريطة التراث المصري التفاعلية' : 'Interactive Egyptian Heritage Map'}</h1>
          <p class="sub">${currentLang === 'ar' ? 'اختر أي محافظة من الـ 27 لاكتشاف أسرارها، حرفها، وأكلاتها الشعبية.' : 'Explore crafts, traditions, and culinary heritage across all 27 governorates.'}</p>
        </div>
        <div class="map-controls">
          <button class="pill" data-map-zoom="in" title="تكبير">+</button>
          <button class="pill" data-map-zoom="out" title="تصغير">−</button>
          <button class="pill" data-map-zoom="reset" title="إعادة ضبط">⟲</button>
        </div>
      </div>

      <div class="map-layout">
        <div class="map-canvas-card">
          ${mapArtwork()}
        </div>

        <aside class="map-sidebar">
          <div class="search-box">
            <input type="text" id="provinceSearch" placeholder="${currentLang === 'ar' ? 'ابحث عن محافظة…' : 'Search governorate…'}" autocomplete="off">
          </div>

          <div class="province-card" id="provinceCard">
            <h2>${p.name}</h2>
            <p id="provinceDesc">${currentLang === 'ar' ? `استكشف التراث الحي والحرف الموثقة في محافظة ${p.name}.` : `Discover traditional crafts and heritage of ${p.name}.`}</p>
            <div style="display:flex;gap:10px;margin-top:15px;flex-wrap:wrap">
              <a href="#province/${p.id}" class="primary">${currentLang === 'ar' ? 'استعراض تراث المحافظة ←' : 'Explore Heritage ←'}</a>
              <a href="#foods" class="pill">${t('navFoods')} 📍</a>
            </div>
          </div>

          <div class="provinces-list" id="provincesList">
            ${provincesData.map(item => `
              <button class="prov-item ${item.id === selectedProvince ? 'active' : ''}" data-prov="${item.id}">
                <span>${item.name}</span>
                <small>→</small>
              </button>
            `).join('')}
          </div>
        </aside>
      </div>
    </div>
  `;
}

function updateProvince() {
  const p = provincesData.find(x => x.id === selectedProvince);
  if (!p) return;

  const card = document.getElementById('provinceCard');
  if (card) {
    card.innerHTML = `
      <h2>${p.name}</h2>
      <p id="provinceDesc">${currentLang === 'ar' ? `استكشف التراث الحي والحرف الموثقة في محافظة ${p.name}.` : `Discover traditional crafts and heritage of ${p.name}.`}</p>
      <div style="display:flex;gap:10px;margin-top:15px;flex-wrap:wrap">
        <a href="#province/${p.id}" class="primary">${currentLang === 'ar' ? 'استعراض تراث المحافظة ←' : 'Explore Heritage ←'}</a>
        <a href="#foods" class="pill">${t('navFoods')} 📍</a>
      </div>
    `;
  }

  document.querySelectorAll('.map-spot').forEach(s => {
    s.classList.toggle('active', s.dataset.prov === selectedProvince);
  });
  document.querySelectorAll('.prov-item').forEach(i => {
    i.classList.toggle('active', i.dataset.prov === selectedProvince);
  });
}

function updateProvinceList(q) {
  const list = document.getElementById('provincesList');
  if (!list) return;

  const filtered = provincesData.filter(p => !q || p.name.includes(q.trim()));
  list.innerHTML = filtered.map(item => `
    <button class="prov-item ${item.id === selectedProvince ? 'active' : ''}" data-prov="${item.id}">
      <span>${item.name}</span>
      <small>→</small>
    </button>
  `).join('');
}

// -----------------------------------------------------------------------------
// 3. HERITAGE BROWSE VIEW
// -----------------------------------------------------------------------------
function heritagePage(provFilter = null) {
  if (provFilter) locality = provFilter;

  const prov = provincesData.find(p => p.id === locality);
  const provTitle = prov ? prov.name : t('catAll');

  return `
    <div class="page">
      ${crumb(`${t('navHeritage')} ${prov ? `/ ${prov.name}` : ''}`)}
      
      <div class="detail-top">
        <div>
          <span class="eyebrow">${t('routeHeritageTitle')}</span>
          <h1>${prov ? `${currentLang === 'ar' ? 'تراث وحرف محافظة' : 'Heritage of'} ${prov.name}` : (currentLang === 'ar' ? 'سجل التراث والهوية المصرية' : 'Egyptian Heritage Registry')}</h1>
          <p class="sub">${currentLang === 'ar' ? 'حرف تقليدية، أكلات شعبية، عادات وفنون متوارثة موثقة من أصحابها الأصليين.' : 'Traditional crafts, culinary arts, folklore and living traditions.'}</p>
        </div>
      </div>

      <div class="filters-bar" style="display:flex;gap:12px;margin:20px 0;flex-wrap:wrap;align-items:center">
        <div class="search-box" style="flex:1;min-width:220px">
          <input type="text" id="heritageSearch" placeholder="${t('searchPlaceholder')}" value="${searchTerm}">
        </div>

        <select id="locality" class="filter-select" aria-label="المحافظة">
          <option value="all">${currentLang === 'ar' ? 'كل المحافظات' : 'All Governorates'}</option>
          ${provincesData.map(p => `<option value="${p.id}" ${locality === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
        </select>

        <select id="era" class="filter-select" aria-label="العصر">
          <option value="all" ${era === 'all' ? 'selected' : ''}>${currentLang === 'ar' ? 'كل العصور' : 'All Eras'}</option>
          <option value="ancient" ${era === 'ancient' ? 'selected' : ''}>${currentLang === 'ar' ? 'مصر القديمة' : 'Ancient Egypt'}</option>
          <option value="islamic" ${era === 'islamic' ? 'selected' : ''}>${currentLang === 'ar' ? 'العصر الإسلامي' : 'Islamic'}</option>
          <option value="modern" ${era === 'modern' ? 'selected' : ''}>${currentLang === 'ar' ? 'العصر الحديث' : 'Modern'}</option>
        </select>
      </div>

      <div class="category-tabs" style="display:flex;gap:8px;margin-bottom:24px;overflow-x:auto;padding-bottom:6px">
        ${[
          ['all', t('catAll')],
          ['craft', t('catCraft')],
          ['food', t('catFood')],
          ['music', t('catMusic')],
          ['custom', t('catCustom')]
        ].map(([id, label]) => `
          <button class="filter-pill ${category === id ? 'active' : ''}" data-filter="${id}">${label}</button>
        `).join('')}
      </div>

      <div class="results-grid" id="heritageResults">
        <div class="loading-spinner">${currentLang === 'ar' ? 'جاري تحميل سجلات التراث…' : 'Loading heritage records…'}</div>
      </div>
    </div>
  `;
}

async function renderResults() {
  const container = document.getElementById('heritageResults');
  if (!container) return;

  const items = await window.HeritageService.getHeritageItems({
    category,
    province: locality,
    era,
    search: searchTerm
  });

  if (items && items.length > 0) {
    container.innerHTML = items.map(item => `
      <a href="#craft/${item.id}" class="item-card">
        <div class="card-art" style="${item.youtubeId ? `background:url('https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg') center/cover;position:relative;` : ''}">
          ${item.youtubeId ? `<span style="position:absolute;inset:0;background:rgba(15,33,71,0.4);display:flex;align-items:center;justify-content:center"><svg width="44" height="44" viewBox="0 0 24 24" fill="#d4af37"><path d="M8 5v14l11-7z"/></svg></span>` : boatSvg}
        </div>
        <div class="card-copy">
          <small>${item.category === 'craft' ? t('catCraft') : item.category === 'food' ? t('catFood') : t('catMusic')} • ${item.provinceName}</small>
          <h2>${item.title}</h2>
          <p>${item.summary}</p>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <span class="badge">${t('verifiedBadge')}</span>
            ${item.youtubeId ? `<span class="badge" style="background:#b3261e;color:#fff;border-color:#b3261e">${t('videoBadge')}</span>` : ''}
            ${item.localVideo ? `<span class="badge" style="background:var(--teal);color:#fff">💻 فيديو محلي</span>` : ''}
          </div>
          <p style="margin-top:10px;color:var(--gold);font-weight:bold">${t('exploreStory')}</p>
        </div>
      </a>
    `).join('');
  } else {
    container.innerHTML = `
      <div class="empty">
        <strong>${currentLang === 'ar' ? 'الحكايات لسه بتتجمع' : 'No items match your search'}</strong>
        <p>${currentLang === 'ar' ? 'لا توجد عناصر مطابقة أضيفت للبحث حالياً.' : 'Try adjusting your filters.'}</p>
        <button class="primary" id="resetFilters">${currentLang === 'ar' ? 'عرض كل الحكايات المتاحة ←' : 'View all items ←'}</button>
      </div>
    `;
  }

  document.querySelectorAll('[data-filter]').forEach(b => b.classList.toggle('active', b.dataset.filter === category));
}

// -----------------------------------------------------------------------------
// 4. CRAFT DETAILS VIEW (HYBRID VIDEO + ARTISANS MARKET SECTION)
// -----------------------------------------------------------------------------
async function craftPage(id = 'boats') {
  const craft = await window.HeritageService.getCraftDetails(id);
  if (!craft) {
    return `<div class="page"><h1>${currentLang === 'ar' ? 'الحرفة غير موجودة' : 'Craft not found'}</h1><a href="#heritage" class="primary">${currentLang === 'ar' ? 'العودة للتراث ←' : 'Back to Heritage ←'}</a></div>`;
  }

  // Get matching artisans for this craft
  const craftArtisans = await window.HeritageService.getArtisans({ craftId: craft.id });

  // Video Player Markup (Hybrid: Offline Local MP4 vs YouTube with subtitles in chosen language)
  let videoPlayerHtml = '';
  if (craft.localVideo || craft.youtubeId) {
    videoPlayerHtml = `
      <section class="video-container-card" style="margin:25px 0;background:var(--paper);border:2px solid var(--gold);border-radius:18px;padding:20px;box-shadow:0 12px 36px rgba(0,0,0,0.12)">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px">
          <div>
            <h3 style="margin:0;font-size:18px;color:var(--ink)">🎬 ${t('watchVideo')}</h3>
            <small style="color:var(--muted)">${currentLang === 'ar' ? 'يعمل بدون إنترنت (فيديو محلي) أو عبر البث المباشر مع الترجمة' : 'Supports offline direct playback and online YouTube streaming with CC'}</small>
          </div>

          <!-- Video Source Switcher -->
          <div class="video-toggle-pills" style="display:flex;gap:6px;background:rgba(212,175,55,0.15);padding:4px;border-radius:30px">
            <button class="pill ${activeVideoSource === 'hybrid' ? 'active' : ''}" id="btnSourceHybrid" style="font-size:12px;padding:4px 12px">
              💻 ${currentLang === 'ar' ? 'فيديو محلي (أوفلاين)' : 'Local Video'}
            </button>
            <button class="pill ${activeVideoSource === 'youtube' ? 'active' : ''}" id="btnSourceYt" style="font-size:12px;padding:4px 12px">
              🌐 ${currentLang === 'ar' ? 'يوتيوب مباشر' : 'YouTube'}
            </button>
          </div>
        </div>

        <div id="videoEmbedWrapper" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;background:#000">
          ${renderVideoElement(craft, activeVideoSource)}
        </div>
      </section>
    `;
  }

  // Artisans Section for this craft
  let artisansSectionHtml = `
    <section class="craft-artisans-box" style="margin:35px 0;padding:24px;background:rgba(212,175,55,0.06);border:1px solid var(--gold);border-radius:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:16px">
        <div>
          <h2 style="margin:0;font-size:20px">🏺 ${currentLang === 'ar' ? 'اطلب قطعتك الأصلية من شيوخ الصنعة' : 'Order Direct from Master Artisans'}</h2>
          <p style="margin:4px 0 0;font-size:13px;color:var(--muted)">${currentLang === 'ar' ? 'حماية تامة من الاستغلال والأسعار المبالغ فيها، مع إمكانية التفصيل بالعمولة والدفع الآمن.' : 'Fair prices, bespoke commissions, and escrow buyer protection.'}</p>
        </div>
        <a href="#artisans" class="pill">${currentLang === 'ar' ? 'عرض كل الحرفيين ←' : 'All Artisans ←'}</a>
      </div>

      <div class="artisans-inline-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px">
        ${craftArtisans.length ? craftArtisans.map(a => renderArtisanCard(a)).join('') : `
          <div style="padding:15px;background:#fff;border-radius:10px;border:1px dashed var(--line);grid-column:1/-1">
            <p style="margin:0;color:var(--muted)">${currentLang === 'ar' ? 'جاري اعتماد المزيد من ورش هذه الحرفة لحماية الزوار وضمان الجودة.' : 'More certified workshops for this craft are currently being vetted.'}</p>
          </div>
        `}
      </div>
    </section>
  `;

  return `
    <div class="page">
      ${crumb(`<a href="#heritage">${t('navHeritage')}</a> / <a href="#province/${craft.provinceId}">${craft.provinceName}</a> / ${craft.title}`)}
      
      <div class="detail-top">
        <div>
          <span class="eyebrow">${craft.category === 'craft' ? t('catCraft') : t('catMusic')} • ${craft.provinceName}</span>
          <h1>${craft.title}</h1>
          <p class="sub">${craft.summary}</p>
          <div style="display:flex;gap:8px;align-items:center;margin:12px 0;flex-wrap:wrap">
            <span class="badge">${t('verifiedBadge')}</span>
            <span class="badge" style="background:var(--teal);color:#fff">📍 ${craft.regions}</span>
          </div>
        </div>
        <div class="card-art" style="${craft.youtubeId ? `background:url('https://img.youtube.com/vi/${craft.youtubeId}/hqdefault.jpg') center/cover;position:relative;` : ''}">
          ${craft.youtubeId ? `<span style="position:absolute;inset:0;background:rgba(15,33,71,0.35);display:flex;align-items:center;justify-content:center"><svg width="56" height="56" viewBox="0 0 24 24" fill="#d4af37"><path d="M8 5v14l11-7z"/></svg></span>` : `${boatSvg}`}
        </div>
      </div>

      ${videoPlayerHtml}

      <div class="detail-grid">
        <article class="article">
          <section>
            <h2>${currentLang === 'ar' ? 'عن الحرفة وأصلها التاريخي' : 'Historical Origins'}</h2>
            <p>${craft.description}</p>
          </section>

          <section>
            <h2>${t('materialsUsed')}</h2>
            <p>${craft.materials}</p>
          </section>

          ${craft.tools ? `
            <section>
              <h2>${t('toolsUsed')}</h2>
              <p>${craft.tools}</p>
            </section>
          ` : ''}

          <section>
            <h2>${t('craftSteps')}</h2>
            <ol>
              ${craft.steps.map(s => `<li>${s}</li>`).join('')}
            </ol>
          </section>
        </article>

        <aside class="facts">
          <h3>${currentLang === 'ar' ? 'بطاقة التوثيق' : 'Documentation Card'}</h3>
          <dl>
            <dt>${t('province')}</dt>
            <dd>${craft.provinceName}</dd>
            <dt>${t('regions')}</dt>
            <dd>${craft.regions}</dd>
            <dt>${t('status')}</dt>
            <dd><span style="color:var(--teal);font-weight:bold">${t('verifiedBadge')}</span></dd>
            <dt>${currentLang === 'ar' ? 'حماية الشراء' : 'Buyer Protection'}</dt>
            <dd style="color:var(--gold);font-weight:bold">🛡️ ${currentLang === 'ar' ? 'دفع آمن بالضمان' : 'Escrow Secured'}</dd>
          </dl>
          <button class="primary" id="askHorusBtn" style="margin-top:20px;width:100%">
            ${currentLang === 'ar' ? 'اسأل حورس الحكيم عن الحرفة ✧' : 'Ask Horus about this Craft ✧'}
          </button>
        </aside>
      </div>

      ${artisansSectionHtml}
    </div>
  `;
}

function renderVideoElement(craft, mode) {
  if (mode === 'hybrid' && craft.localVideo) {
    return `
      <video id="playerLocal" controls playsinline preload="metadata" style="position:absolute;top:0;left:0;width:100%;height:100%;background:#000;border:0">
        <source src="${craft.localVideo}" type="video/mp4">
        <p style="color:#fff;padding:20px;text-align:center">
          ${currentLang === 'ar' ? 'لم يتم العثور على الفيديو المحلي على هذا الجهاز. يمكنك التبديل للبث المباشر (يوتيوب).' : 'Local video file not found on this machine. You can switch to YouTube stream.'}
        </p>
      </video>
    `;
  } else if (craft.youtubeId) {
    // YouTube embed with exact subtitle language passing
    const langCode = currentLang === 'ar' ? 'ar' : currentLang;
    const embedUrl = `https://www.youtube-nocookie.com/embed/${craft.youtubeId}?rel=0&enablejsapi=1&cc_load_policy=1&cc_lang_pref=${langCode}&hl=${langCode}`;
    return `
      <iframe src="${embedUrl}" 
              title="${craft.title}" 
              loading="lazy"
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowfullscreen 
              referrerpolicy="strict-origin-when-cross-origin"
              style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;">
      </iframe>
    `;
  }
  return `<div style="color:#fff;display:flex;align-items:center;justify-content:center;height:100%">${currentLang === 'ar' ? 'فيديو غير متاح' : 'No video available'}</div>`;
}

// -----------------------------------------------------------------------------
// 5. TRADITIONAL FOODS VIEW & GOOGLE MAPS RESTAURANTS SEARCH
// -----------------------------------------------------------------------------
async function foodsPage() {
  const foods = await window.HeritageService.getFoods({ search: searchTerm });

  return `
    <div class="page foods-page">
      ${crumb(t('navFoods'))}
      
      <div class="detail-top">
        <div>
          <span class="eyebrow">${t('catFood')}</span>
          <h1>${currentLang === 'ar' ? 'مطبخ التراث المصري وأشهر الأكلات' : 'Authentic Egyptian Culinary Heritage'}</h1>
          <p class="sub">${currentLang === 'ar' ? 'تعرف على حكاية كل أكلة وسرها، وابحث بضغطة زر عن أشهر المطاعم الموثوقة لتذوقها في المحافظة عبر خرائط جوجل.' : 'Explore traditional recipes, stories, and instantly locate authentic restaurants on Google Maps.'}</p>
        </div>
      </div>

      <div class="filters-bar" style="display:flex;gap:12px;margin:20px 0;flex-wrap:wrap">
        <div class="search-box" style="flex:1;min-width:240px">
          <input type="text" id="foodSearchInput" placeholder="${currentLang === 'ar' ? 'ابحث عن أكلة: كشري، ملوخية، حواوشي…' : 'Search dishes: Koshary, Molokhia…'}" value="${searchTerm}">
        </div>
      </div>

      <div class="results-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:24px">
        ${foods.map(food => `
          <div class="food-card" style="background:var(--paper);border:1px solid var(--line);border-radius:18px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 24px rgba(0,0,0,0.06);transition:transform 0.2s">
            <div style="background:linear-gradient(135deg,#0f2147 0%,#123d42 100%);color:#d4af37;padding:24px 20px;position:relative">
              <span style="font-size:36px;display:block;margin-bottom:8px">🍲</span>
              <span class="badge" style="position:absolute;top:15px;${currentLang === 'ar' ? 'left:15px' : 'right:15px'};background:rgba(212,175,55,0.25);color:#fff">${food.provinceName}</span>
              <h2 style="margin:0;font-size:20px;color:#fff">${food.title}</h2>
            </div>
            
            <div style="padding:20px;flex:1;display:flex;flex-direction:column;justify-content:space-between">
              <div>
                <p style="font-size:13.5px;line-height:1.7;color:var(--ink);margin:0 0 14px">${food.summary}</p>
                <div style="background:rgba(0,0,0,0.03);padding:10px 14px;border-radius:10px;margin-bottom:16px">
                  <strong style="font-size:12px;color:var(--teal);display:block;margin-bottom:4px">🌾 ${currentLang === 'ar' ? 'المكونات الأصيلة:' : 'Key Ingredients:'}</strong>
                  <span style="font-size:12px;color:var(--muted)">${food.ingredients}</span>
                </div>
              </div>

              <!-- Google Maps Link Button -->
              <div style="display:flex;gap:10px;flex-direction:column">
                <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(food.mapsQuery)}" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="primary" 
                   style="text-align:center;background:#2d88ff;border-color:#2d88ff;display:flex;align-items:center;justify-content:center;gap:8px">
                  <span>📍</span>
                  <span>${t('mapRestaurantsBtn')}</span>
                </a>
                <a href="#food/${food.id}" class="pill" style="text-align:center">
                  ${currentLang === 'ar' ? 'حكاية الأكلة وطريقتها كاملة ←' : 'Read Full Story & Recipe ←'}
                </a>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

async function foodDetailPage(id) {
  const food = await window.HeritageService.getFoodById(id);
  if (!food) {
    return `<div class="page"><h1>${currentLang === 'ar' ? 'الأكلة غير موجودة' : 'Dish not found'}</h1><a href="#foods" class="primary">${t('navFoods')} ←</a></div>`;
  }

  return `
    <div class="page">
      ${crumb(`<a href="#foods">${t('navFoods')}</a> / ${food.title}`)}
      
      <div class="detail-top">
        <div>
          <span class="eyebrow">${t('catFood')} • ${food.provinceName}</span>
          <h1>${food.title}</h1>
          <p class="sub">${food.summary}</p>
          <div style="display:flex;gap:10px;align-items:center;margin-top:12px">
            <span class="badge">${t('verifiedBadge')}</span>
            <span class="badge" style="background:var(--gold);color:#0f2147;font-weight:bold">${food.bestSeason || 'طوال العام'}</span>
          </div>
        </div>
      </div>

      <div class="detail-grid">
        <article class="article">
          <section>
            <h2>${currentLang === 'ar' ? 'الأصل التاريخي وحكاية الأكلة' : 'Historical Origin & Lore'}</h2>
            <p>${food.description}</p>
          </section>

          <section>
            <h2>${currentLang === 'ar' ? 'المكونات والمقادير التراثية' : 'Authentic Ingredients'}</h2>
            <p>${food.ingredients}</p>
          </section>

          <section class="maps-callout" style="background:rgba(45,136,255,0.08);border:1px solid #2d88ff;padding:24px;border-radius:16px;margin:25px 0">
            <h3 style="margin:0 0 8px;color:#0f2147">📍 ${currentLang === 'ar' ? 'أين تتذوق هذه الأكلة بأصلها في' : 'Where to eat authentic'} ${food.provinceName}؟</h3>
            <p style="margin:0 0 15px;font-size:13px;color:var(--muted)">${currentLang === 'ar' ? 'أعددنا لك استعلاماً دقيقاً على خرائط جوجل يظهر أشهر المطاعم الشعبية والتراثية المجربة في المحافظة.' : 'We prepared a curated Google Maps query for the most recommended heritage eateries.'}</p>
            <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(food.mapsQuery)}" 
               target="_blank" 
               rel="noopener noreferrer" 
               class="primary" 
               style="background:#2d88ff;border-color:#2d88ff;display:inline-flex;align-items:center;gap:8px">
              <span>🗺️</span>
              <span>${currentLang === 'ar' ? 'افتح خريطة المطاعم على Google Maps' : 'Open Restaurants Map on Google Maps'}</span>
            </a>
          </section>
        </article>

        <aside class="facts">
          <h3>${currentLang === 'ar' ? 'بطاقة الأكلة' : 'Culinary Card'}</h3>
          <dl>
            <dt>${t('province')}</dt>
            <dd>${food.provinceName}</dd>
            <dt>${currentLang === 'ar' ? 'الموسم الأنسب' : 'Best Season'}</dt>
            <dd>${food.bestSeason || 'طوال العام'}</dd>
            <dt>${t('status')}</dt>
            <dd><span style="color:var(--teal);font-weight:bold">${t('verifiedBadge')}</span></dd>
          </dl>
          <button class="primary" id="askHorusBtn" style="margin-top:20px;width:100%">
            ${currentLang === 'ar' ? 'اسأل حورس عن وصفات وأكلات أخرى ✧' : 'Ask Horus about Recipes ✧'}
          </button>
        </aside>
      </div>
    </div>
  `;
}

// -----------------------------------------------------------------------------
// 6. FAIR TRADE ARTISANS MARKETPLACE
// -----------------------------------------------------------------------------
async function artisansPage() {
  const artisans = await window.HeritageService.getArtisans({});

  return `
    <div class="page artisans-page">
      ${crumb(t('navArtisans'))}
      
      <div class="detail-top">
        <div>
          <span class="eyebrow">${currentLang === 'ar' ? 'سوق التراث العادل · حماية المشتري والصانع' : 'Fair Trade Heritage Marketplace'}</span>
          <h1>${currentLang === 'ar' ? 'شيوخ الصنعة والحرفيين المعتمدين' : 'Certified Egyptian Master Craftsmen'}</h1>
          <p class="sub">${currentLang === 'ar' ? 'تواصل مباشرة مع أصحاب الورش التراثية بدون وسيط، اطلب قطعتك الأصلية بالعمولة أو اختر من القطع الجاهزة، وأموالك في أمان تام حتى استلام وفحص طلبك.' : 'Connect directly with certified master workshops. Order custom commission pieces with complete buyer escrow protection against price gouging.'}</p>
        </div>
      </div>

      <!-- Trust & Protection Guarantees -->
      <div class="protection-banner" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;margin:25px 0">
        <div style="background:var(--paper);border:1px solid var(--gold);padding:18px;border-radius:14px;display:flex;gap:12px;align-items:center">
          <span style="font-size:28px">🛡️</span>
          <div>
            <strong style="display:block;font-size:14px">${currentLang === 'ar' ? 'حماية من الاستغلال' : 'Fair Price Guarantee'}</strong>
            <small style="color:var(--muted)">${currentLang === 'ar' ? 'أسعار الورشة المعتمدة بدون سماسرة أو استغلال للسائحين.' : 'Direct workshop rates without tourist markups.'}</small>
          </div>
        </div>

        <div style="background:var(--paper);border:1px solid var(--teal);padding:18px;border-radius:14px;display:flex;gap:12px;align-items:center">
          <span style="font-size:28px">💬</span>
          <div>
            <strong style="display:block;font-size:14px">${currentLang === 'ar' ? 'شات مباشر مع الصانع' : 'Direct Live Chat'}</strong>
            <small style="color:var(--muted)">${currentLang === 'ar' ? 'حدد مقاساتك وألوانك واطلب بالعمولة مع صاحب الورشة.' : 'Coordinate custom dimensions and details directly.'}</small>
          </div>
        </div>

        <div style="background:var(--paper);border:1px solid var(--gold);padding:18px;border-radius:14px;display:flex;gap:12px;align-items:center">
          <span style="font-size:28px">💳</span>
          <div>
            <strong style="display:block;font-size:14px">${currentLang === 'ar' ? 'دفع آمن بالضمان' : 'Secure Escrow Payment'}</strong>
            <small style="color:var(--muted)">${currentLang === 'ar' ? 'بطاقات بنكية وفودافون كاش؛ لا يُصرف المبلغ إلا بعد الاستلام.' : 'Cards & Vodafone Cash; funds held until inspection.'}</small>
          </div>
        </div>
      </div>

      <div class="results-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:24px">
        ${artisans.map(a => renderArtisanCard(a, true)).join('')}
      </div>
    </div>
  `;
}

function renderArtisanCard(a, fullView = false) {
  return `
    <div class="artisan-card" style="background:var(--paper);border:1px solid var(--line);border-radius:18px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 24px rgba(0,0,0,0.06);border-top:4px solid var(--gold)">
      <div style="padding:20px;border-bottom:1px solid var(--line)">
        <div style="display:flex;gap:14px;align-items:center">
          <div style="width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#0f2147,#123d42);display:flex;align-items:center;justify-content:center;border:2px solid var(--gold);flex-shrink:0;color:#ffe89a;font-size:28px">
            ⚒️
          </div>
          <div>
            <div style="display:flex;align-items:center;gap:6px">
              <h3 style="margin:0;font-size:17px;color:var(--ink)">${a.name}</h3>
              <span title="صانع معتمد وموثق" style="color:var(--teal)">✓</span>
            </div>
            <small style="color:var(--muted);display:block">${a.craftName} • ${a.provinceName}</small>
            <div style="display:flex;gap:8px;align-items:center;margin-top:4px">
              <span style="color:#d4af37;font-size:13px">★ ${a.rating}</span>
              <span style="font-size:11px;color:var(--muted)">(${a.experienceYears} ${currentLang === 'ar' ? 'سنة خبرة' : 'yrs exp'})</span>
            </div>
          </div>
        </div>
      </div>

      <div style="padding:20px;flex:1;display:flex;flex-direction:column;justify-content:space-between">
        <div>
          <p style="font-size:12.5px;line-height:1.6;color:var(--ink);margin:0 0 12px">${a.bio}</p>
          <div style="font-size:12px;color:var(--muted);margin-bottom:14px">
            <strong>📍 ${currentLang === 'ar' ? 'مقر الورشة:' : 'Workshop:'}</strong> ${a.workshop}
          </div>

          <!-- Ready Items Preview -->
          ${a.readyItems && a.readyItems.length ? `
            <div style="background:rgba(0,0,0,0.02);border:1px solid var(--line);border-radius:10px;padding:12px;margin-bottom:16px">
              <strong style="font-size:12px;color:var(--teal);display:block;margin-bottom:6px">🏺 ${currentLang === 'ar' ? 'نماذج جاهزة للتسليم:' : 'Ready for Order:'}</strong>
              ${a.readyItems.slice(0, 2).map(item => `
                <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;padding:4px 0;border-bottom:1px dashed var(--line)">
                  <span style="color:var(--ink)">${item.title}</span>
                  <strong style="color:var(--gold);white-space:nowrap">${item.price} EGP</strong>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <div style="display:flex;gap:8px;flex-direction:column">
          <button class="primary btn-open-chat" data-artisan-id="${a.id}" style="width:100%;display:flex;align-items:center;justify-content:center;gap:6px">
            <span>💬</span>
            <span>${t('chatWithArtisan')}</span>
          </button>
          
          <button class="pill btn-order-commission" data-artisan-id="${a.id}" style="width:100%;display:flex;align-items:center;justify-content:center;gap:6px;border-color:var(--gold)">
            <span>🛡️</span>
            <span>${currentLang === 'ar' ? 'طلب بالعمولة / تفصيل خاص' : 'Custom Commission Order'}</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

// -----------------------------------------------------------------------------
// 7. DIRECT ARTISAN LIVE CHAT MODAL
// -----------------------------------------------------------------------------
function openArtisanChatModal(artisanId) {
  window.HeritageService.getArtisanById(artisanId).then(artisan => {
    if (!artisan) return;

    let existingModal = document.getElementById('artisanChatModal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'artisanChatModal';
    modal.className = 'ehky-modal-backdrop';
    modal.innerHTML = `
      <div class="ehky-modal-card">
        <div class="ehky-modal-header">
          <div style="display:flex;gap:12px;align-items:center">
            <div style="width:48px;height:48px;border-radius:50%;background:#0f2147;display:flex;align-items:center;justify-content:center;border:2px solid var(--gold);color:#ffe89a;font-size:24px">
              ⚒️
            </div>
            <div>
              <strong style="display:block;font-size:16px">${artisan.name} <span style="color:#00c853;font-size:11px">● متصل الآن</span></strong>
              <small style="color:var(--muted)">${artisan.craftName} — ${artisan.workshop}</small>
            </div>
          </div>
          <button class="ehky-modal-close" id="closeArtisanChat">×</button>
        </div>

        <div class="ehky-protection-tag">
          🛡️ محادثة آمنة ومحمية من منصة احكي يا مصر — لا تقم بتحويل أي مبالغ خارج بوابات الدفع الرسمية للموقع.
        </div>

        <div class="ehky-chat-messages" id="artisanChatMessages">
          <div class="msg-bubble msg-artisan">
            أهلاً بك يا فندم! أنا ${artisan.name}، شيخ صنعة ${artisan.craftName} في ${artisan.provinceName}. يسعدني تنفيذ أي قطعة ترغب فيها بأيدينا، سواء من القطع الجاهزة أو بتفصيل خاص ومقاسات تناسب بيتك. كيف أساعدك اليوم؟
          </div>
        </div>

        <div class="ehky-chat-quick-replies">
          <button class="qr-btn" data-text="مرحبا عم ${artisan.name}، محتاج استفسر عن الأسعار والمقاسات">استفسار عن الأسعار والمقاسات</button>
          <button class="qr-btn" data-text="عايز أطلب قطعة عمولة بمواصفات خاصة">طلب عمولة بمواصفات خاصة</button>
          <button class="qr-btn" data-text="هل متاح الشحن والتوصيل للمحافظات أو خارج مصر؟">الشحن والتوصيل</button>
        </div>

        <form class="ehky-chat-input-bar" id="artisanChatForm">
          <input type="text" id="artisanMsgInput" placeholder="${currentLang === 'ar' ? 'اكتب رسالتك لشيخ الصنعة…' : 'Type your message to the craftsman…'}" autocomplete="off" required>
          <button type="submit" class="primary" style="padding:10px 18px">إرسال</button>
          <button type="button" class="pill btn-proceed-checkout" data-artisan-id="${artisan.id}" style="background:var(--gold);color:#0f2147;font-weight:bold;white-space:nowrap">
            💳 الدفع والطلب
          </button>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = document.getElementById('closeArtisanChat');
    closeBtn.onclick = () => modal.remove();

    const form = document.getElementById('artisanChatForm');
    const input = document.getElementById('artisanMsgInput');
    const msgBox = document.getElementById('artisanChatMessages');

    function appendMessage(text, isClient = true) {
      const b = document.createElement('div');
      b.className = `msg-bubble ${isClient ? 'msg-client' : 'msg-artisan'}`;
      b.textContent = text;
      msgBox.appendChild(b);
      msgBox.scrollTop = msgBox.scrollHeight;
    }

    form.onsubmit = (e) => {
      e.preventDefault();
      const val = input.value.trim();
      if (!val) return;
      appendMessage(val, true);
      input.value = '';

      // Artisan intelligent simulated reply
      setTimeout(() => {
        let reply = '';
        if (/سعر|كام|تكلفه|فلوس/.test(val)) {
          reply = `أسعارنا في الورشة تبدأ من ${artisan.readyItems[0]?.price || 300} ج.م حسب الحجم والخامات المطلوبة، ومعاك ضمان الموقع الكامل. تقدر تضغط على زر "الدفع والطلب" لتأكيد الحجز بأمان.`;
        } else if (/عموله|تفصيل|مقاس|خاص/.test(val)) {
          reply = `تحت أمرك يا فندم! مدة تفصيل العمولة تستغرق عادة ${artisan.customOrderLeadDays || 'أسبوع'}، وسنرسل لك صور مراحل الشغل خطوة بخطوة حتى تستلمها على أكمل وجه.`;
        } else if (/شحن|توصيل|محافظ|سفر/.test(val)) {
          reply = `نوفر شحن آمن وسريع لجميع محافظات مصر الـ 27 مع تغليف محكم مخصص للتحف التراثية ضد الكسر.`;
        } else {
          reply = `أهلاً بك يا فندم! طلبك واهتمامك بتراث ${artisan.craftName} على راسنا. كل تفاصيلك مسجلة ومعاك ضمان استرجاع كامل لو لم تطابق القطعة توقعاتك.`;
        }
        appendMessage(reply, false);
      }, 600);
    };

    // Quick replies
    modal.querySelectorAll('.qr-btn').forEach(b => {
      b.onclick = () => {
        input.value = b.dataset.text;
        form.dispatchEvent(new Event('submit'));
      };
    });

    // Proceed to checkout button
    modal.querySelector('.btn-proceed-checkout').onclick = () => {
      modal.remove();
      openCheckoutModal(artisan);
    };
  });
}

// -----------------------------------------------------------------------------
// 8. PROTECTED ESCROW CHECKOUT MODAL (CARDS & VODAFONE CASH)
// -----------------------------------------------------------------------------
function openCheckoutModal(artisan, itemTitle = null, itemPrice = null) {
  let existing = document.getElementById('checkoutModal');
  if (existing) existing.remove();

  const title = itemTitle || (artisan.readyItems && artisan.readyItems[0] ? artisan.readyItems[0].title : `طلب عمولة خاصة — ${artisan.craftName}`);
  const price = itemPrice || (artisan.readyItems && artisan.readyItems[0] ? artisan.readyItems[0].price : 650);

  const modal = document.createElement('div');
  modal.id = 'checkoutModal';
  modal.className = 'ehky-modal-backdrop';
  modal.innerHTML = `
    <div class="ehky-modal-card checkout-modal-card">
      <div class="ehky-modal-header">
        <div>
          <strong style="display:block;font-size:18px">🛡️ إتمام الطلب والدفع الآمن بالضمان</strong>
          <small style="color:var(--muted)">مشروع «احكي يا مصر» — حماية كاملة للمشتري من الاستغلال</small>
        </div>
        <button class="ehky-modal-close" id="closeCheckout">×</button>
      </div>

      <!-- Order Summary Card -->
      <div class="order-summary-box" style="background:rgba(212,175,55,0.08);border:1px solid var(--gold);padding:16px;border-radius:12px;margin:16px 0">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <strong style="display:block;font-size:14.5px;color:var(--ink)">${title}</strong>
            <small style="color:var(--muted)">الصانع: ${artisan.name} • ${artisan.workshop}</small>
          </div>
          <span style="font-size:20px;font-weight:bold;color:var(--gold)">${price} EGP</span>
        </div>
      </div>

      <!-- Buyer Guarantee Notice -->
      <div class="ehky-protection-tag" style="background:#e8f5e9;border-color:#4caf50;color:#2e7d32">
        ✓ <strong>ضمان المنصة:</strong> لا يتم تحويل المبلغ للورشة إلا بعد استلامك للشحنة والتأكد التام من مطابقتها للجودة المتفق عليها.
      </div>

      <!-- Payment Method Tabs -->
      <div class="payment-tabs" style="display:flex;gap:8px;margin:18px 0;border-bottom:2px solid var(--line);padding-bottom:8px">
        <button class="payment-tab-btn active" id="tabBtnCard" type="button">
          💳 بطاقة بنكية (فيزا / ماستركارد / ميزة)
        </button>
        <button class="payment-tab-btn" id="tabBtnVodafone" type="button">
          📱 فودافون كاش ومحافظ المحمول
        </button>
      </div>

      <!-- Tab 1: Credit Cards -->
      <form id="paymentCardForm" class="payment-pane active">
        <div class="form-row">
          <label>اسم حامل البطاقة</label>
          <input type="text" placeholder="الاسم كما يظهر على الكارت" required>
        </div>
        <div class="form-row">
          <label>رقم البطاقة (16 رقم)</label>
          <input type="text" placeholder="xxxx xxxx xxxx xxxx" maxlength="19" required>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-row">
            <label>تاريخ الانتهاء</label>
            <input type="text" placeholder="MM/YY" maxlength="5" required>
          </div>
          <div class="form-row">
            <label>رمز الأمان (CVV)</label>
            <input type="password" placeholder="3 أرقام" maxlength="3" required>
          </div>
        </div>
        <div class="form-row">
          <label>عنوان التوصيل في مصر أو المحافظة</label>
          <input type="text" placeholder="المحافظة، الحي، اسم الشارع، رقم العقار" required>
        </div>
        <div class="form-row">
          <label>رقم هاتف المستلم (للتنسيق مع مندوب الشحن)</label>
          <input type="tel" placeholder="01xxxxxxxxx" required>
        </div>
        <button type="submit" class="primary" style="width:100%;padding:14px;font-size:16px;margin-top:10px">
          تأكيد الدفع الآمن (${price} EGP) 🔒
        </button>
      </form>

      <!-- Tab 2: Vodafone Cash -->
      <form id="paymentVodafoneForm" class="payment-pane" style="display:none">
        <div style="background:#fff3e0;border:1px solid #ff9800;padding:14px;border-radius:10px;margin-bottom:15px">
          <strong style="display:block;color:#e65100;font-size:14px">خطوات الدفع عبر فودافون كاش:</strong>
          <ol style="margin:8px 0 0;padding-right:20px;font-size:12.5px;line-height:1.7;color:#bf360c">
            <li>قم بتحويل مبلغ <strong>${price} جنيه</strong> إلى رقم محفظة المنصة المعتمد:</li>
            <li style="font-size:15px;font-weight:bold;color:#d32f2f;padding:4px 0">010 2345 6789</li>
            <li>احتفظ برسالة التأكيد، وأدخل رقمك ورقم العملية بالأسفل لربط الطلب.</li>
          </ol>
        </div>

        <div class="form-row">
          <label>رقم المحفظة التي تم التحويل منها</label>
          <input type="tel" placeholder="010 / 011 / 012 / 015..." required>
        </div>
        <div class="form-row">
          <label>رقم المعاملة / كود العملية (Transaction ID)</label>
          <input type="text" placeholder="الرقم المرجعي المذكور في رسالة فودافون كاش" required>
        </div>
        <div class="form-row">
          <label>عنوان التوصيل بالتفصيل</label>
          <input type="text" placeholder="المحافظة، العنوان بالتفصيل للتسليم" required>
        </div>
        <button type="submit" class="primary" style="width:100%;padding:14px;font-size:16px;margin-top:10px;background:#e60000;border-color:#e60000">
          تأكيد تحويل فودافون كاش وتأكيد الطلب 🛡️
        </button>
      </form>

      <!-- Success Confirmation State (Hidden initially) -->
      <div id="checkoutSuccess" style="display:none;text-align:center;padding:30px 10px">
        <div style="font-size:52px;margin-bottom:12px">🎉</div>
        <h3 style="margin:0 0 10px;color:var(--ink);font-size:22px">تم تسجيل طلبك وحفظ حقوقك بنجاح!</h3>
        <p style="font-size:13.5px;color:var(--muted);line-height:1.7;max-width:440px;margin:0 auto 20px">
          رقم تتبع الشحنة والضمان: <strong style="color:var(--gold);font-size:16px">#EHKY-${Math.floor(100000 + Math.random() * 900000)}</strong><br>
          تم إخطار الصانع (${artisan.name}) بالبدء في التجهيز. لن يتم تحويل المبلغ للورشة إلا بعد تسليمك وفحصك للقطعة.
        </p>
        <button class="primary" id="btnFinishCheckout" style="padding:10px 28px">العودة للتصفح ←</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById('closeCheckout').onclick = () => modal.remove();

  // Tab switching
  const tabCard = document.getElementById('tabBtnCard');
  const tabVoda = document.getElementById('tabBtnVodafone');
  const paneCard = document.getElementById('paymentCardForm');
  const paneVoda = document.getElementById('paymentVodafoneForm');
  const successBox = document.getElementById('checkoutSuccess');

  tabCard.onclick = () => {
    tabCard.classList.add('active');
    tabVoda.classList.remove('active');
    paneCard.style.display = 'block';
    paneVoda.style.display = 'none';
  };

  tabVoda.onclick = () => {
    tabVoda.classList.add('active');
    tabCard.classList.remove('active');
    paneVoda.style.display = 'block';
    paneCard.style.display = 'none';
  };

  const handleSuccess = (e) => {
    e.preventDefault();
    paneCard.style.display = 'none';
    paneVoda.style.display = 'none';
    tabCard.parentElement.style.display = 'none';
    document.querySelector('.order-summary-box').style.display = 'none';
    document.querySelector('.ehky-protection-tag').style.display = 'none';
    successBox.style.display = 'block';
  };

  paneCard.onsubmit = handleSuccess;
  paneVoda.onsubmit = handleSuccess;

  document.getElementById('btnFinishCheckout').onclick = () => modal.remove();
}

// -----------------------------------------------------------------------------
// 9. ABOUT PAGE VIEW
// -----------------------------------------------------------------------------
function about() {
  return `
    <div class="page about">
      ${crumb(t('navAbout'))}
      <span class="eyebrow">${t('siteSubtitle')}</span>
      <h1>${currentLang === 'ar' ? 'مشروع «احكي يا مصر»' : 'About Ehky Ya Misr'}</h1>
      <p>${t('heroDesc')}</p>

      <h2>${currentLang === 'ar' ? 'أهداف المشروع.. لمن وُجد «احكي يا مصر»؟' : 'Project Mission & Impact'}</h2>
      <div class="about-goals-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;margin:25px 0">
        <div style="background:var(--paper);border:1px solid var(--line);border-radius:14px;padding:22px;border-top:4px solid var(--gold)">
          <h3 style="margin:0 0 10px;color:var(--ink);font-size:17px">🌍 ${currentLang === 'ar' ? 'مرشد حقيقي للسياح وزوار مصر' : 'Authentic Guide for International Tourists'}</h3>
          <p style="font-size:13px;line-height:1.8;color:var(--muted);margin:0">${currentLang === 'ar' ? 'مساعدة السياح القادمين إلى مصر لفهم عمق الثقافة المصرية الأصيلة لما وراء المعالم السياحية التقليدية، وإرشادهم للوصول إلى الأماكن والورش والأسواق التراثية الحقيقية وتذوق الأكلات الشعبية بأصولها مع حماية تامة من الاستغلال.' : 'Empowering international travelers to explore beyond mainstream tourism, discover local craft masters and heritage foods, with certified translation and buyer protection.'}</p>
        </div>

        <div style="background:var(--paper);border:1px solid var(--line);border-radius:14px;padding:22px;border-top:4px solid var(--teal)">
          <h3 style="margin:0 0 10px;color:var(--ink);font-size:17px">🇪🇬 ${currentLang === 'ar' ? 'دليل للمصريين بين المحافظات' : 'Connecting Egyptians across 27 Governorates'}</h3>
          <p style="font-size:13px;line-height:1.8;color:var(--muted);margin:0">${currentLang === 'ar' ? 'تمكين المصريين والمسافرين بين مختلف المدن والقرى من استكشاف التنوع الثقافي الفريد لبلدهم، ومعرفة ما يميز كل محافظة من حرف وفنون وأمثال وعادات شعبية متوارثة عبر العصور.' : 'Uniting generations by documenting oral histories, regional culinary traditions, and local customs.'}</p>
        </div>

        <div style="background:var(--paper);border:1px solid var(--line);border-radius:14px;padding:22px;border-top:4px solid var(--gold)">
          <h3 style="margin:0 0 10px;color:var(--ink);font-size:17px">🏺 ${currentLang === 'ar' ? 'حماية الحرف التراثية ودعم صناعها' : 'Fair Trade & Crafts Preservation'}</h3>
          <p style="font-size:13px;line-height:1.8;color:var(--muted);margin:0">${currentLang === 'ar' ? 'إعادة إحياء الحرف التقليدية المهددة بالاندثار، وتكريم شيوخ الصنعة وأهل المهارات المتوارثة، وتمكينهم من بيع إنتاجهم مباشرة بالعمولة للجمهور المحلي والدولي بأسعار عادلة.' : 'Preserving endangered crafts by connecting master artisans directly to consumers through fair pricing and custom commissions.'}</p>
        </div>
      </div>

      <h2>${currentLang === 'ar' ? 'رسالتنا الخالدة' : 'Our Shared Vision'}</h2>
      <p>${currentLang === 'ar' ? 'مصر ليست مجرد جغرافيا، بل هي ملايين الحكايات المتوارثة عبر آلاف السنين. نسعى لأن تكون هذه المنصة حلقة الوصل الحية بين تراث كل محافظة وبين كل باحث عن الأصالة، لتبقى حكايات مصر تروى دائماً بأصوات أصحابها.' : 'Egypt is not merely geography; it is millions of living stories passed down over millennia.'}</p>

      <a href="#home" class="primary" style="margin-top:20px">${currentLang === 'ar' ? 'ابدأ رحلتك واستكشف مصر ←' : 'Begin Your Journey ←'}</a>
    </div>
  `;
}

// -----------------------------------------------------------------------------
// 10. MAIN ROUTER
// -----------------------------------------------------------------------------
async function route() {
  let hash = location.hash.slice(1) || 'home';

  // Chat Trigger
  if (hash === 'chat') {
    if (window.openEhkyChatbot) window.openEhkyChatbot();
    return;
  }

  if (hash === 'heritage') {
    locality = 'all';
    searchTerm = '';
  }

  if (hash.startsWith('province/')) {
    locality = hash.split('/')[1];
    category = 'all';
    era = 'all';
    searchTerm = '';
  }

  // Update Horus speech bubble
  let routeGroup = 'home';
  if (hash === 'map') routeGroup = 'map';
  else if (hash === 'heritage' || hash.startsWith('province/')) routeGroup = 'heritage';
  else if (hash === 'foods') routeGroup = 'foods';
  else if (hash.startsWith('food/')) routeGroup = 'food';
  else if (hash === 'artisans') routeGroup = 'artisans';
  else if (hash.startsWith('craft/')) routeGroup = 'craft';
  updateHorusGuidance(routeGroup);

  // Render Target Page
  if (hash === 'home') {
    app.innerHTML = home();
  } else if (hash === 'map') {
    app.innerHTML = mapPage();
    updateProvince();
    const searchInput = document.getElementById('provinceSearch');
    if (searchInput) {
      searchInput.addEventListener('input', e => updateProvinceList(e.target.value));
    }
  } else if (hash === 'heritage' || hash.startsWith('province/')) {
    app.innerHTML = heritagePage(hash.startsWith('province/') ? hash.split('/')[1] : null);
    await renderResults();

    const hSearch = document.getElementById('heritageSearch');
    const hLoc = document.getElementById('locality');
    const hEra = document.getElementById('era');

    if (hSearch) hSearch.addEventListener('input', e => { searchTerm = e.target.value; renderResults(); });
    if (hLoc) hLoc.addEventListener('change', e => { locality = e.target.value; renderResults(); });
    if (hEra) hEra.addEventListener('change', e => { era = e.target.value; renderResults(); });
  } else if (hash.startsWith('craft/')) {
    const craftId = hash.split('/')[1] || 'boats';
    app.innerHTML = await craftPage(craftId);

    // Bind ask Horus button
    const askBtn = document.getElementById('askHorusBtn');
    if (askBtn) {
      askBtn.onclick = () => {
        if (window.openEhkyChatbot) window.openEhkyChatbot(`أخبرني المزيد عن أسرار وحكاية حرفة ${craftId}`);
      };
    }

    // Bind Video Switchers
    const btnHybrid = document.getElementById('btnSourceHybrid');
    const btnYt = document.getElementById('btnSourceYt');
    const wrapper = document.getElementById('videoEmbedWrapper');

    if (btnHybrid && btnYt && wrapper) {
      const craft = await window.HeritageService.getCraftDetails(craftId);
      btnHybrid.onclick = () => {
        activeVideoSource = 'hybrid';
        btnHybrid.classList.add('active');
        btnYt.classList.remove('active');
        wrapper.innerHTML = renderVideoElement(craft, 'hybrid');
      };
      btnYt.onclick = () => {
        activeVideoSource = 'youtube';
        btnYt.classList.add('active');
        btnHybrid.classList.remove('active');
        wrapper.innerHTML = renderVideoElement(craft, 'youtube');
      };
    }
  } else if (hash === 'foods') {
    searchTerm = '';
    app.innerHTML = await foodsPage();
    const fSearch = document.getElementById('foodSearchInput');
    if (fSearch) {
      fSearch.addEventListener('input', async (e) => {
        searchTerm = e.target.value;
        app.innerHTML = await foodsPage();
      });
    }
  } else if (hash.startsWith('food/')) {
    const foodId = hash.split('/')[1];
    app.innerHTML = await foodDetailPage(foodId);
    const askBtn = document.getElementById('askHorusBtn');
    if (askBtn) {
      askBtn.onclick = () => {
        if (window.openEhkyChatbot) window.openEhkyChatbot(`ما هي قصة وأسرار طهي هذه الأكلة المصرية؟`);
      };
    }
  } else if (hash === 'artisans') {
    app.innerHTML = await artisansPage();
  } else if (hash === 'about') {
    app.innerHTML = about();
  } else {
    app.innerHTML = home();
  }

  // Active navigation links
  document.querySelectorAll('nav a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `#${hash.split('/')[0]}`);
  });

  window.scrollTo({ top: 0, behavior: 'instant' });
}

// -----------------------------------------------------------------------------
// GLOBAL EVENT DELEGATION
// -----------------------------------------------------------------------------
app.addEventListener('click', e => {
  // Map spot click
  const p = e.target.closest('[data-prov]');
  if (p) {
    selectedProvince = p.dataset.prov;
    if (p.hasAttribute('data-map-prov')) {
      location.hash = 'province/' + selectedProvince;
    } else {
      updateProvince();
    }
    return;
  }

  // Map Zoom controls
  const zoom = e.target.closest('[data-map-zoom]');
  if (zoom) {
    mapZoom = zoom.dataset.mapZoom === 'reset' ? 1 : Math.max(1, Math.min(2.5, mapZoom + (zoom.dataset.mapZoom === 'in' ? 0.5 : -0.5)));
    const world = document.getElementById('mapWorld');
    if (world) {
      if (mapZoom === 1) world.style.removeProperty('width');
      else world.style.width = (mapZoom * 100) + '%';
    }
    return;
  }

  // Navigation Route button
  const r = e.target.closest('[data-route]');
  if (r) {
    location.hash = r.dataset.route;
    return;
  }

  // Category chip on home
  const c = e.target.closest('[data-cat]');
  if (c) {
    category = c.dataset.cat;
    era = 'all';
    location.hash = 'heritage';
    return;
  }

  // Filter chips in heritage
  const f = e.target.closest('[data-filter]');
  if (f) {
    category = f.dataset.filter;
    renderResults();
    return;
  }

  // Timeline era buttons
  const ep = e.target.closest('[data-era]');
  if (ep) {
    era = ep.dataset.era;
    category = 'all';
    location.hash = 'heritage';
    return;
  }

  // Reset filters
  if (e.target.closest('#resetFilters')) {
    category = 'all';
    locality = 'all';
    era = 'all';
    searchTerm = '';
    const sInput = document.getElementById('heritageSearch');
    if (sInput) sInput.value = '';
    renderResults();
    return;
  }

  // Open Artisan Live Chat Modal
  const chatBtn = e.target.closest('.btn-open-chat');
  if (chatBtn) {
    const artisanId = chatBtn.dataset.artisanId;
    openArtisanChatModal(artisanId);
    return;
  }

  // Open Custom Commission Order / Checkout Modal
  const orderBtn = e.target.closest('.btn-order-commission');
  if (orderBtn) {
    const artisanId = orderBtn.dataset.artisanId;
    window.HeritageService.getArtisanById(artisanId).then(artisan => {
      if (artisan) openCheckoutModal(artisan);
    });
    return;
  }
});

// Map Hover Preview
app.addEventListener('pointerover', e => {
  const spot = e.target.closest('[data-map-prov]');
  if (spot && spot.dataset.prov !== selectedProvince) {
    selectedProvince = spot.dataset.prov;
    updateProvince();
  }
});

// -----------------------------------------------------------------------------
// USER ROLE TOGGLE (TOURIST / ARTISAN)
// -----------------------------------------------------------------------------
function setupUserRole() {
  const roleBtn = document.getElementById('roleToggleBtn');
  const roleLabel = document.getElementById('roleLabel');
  const roleIcon = document.getElementById('roleIcon');
  if (!roleBtn || !roleLabel || !roleIcon) return;

  function renderRole() {
    if (userRole === 'artisan') {
      roleLabel.textContent = currentLang === 'ar' ? 'حرفي / بائع' : 'Artisan / Seller';
      roleIcon.textContent = '⚒️';
      roleBtn.classList.add('role-artisan');
    } else {
      roleLabel.textContent = currentLang === 'ar' ? 'سائح / زائر' : 'Tourist / Buyer';
      roleIcon.textContent = '👤';
      roleBtn.classList.remove('role-artisan');
    }
  }
  renderRole();

  roleBtn.onclick = () => {
    userRole = userRole === 'tourist' ? 'artisan' : 'tourist';
    try {
      localStorage.setItem('ehky-role', userRole);
    } catch (e) {}
    renderRole();
  };
}

// -----------------------------------------------------------------------------
// LANGUAGE SELECTOR SETUP
// -----------------------------------------------------------------------------
function setupLanguageSwitcher() {
  const langSelect = document.getElementById('langSelect');
  if (!langSelect) return;

  langSelect.value = currentLang;

  langSelect.addEventListener('change', (e) => {
    const chosen = e.target.value;
    if (window.I18N && typeof window.I18N.setLanguage === 'function') {
      window.I18N.setLanguage(chosen);
    }
  });

  window.addEventListener('ehkyLanguageChanged', (e) => {
    currentLang = e.detail.lang;
    if (langSelect) langSelect.value = currentLang;
    setupUserRole();
    route();
  });
}

// -----------------------------------------------------------------------------
// DAY / NIGHT THEME SWITCHER
// -----------------------------------------------------------------------------
function setupThemeSwitcher() {
  const theme = document.getElementById('theme');
  if (!theme) return;

  try {
    document.body.classList.toggle('night', localStorage.getItem('ehky-theme') === 'night');
  } catch {}

  function updateThemeLabel() {
    theme.setAttribute('aria-label', document.body.classList.contains('night') ? t('dayMode') : t('nightMode'));
  }
  updateThemeLabel();

  theme.onclick = () => {
    document.body.classList.toggle('night');
    updateThemeLabel();
    try {
      localStorage.setItem('ehky-theme', document.body.classList.contains('night') ? 'night' : 'day');
    } catch {}
  };
}

// -----------------------------------------------------------------------------
// APPLICATION INITIALIZATION
// -----------------------------------------------------------------------------
async function initApp() {
  provincesData = await window.HeritageService.getProvinces();
  categoriesData = await window.HeritageService.getCategories();
  
  setupLanguageSwitcher();
  setupUserRole();
  setupThemeSwitcher();

  window.addEventListener('hashchange', route);
  route();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
