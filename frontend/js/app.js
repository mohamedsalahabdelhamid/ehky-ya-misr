'use strict';

/**
 * ==============================================================================
 * EHKY YA MISR - MAIN APPLICATION LOGIC
 * ==============================================================================
 * Consumes `window.HeritageService` for cultural data.
 * Interacts with `window.EhkyChatbot` for the pharaonic assistant.
 * Fully decoupled and works offline without requiring an active backend!
 * ==============================================================================
 */

const app = document.getElementById('app');

// State
let selected = 'alex';
let category = 'all';
let locality = 'all';
let searchTerm = '';
let era = 'all';
let flat = false;
let mapZoom = 1;
let provincesData = [];
let categoriesData = [];

// Vector Graphics
const boat = `<svg class="boat" viewBox="0 0 260 160" aria-hidden="true"><path d="M20 111Q130 151 244 98L211 140Q122 169 48 139Z" fill="#77522f" stroke="#eed4a0" stroke-width="3"/><path d="M45 121Q133 144 224 115M59 132Q135 150 211 128" stroke="#d5ae71" fill="none" stroke-width="2"/><path d="M128 18V118M128 21L202 98H134Z" stroke="#fff1d2" fill="#eddfbd" stroke-width="3"/><path d="M120 35L66 101H120Z" fill="#fff5d8" opacity=".8"/><path d="M10 154Q40 147 68 154T123 154T181 154T246 154" fill="none" stroke="#336f79" stroke-width="4"/></svg>`;
const crumb = t => `<div class="crumb"><a href="#home">الرئيسية</a> / ${t}</div>`;
const normalize = s => (s || '').replace(/[إأآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').trim();

// Routes definition
const routes = () => `
  <div class="routes">
    ${[
      ['map', 'استكشف المحافظات', 'اختار مكاناً على الخريطة، وابدأ رحلتك في تراثه.', 'استكشف الخريطة'],
      ['heritage', 'تصفح التراث', 'حرف وأكلات وفنون وحكايات… اكتشف ما يثير فضولك.', 'استعرض التصنيفات'],
      ['chat', 'اسأل حكيم مصر', 'سؤالك بداية حكاية. اسأل مرشد التراث الذكي.', 'ابدأ المحادثة']
    ].map((r, i) => `
      <button class="route" data-route="${r[0]}">
        <div>
          <h2>${r[1]}</h2>
          <p>${r[2]}</p>
        </div>
        <span class="num">0${i + 1}</span>
        <span class="go">${r[3]} <span class="circle">←</span></span>
      </button>
    `).join('')}
  </div>
`;

// 1. Home Page View
function home() {
  const cats = categoriesData.length ? categoriesData.slice(1, 5) : [
    { id: 'craft', title: 'الحرف' },
    { id: 'food', title: 'الأكلات الشعبية' },
    { id: 'music', title: 'الفنون الشعبية' },
    { id: 'story', title: 'الأمثال والحكايات' }
  ];

  return `
    <section class="hero cinema">
      <video class="scene-video" autoplay muted loop playsinline preload="metadata" poster="assets/giza-daylight.png" aria-hidden="true">
        <source src="assets/giza-daylight.mp4" type="video/mp4">
      </video>
      <div class="scene-shade" aria-hidden="true"></div>
      <div class="hero-copy">
        <span class="eyebrow">مشروع احكي يا مصر · ذاكرة مكان وحكاية إنسان</span>
        <h1>اكتشف مصر..<em>في كل مكان حكاية</em></h1>
        <p>من النيل إلى البحر، ومن الواحات إلى المدن.<br>تعرّف على مصر من خلال ناسها وحرفها وأكلاتها وفنونها، واكتشف حكاياتها المتوارثة.</p>
        <span class="quiet">ثلاث طرق للاكتشاف. ذاكرة واحدة تجمعنا.</span>
      </div>
      <div class="hero-routes">${routes()}</div>
      <span class="scene-caption">تصور فني بحركة كاميرا · الجيزة، مصر</span>
    </section>

    <div class="container">
      <div class="timeline" aria-label="استكشاف الفترات الزمنية">
        ${[
          ['ancient', 'مصر القديمة'],
          ['coptic', 'القبطي'],
          ['islamic', 'الإسلامي'],
          ['modern', 'الحديث']
        ].map(x => `<button data-era="${x[0]}">${x[1]}</button>`).join('')}
      </div>

      <div class="section-head" id="heritageCategories" tabindex="-1">
        <h2>تراث مصر.. بكل ألوانه</h2>
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

      <section class="intro-strip">
        <h2>الحكاية تبدأ بالناس.<br>وتكمل بالتوثيق.</h2>
        <div>
          <p>«احكي يا مصر» منصة وطنية تربط التراث بالمكان والإنسان، وتساعد الزوار وأهل مصر على استكشاف أصالة كل محافظة من أصحابها الحقيقيين.</p>
          <a href="#about" class="pill">اعرف حكاية المشروع ←</a>
          <p class="small-notice">المشهد الافتتاحي تصور فني بحركة كاميرا. استكشف المحافظات من خلال المجسم في صفحة الخريطة.</p>
        </div>
      </section>
    </div>
  `;
}

// 2. Interactive Map Page View
function mapArtwork() {
  return `
    <div class="map-viewport" id="mapViewport">
      <div class="map-world" id="mapWorld">
        <img class="floating-country" src="assets/egypt-floating-south-v2.webp" alt="مجسم فني لمصر وحرفها التقليدية" draggable="false">
        ${provincesData.map(p => {
          const pos = p.mapPos || [50, 50];
          return `
            <button class="map-spot ${selected === p.id ? 'is-selected' : ''}" 
                    style="--pin-x:${pos[0]}%;--pin-y:${pos[1]}%" 
                    data-prov="${p.id}" 
                    data-map-prov="${p.id}" 
                    aria-label="استكشف تراث ${p.name}">
              <span class="pin-core" aria-hidden="true"></span>
              <span class="spot-label" aria-hidden="true">${p.name} <i>←</i></span>
            </button>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function mapPage() {
  mapZoom = 1;
  return `
    <div class="page province-explorer">
      ${crumb('استكشف المحافظات')}
      <span class="eyebrow">رحلة تبدأ من المكان</span>
      <h1>كل مكان.. له حكاية</h1>
      <p class="sub">حرّك المؤشر فوق النقاط ليظهر اسم المحافظة، واضغط عليها لاكتشاف تراثها.</p>
      
      <div class="map-layout">
        <aside class="map-panel">
          <input class="search" id="provinceSearch" placeholder="ابحث عن محافظة…" aria-label="ابحث عن محافظة">
          <div id="provinceInfo"></div>
          <div class="prov-list" id="provinceList"></div>
        </aside>

        <div class="map-stage illustrated-map">
          <div class="art-map-toolbar">
            <span><b class="dot"></b> استكشف مصر</span>
            <div>
              <button data-map-zoom="in" aria-label="تكبير الخريطة">+</button>
              <button data-map-zoom="out" aria-label="تصغير الخريطة">−</button>
              <button data-map-zoom="reset" aria-label="إعادة حجم الخريطة">↺</button>
            </div>
          </div>
          ${mapArtwork()}
          <div class="map-foot">
            المواضع إرشادية على مجسم فني، وليست حدوداً إدارية دقيقة.<br>
            للمحافظات المتقاربة: كبّر المجسم أو اختر الاسم من القائمة.
          </div>
        </div>
      </div>
    </div>
  `;
}

function updateProvinceList(q = '') {
  const list = document.getElementById('provinceList');
  if (!list) return;
  const filtered = provincesData.filter(p => normalize(p.name).includes(normalize(q)));
  list.innerHTML = filtered.map(p => `
    <button data-prov="${p.id}" class="${selected === p.id ? 'active' : ''}">${p.name}</button>
  `).join('') || '<p class="small-notice">لا توجد محافظة بهذا الاسم.</p>';
}

function updateProvince() {
  const p = provincesData.find(p => p.id === selected) || { id: selected, name: 'الإسكندرية' };
  const info = document.getElementById('provinceInfo');
  if (info) {
    window.HeritageService.getHeritageItems({ province: p.id }).then(items => {
      const hasItems = items && items.length > 0;
      info.innerHTML = `
        <h2>${p.name}</h2>
        <p>${hasItems ? `تم توثيق ${items.length} حكاية وحرفة تراثية في ${p.name}: ${items.map(x => x.title).join('، ')}.` : `يمكنك استكشاف تراث ${p.name}. جاري استكمال باقي التوثيقات الميدانية.`}</p>
        <div class="chips">
          <span class="pill">الحرف</span>
          <span class="pill">الأكلات</span>
          <span class="pill">الحكايات</span>
        </div>
        <a class="primary" href="#province/${p.id}">استكشف تراث ${p.name} (${hasItems ? items.length : 'تصفح'}) ←</a>
        <p class="small-notice">المحافظة إطار للتصفح؛ قد تنتشر الحرفة الواحدة في أكثر من محافظة.</p>
      `;
    });
  }
  document.querySelectorAll('.map-spot').forEach(el => el.classList.toggle('is-selected', el.dataset.prov === selected));
  const searchInput = document.getElementById('provinceSearch');
  if (searchInput) updateProvinceList(searchInput.value);
}

// 3. Heritage Catalog Page View
function heritagePage(prov) {
  if (prov) locality = prov;
  const pObj = prov ? provincesData.find(p => p.id === prov) : null;
  const pname = pObj ? pObj.name : null;

  return `
    <div class="page">
      ${crumb(pname ? `<a href="#map">المحافظات</a> / ${pname}` : 'تصفح التراث')}
      <span class="eyebrow">من ذاكرة المصريين</span>
      <h1>${pname ? 'حكايات وتراث ' + pname : 'تراث مصر.. بكل ألوانه'}</h1>
      <p class="sub">${pname ? 'ابدأ من الحرف، ثم اكتشف بقية التصنيفات عند اكتمال بياناتها.' : 'اختَر نوع التراث، أو ابحث عن عنصر بعينه.'}</p>
      
      <div class="filterbar">
        <input id="heritageSearch" class="search" aria-label="البحث في التراث" placeholder="ابحث عن حرفة، أكلة، حكاية…" value="${searchTerm}">
        <select id="locality" aria-label="تصفية بالمحافظة">
          <option value="all">كل المحافظات</option>
          ${provincesData.map(p => `<option value="${p.id}" ${locality === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
        </select>
        <select id="era" aria-label="تصفية بالفترة">
          <option value="all" ${era === 'all' ? 'selected' : ''}>كل الفترات</option>
          <option value="ancient" ${era === 'ancient' ? 'selected' : ''}>مصر القديمة</option>
          <option value="coptic" ${era === 'coptic' ? 'selected' : ''}>القبطي</option>
          <option value="islamic" ${era === 'islamic' ? 'selected' : ''}>الإسلامي</option>
          <option value="modern" ${era === 'modern' ? 'selected' : ''}>الحديث</option>
        </select>
      </div>

      <div class="chips">
        ${categoriesData.map(c => `
          <button data-filter="${c.id}" class="${category === c.id ? 'active' : ''}">${c.title}</button>
        `).join('')}
      </div>

      <div id="results" class="cards"></div>
      <p class="small-notice">المشروع مهيأ لربط قاعدة البيانات. يتضمن حالياً سجل صناعة المراكب بالإسكندرية كمثال قياسي.</p>
    </div>
  `;
}

async function renderResults() {
  const container = document.getElementById('results');
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
          ${item.youtubeId ? `<span style="position:absolute;inset:0;background:rgba(15,33,71,0.45);display:flex;align-items:center;justify-content:center"><svg width="44" height="44" viewBox="0 0 24 24" fill="#d4af37"><path d="M8 5v14l11-7z"/></svg></span>` : boat}
        </div>
        <div class="card-copy">
          <small>${item.category === 'craft' ? 'الحرف التقليدية' : item.category === 'music' ? 'الفنون والموسيقى' : 'العادات والتقاليد'} • ${item.provinceName}</small>
          <h2>${item.title}</h2>
          <p>${item.summary}</p>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <span class="badge">${item.status}</span>
            ${item.youtubeId ? `<span class="badge" style="background:#b3261e;color:#fff;border-color:#b3261e">فيديو توثيقي ▶</span>` : ''}
          </div>
          <p style="margin-top:10px">اكتشف الحكاية ←</p>
        </div>
      </a>
    `).join('');
  } else {
    container.innerHTML = `
      <div class="empty">
        <strong>الحكايات لسه بتتجمع</strong>
        <p>${era !== 'all' ? 'لم يُحدد أصل زمني للحرفة في بيانات الديمو؛ لا ننسبها لعصر دون مصدر.' : 'لا توجد عناصر مطابقة أضيفت للبحث حالياً.'}</p>
        <button class="primary" id="resetFilters">عرض كل الحكايات المتاحة ←</button>
      </div>
    `;
  }

  document.querySelectorAll('[data-filter]').forEach(b => b.classList.toggle('active', b.dataset.filter === category));
}

// 4. Craft Details Page View
async function craftPage(id = 'boats') {
  const craft = await window.HeritageService.getCraftDetails(id);
  if (!craft) return `<div class="page"><h1>الحرفة غير موجودة</h1><a href="#heritage" class="primary">العودة للتراث ←</a></div>`;

  return `
    <div class="page">
      ${crumb(`<a href="#heritage">التراث</a> / <a href="#province/${craft.provinceId}">${craft.provinceName}</a> / ${craft.title}`)}
      
      <div class="detail-top">
        <div>
          <span class="eyebrow">${craft.category === 'craft' ? 'الحرف التقليدية' : craft.category === 'music' ? 'الفنون والموسيقى' : 'العادات والتقاليد'} • ${craft.provinceName}</span>
          <h1>${craft.title}</h1>
          <p class="sub">${craft.summary}</p>
          <div style="display:flex;gap:8px;align-items:center;margin:12px 0">
            <span class="badge">سجل موثق</span>
            ${craft.youtubeId ? `<span class="badge" style="background:#b3261e;color:#fff;border-color:#b3261e">فيديو توثيقي مدمج ▶</span>` : ''}
          </div>
          <p class="small-notice">توثيق ميداني معتمد لتراث وحرف محافظة ${craft.provinceName}.</p>
        </div>
        <div class="card-art" style="${craft.youtubeId ? `background:url('https://img.youtube.com/vi/${craft.youtubeId}/hqdefault.jpg') center/cover;position:relative;` : ''}">
          ${craft.youtubeId ? `<span style="position:absolute;inset:0;background:rgba(15,33,71,0.4);display:flex;align-items:center;justify-content:center"><svg width="56" height="56" viewBox="0 0 24 24" fill="#d4af37"><path d="M8 5v14l11-7z"/></svg></span><span class="small-notice" style="position:absolute;bottom:10px;color:#fff">توثيق مرئي</span>` : `${boat}<span class="small-notice" style="position:absolute;bottom:10px;color:#fff">رسم توضيحي</span>`}
        </div>
      </div>

      <div class="detail-grid">
        <article class="article">
          ${craft.youtubeId ? `
            <section class="video-section">
              <h2>شاهد التوثيق المرئي من قلب الورشة</h2>
              <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:14px;box-shadow:0 8px 30px rgba(0,0,0,0.18);border:2px solid var(--gold);background:#000;margin:15px 0">
                <iframe src="https://www.youtube-nocookie.com/embed/${craft.youtubeId}?rel=0" 
                        title="${craft.title}" 
                        loading="lazy"
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        allowfullscreen 
                        style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;">
                </iframe>
              </div>
            </section>
          ` : ''}

          <section>
            <h2>عن الحرفة وأصلها</h2>
            <p>${craft.description}</p>
          </section>

          <section>
            <h2>الخامات المستخدمة</h2>
            <p>${craft.materials}</p>
          </section>

          ${craft.tools ? `
            <section>
              <h2>أدوات الصانع</h2>
              <p>${craft.tools}</p>
            </section>
          ` : ''}

          <section>
            <h2>رحلة وخطوات الصنعة</h2>
            <ol>
              ${craft.steps.map(s => `<li>${s}</li>`).join('')}
            </ol>
            <p class="small-notice">تبسيط لخطوات الحرفة لأغراض العرض والتوثيق الميداني.</p>
          </section>
        </article>

        <aside class="facts">
          <h3>بطاقة التوثيق</h3>
          <dl>
            <dt>المحافظة</dt>
            <dd>${craft.provinceName}</dd>
            <dt>المناطق</dt>
            <dd>${craft.regions}</dd>
            <dt>حالة السجل</dt>
            <dd><span style="color:var(--teal);font-weight:bold">سجل موثق ✓</span></dd>
            ${craft.youtubeId ? `
              <dt>التوثيق المرئي</dt>
              <dd>فيديو يوتيوب مدمج</dd>
            ` : ''}
          </dl>
          <button class="primary" id="askPharaohBtn" style="margin-top:25px">اسأل حكيم مصر عن الحرفة ✧</button>
        </aside>
      </div>
    </div>
  `;
}

// 5. About Page View
function about() {
  return `
    <div class="page about">
      ${crumb('عن المشروع')}
      <span class="eyebrow">حكاية من المصريين… ذاكرة للأجيال</span>
      <h1>مشروع «احكي يا مصر»</h1>
      <p>«احكي يا مصر» هي منصة تفاعلية وطنية لتوثيق وحفظ الهوية المصرية والتراث الحي في كل ركن من أركان المحروسة. نبدأ الحكاية من الإنسان ومن صناع التراث في محافظات مصر الـ 27، لتبقى ذاكرتنا حية وننقلها بفخر للأجيال القادمة.</p>

      <h2>أهداف المشروع.. لمن وُجد «احكي يا مصر»؟</h2>
      <div class="about-goals-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;margin:25px 0">
        <div style="background:var(--paper);border:1px solid var(--line);border-radius:14px;padding:22px;border-top:4px solid var(--gold)">
          <h3 style="margin:0 0 10px;color:var(--ink);font-size:17px">🌍 مرشد حقيقي للسياح وزوار مصر</h3>
          <p style="font-size:13px;line-height:1.8;color:var(--muted);margin:0">مساعدة السياح القادمين إلى مصر لفهم عمق الثقافة المصرية الأصيلة لما وراء المعالم السياحية التقليدية، وإرشادهم للوصول إلى الأماكن والورش والأسواق التراثية الحقيقية وتذوق الأكلات الشعبية بأصولها.</p>
        </div>

        <div style="background:var(--paper);border:1px solid var(--line);border-radius:14px;padding:22px;border-top:4px solid var(--teal)">
          <h3 style="margin:0 0 10px;color:var(--ink);font-size:17px">🇪🇬 دليل للمصريين بين المحافظات</h3>
          <p style="font-size:13px;line-height:1.8;color:var(--muted);margin:0">تمكين المصريين والمسافرين بين مختلف المدن والقرى من استكشاف التنوع الثقافي الفريد لبلدهم، ومعرفة ما يميز كل محافظة من حرف وفنون وأمثال وعادات شعبية متوارثة عبر العصور.</p>
        </div>

        <div style="background:var(--paper);border:1px solid var(--line);border-radius:14px;padding:22px;border-top:4px solid var(--gold)">
          <h3 style="margin:0 0 10px;color:var(--ink);font-size:17px">🏺 حماية الحرف التراثية ودعم صناعها</h3>
          <p style="font-size:13px;line-height:1.8;color:var(--muted);margin:0">إعادة إحياء الحرف التقليدية المهددة بالاندثار، وتكريم شيوخ الصنعة وأهل المهارات المتوارثة، وتوثيق أسرار مهنتهم من مصادرها الأصلية لربط ماضي مصر العريق بمستقبلها.</p>
        </div>
      </div>

      <h2>رسالتنا</h2>
      <p>مصر ليست مجرد جغرافيا، بل هي ملايين الحكايات المتوارثة عبر آلاف السنين. نسعى لأن تكون هذه المنصة حلقة الوصل الحية بين تراث كل محافظة وبين كل باحث عن الأصالة، لتبقى حكايات مصر تروى دائماً بأصوات أصحابها.</p>

      <a href="#home" class="primary" style="margin-top:20px">ابدأ رحلتك واستكشف مصر ←</a>
    </div>
  `;
}

// Main Router
async function route() {
  let hash = location.hash.slice(1) || 'home';

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
    const askBtn = document.getElementById('askPharaohBtn');
    if (askBtn) {
      askBtn.onclick = () => {
        if (window.openEhkyChatbot) window.openEhkyChatbot('ما هي صناعة المراكب؟');
      };
    }
  } else if (hash === 'about') {
    app.innerHTML = about();
  } else {
    app.innerHTML = home();
  }

  document.querySelectorAll('nav a').forEach(a => a.classList.toggle('active', a.hash === `#${hash}`));
  window.scrollTo({ top: 0, behavior: 'instant' });
}

// Global Click Handlers
app.addEventListener('click', e => {
  // Map spot click
  const p = e.target.closest('[data-prov]');
  if (p) {
    selected = p.dataset.prov;
    if (p.hasAttribute('data-map-prov')) {
      location.hash = 'province/' + selected;
    } else {
      updateProvince();
    }
    return;
  }

  // Zoom controls
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

  // Navigation Route
  const r = e.target.closest('[data-route]');
  if (r) {
    if (r.dataset.route === 'chat') {
      if (window.openEhkyChatbot) window.openEhkyChatbot();
    } else if (r.dataset.route === 'heritage' && document.getElementById('heritageCategories')) {
      const target = document.getElementById('heritageCategories');
      target.focus({ preventScroll: true });
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      location.hash = r.dataset.route;
    }
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

  // Filter chip
  const f = e.target.closest('[data-filter]');
  if (f) {
    category = f.dataset.filter;
    renderResults();
    return;
  }

  // Timeline button
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
  }
});

// Map Hover Preview
app.addEventListener('pointerover', e => {
  const spot = e.target.closest('[data-map-prov]');
  if (spot && spot.dataset.prov !== selected) {
    selected = spot.dataset.prov;
    updateProvince();
  }
});

// Theme Switcher (Day / Night)
const theme = document.getElementById('theme');
if (theme) {
  try {
    document.body.classList.toggle('night', localStorage.getItem('ehky-theme') === 'night');
  } catch {}

  function themeLabel() {
    theme.setAttribute('aria-label', document.body.classList.contains('night') ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي');
  }
  themeLabel();

  theme.onclick = () => {
    document.body.classList.toggle('night');
    themeLabel();
    try {
      localStorage.setItem('ehky-theme', document.body.classList.contains('night') ? 'night' : 'day');
    } catch {}
  };
}

// Initial bootstrap
async function initApp() {
  provincesData = await window.HeritageService.getProvinces();
  categoriesData = await window.HeritageService.getCategories();
  window.addEventListener('hashchange', route);
  route();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

