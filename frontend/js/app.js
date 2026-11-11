'use strict';

/**
 * ==============================================================================
 * EHKY YA MISR - MAIN APPLICATION CONTROLLER v4.0
 * ==============================================================================
 * Multilingual (ar, en, fr, it, de) · Hybrid Video · Foods + Google Maps
 * Fair Trade Artisans Marketplace · Buyer Protection · Auth System
 * Interactive Horus Companion · Responsive Design
 * ==============================================================================
 */

const app = document.getElementById('app');

// Application State
let currentLang = 'ar';
let userRole = 'tourist';
let isLoggedIn = false;
let currentUser = null;
let selectedProvince = 'alex';

let currentCurrency = localStorage.getItem('ehky-currency') || 'dual';
let activeExhibitionTab = 'products'; // 'products' or 'artisans'
let activeProductCategory = 'all';
let productSearchTerm = '';
let activeProductSort = 'recommended';

function setCurrency(cur) {
  currentCurrency = cur;
  try { localStorage.setItem('ehky-currency', cur); } catch {}
  document.querySelectorAll('.currency-pill').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.currency === cur);
  });
  const hash = (location.hash || '').slice(1);
  if (hash === 'artisans' || hash.startsWith('artisans') || hash.startsWith('artisan/')) {
    route();
  }
}

function formatDualPrice(egpPrice) {
  const egp = Number(egpPrice) || 0;
  const usd = Math.round(egp / 50);
  const isAr = (!window.I18N || window.I18N.current === 'ar');
  if (currentCurrency === 'usd') {
    return `<span class="price-val price-usd-val">$${usd} USD</span>`;
  } else if (currentCurrency === 'egp') {
    return `<span class="price-val price-egp-val">${egp} ${isAr ? 'ج.م' : 'EGP'}</span>`;
  } else {
    // Dual mode
    if (isAr) {
      return `<span class="price-val price-egp-val">${egp} ج.م</span> <span class="price-sub price-usd-sub">($${usd} USD)</span>`;
    } else {
      return `<span class="price-val price-usd-val">$${usd} USD</span> <span class="price-sub price-egp-sub">(${egp} EGP)</span>`;
    }
  }
}
let category = 'all';
let locality = 'all';
let searchTerm = '';
let era = 'all';
let mapZoom = 1;
const isOnlineEnv = typeof window !== 'undefined' && window.location && window.location.protocol && window.location.protocol.startsWith('http') && 
  window.location.hostname !== 'localhost' && 
  window.location.hostname !== '127.0.0.1';
if (typeof window !== 'undefined') window.isOnlineEnv = isOnlineEnv;
let activeVideoSource = isOnlineEnv ? 'youtube' : 'hybrid';
let provincesData = [];
let categoriesData = [];

// Init Stored Preferences
try {
  currentLang = localStorage.getItem('ehky-lang') || 'ar';
  const savedUser = localStorage.getItem('ehky-user');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    isLoggedIn = true;
    userRole = currentUser.role || 'tourist';
  }
} catch (e) {}

// Helpers
const boatSvg = `<svg class="boat" viewBox="0 0 260 160" aria-hidden="true"><path d="M20 111Q130 151 244 98L211 140Q122 169 48 139Z" fill="#77522f" stroke="#eed4a0" stroke-width="3"/><path d="M45 121Q133 144 224 115M59 132Q135 150 211 128" stroke="#d5ae71" fill="none" stroke-width="2"/><path d="M128 18V118M128 21L202 98H134Z" stroke="#fff1d2" fill="#eddfbd" stroke-width="3"/><path d="M120 35L66 101H120Z" fill="#fff5d8" opacity=".8"/><path d="M10 154Q40 147 68 154T123 154T181 154T246 154" fill="none" stroke="#336f79" stroke-width="4"/></svg>`;

const crumb = (htmlText) => `<div class="crumb"><a href="#home">${t('navHome')}</a> / ${htmlText}</div>`;

function t(key) {
  if (window.I18N && typeof window.I18N.t === 'function') return window.I18N.t(key);
  return key;
}

// -----------------------------------------------------------------------------
// HORUS COMPANION
// -----------------------------------------------------------------------------
function updateHorusGuidance(routeKey) {
  const bubble = document.getElementById('horusSpeechText');
  if (!bubble) return;
  const messages = {
    home: { ar:'أهلاً بك في مصر! اختر وجهتك لاكتشاف الكنوز التراثية 𓅃', en:'Welcome to Egypt! Choose your destination to uncover living heritage 𓅃', fr:'Bienvenue en Égypte ! Choisissez une destination 𓅃', it:'Benvenuti in Egitto! Esplorate il patrimonio vivente 𓅃', de:'Willkommen in Ägypten! Entdecken Sie das Kulturerbe 𓅃' },
    map: { ar:'خريطة الـ 27 محافظة.. انقر على أي محافظة لمعرفة تاريخها.', en:'Map of 27 Governorates.. Click any province to explore.', fr:'Carte des 27 gouvernorats.. Cliquez pour découvrir.', it:'Mappa dei 27 governatorati.. Cliccate per scoprire.', de:'Karte der 27 Gouvernements.. Klicken Sie zum Erkunden.' },
    heritage: { ar:'هنا تجتمع براعة الأجداد في الحرف والفنون.', en:'Ancestral mastery in crafts and living traditions.', fr:'Maîtrise ancestrale de l\'artisanat et des traditions.', it:'Maestria artigianale e tradizioni viventi.', de:'Meisterhafte Handwerkskunst der Vorfahren.' },
    foods: { ar:'أكلات مصر التراثية! انقر على زر الخريطة لأشهر المطاعم 🍲', en:'Traditional Egyptian Cuisine! Click Maps for restaurants 🍲', fr:'Saveurs authentiques ! Cliquez sur la carte 🍲', it:'Cucina tradizionale egiziana! 🍲', de:'Traditionelle ägyptische Küche! 🍲' },
    artisans: { ar:'سوق الحرفيين المعتمدين.. حماية تامة من الاستغلال 🛡️', en:'Verified Artisans Market.. Fair trade & buyer protection 🛡️', fr:'Marché des artisans certifiés 🛡️', it:'Mercato artigiani certificati 🛡️', de:'Verifizierter Handwerkermarkt 🛡️' },
    craft: { ar:'شاهد التوثيق المرئي وتواصل مع شيخ الصنعة!', en:'Watch the documentary and chat with the craftsman!', fr:'Regardez le documentaire et échangez avec l\'artisan !', it:'Guardate il documentario e chattate con l\'artigiano!', de:'Sehen Sie die Dokumentation und sprechen Sie mit dem Meister!' },
    food: { ar:'أصل الطبخ المصري وحكايته.. تذوق التاريخ في كل لقمة!', en:'Taste living history in every bite!', fr:'Savourez l\'histoire à chaque bouchée !', it:'Assaporate la tradizione!', de:'Erleben Sie Tradition mit jedem Bissen!' }
  };
  const pool = messages[routeKey] || messages.home;
  bubble.textContent = pool[currentLang] || pool.ar;
}

function horusPointAt(element) {
  const horus = document.querySelector('.horus-3d-character');
  if (!horus || !element) return;
  const horusRect = horus.getBoundingClientRect();
  const elRect = element.getBoundingClientRect();
  horus.classList.remove('horus-pointing-left','horus-pointing-right','horus-pointing-up','horus-excited');
  if (elRect.top < horusRect.top - 100) {
    horus.classList.add('horus-pointing-up');
  } else if (elRect.left < horusRect.left) {
    horus.classList.add('horus-pointing-left');
  } else {
    horus.classList.add('horus-pointing-right');
  }
  clearTimeout(horus._pointTimer);
  horus._pointTimer = setTimeout(() => {
    horus.classList.remove('horus-pointing-left','horus-pointing-right','horus-pointing-up');
  }, 1200);
}

function horusExcited() {
  const horus = document.querySelector('.horus-3d-character');
  if (!horus) return;
  horus.classList.remove('horus-excited');
  void horus.offsetWidth;
  horus.classList.add('horus-excited');
  setTimeout(() => horus.classList.remove('horus-excited'), 700);
}

// -----------------------------------------------------------------------------
// AUTH SYSTEM
// -----------------------------------------------------------------------------
function updateAccountUI() {
  const btn = document.getElementById('accountBtn');
  const icon = document.getElementById('accountIcon');
  const label = document.getElementById('accountLabel');
  if (!btn) return;
  if (isLoggedIn && currentUser) {
    const initial = (currentUser.name || 'U').charAt(0).toUpperCase();
    icon.textContent = initial;
    icon.style.cssText = 'width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#0f2147,#123d42);color:#ffe89a;display:inline-flex;align-items:center;justify-content:center;font-size:13px;font-weight:bold;border:1px solid #d4af37;';
    label.textContent = currentUser.name.split(' ')[0];
    label.removeAttribute('data-i18n');
    btn.classList.add('logged-in');
  } else {
    icon.textContent = '👤';
    icon.style.cssText = '';
    label.textContent = t('register');
    label.setAttribute('data-i18n', 'register');
    btn.classList.remove('logged-in');
  }
}

function openAuthModal(onSuccessCallback = null) {
  let existing = document.getElementById('authModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'authModal';
  modal.className = 'ehky-modal-backdrop';
  modal.innerHTML = `
    <div class="ehky-modal-card" style="width:440px">
      <div class="ehky-modal-header">
        <strong style="font-size:16px;color:#ffe89a">🏛️ ${t('siteTitle')} — ${t('loginTitle')}</strong>
        <button class="ehky-modal-close" id="closeAuth">×</button>
      </div>

      <!-- Demo Mode Notice -->
      <div style="background:rgba(179,38,30,0.10);border:1px solid #b3261e;padding:8px 14px;border-radius:10px;margin:14px 16px 0;text-align:center;font-size:12px;color:#b3261e;font-weight:bold">
        ${t('demoModeNotice')}
      </div>

      <!-- Quick Test Accounts Bar -->
      <div style="background:rgba(212,175,55,0.08);border:1px dashed var(--gold);padding:10px 14px;border-radius:10px;margin:14px 16px 0;text-align:center">
        <small style="display:block;color:var(--muted);margin-bottom:6px;font-weight:bold">⚡ تجربة سريعة بضغطة زر:</small>
        <div style="display:flex;gap:8px;justify-content:center">
          <button type="button" class="pill" id="btnQuickBuyer" style="font-size:11.5px;padding:4px 10px;border-color:var(--teal);color:var(--teal)">
            🛒 عميل / مشتري
          </button>
          <button type="button" class="pill" id="btnQuickMerchant" style="font-size:11.5px;padding:4px 10px;border-color:var(--gold);color:var(--gold)">
            ⚒️ تاجر / شيخ صنعة
          </button>
        </div>
      </div>

      <div class="auth-tabs" style="margin-top:12px">
        <button class="auth-tab active" id="tabLogin">${t('login')}</button>
        <button class="auth-tab" id="tabRegister">${t('register')}</button>
      </div>

      <form id="loginForm" class="payment-pane active">
        <div class="form-row"><label>${t('emailField')}</label><input type="email" id="loginEmail" required placeholder="client@example.com"></div>
        <div class="form-row"><label>${t('passwordField')}</label><input type="password" id="loginPass" required placeholder="••••••••"></div>
        <div class="form-row"><label>${t('roleSelect')}</label>
          <select id="loginRole" style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--line);background:var(--paper);color:var(--ink)">
            <option value="tourist">${t('roleTourist')} (مشتري)</option>
            <option value="artisan">${t('roleArtisan')} (تاجر / حرفي)</option>
          </select>
        </div>
        <button type="submit" class="primary" style="width:100%;padding:12px;margin-top:8px">${t('submitLogin')}</button>
      </form>

      <form id="registerForm" class="payment-pane" style="display:none">
        <div class="form-row"><label>${t('nameField')}</label><input type="text" id="regName" required placeholder="الاسم الكامل"></div>
        <div class="form-row"><label>${t('emailField')}</label><input type="email" id="regEmail" required placeholder="your@email.com"></div>
        <div class="form-row"><label>${t('passwordField')}</label><input type="password" id="regPass" required placeholder="••••••••"></div>
        <div class="form-row"><label>${t('roleSelect')}</label>
          <select id="regRole" style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--line);background:var(--paper);color:var(--ink)">
            <option value="tourist">${t('roleTourist')} (مشتري / زائر)</option>
            <option value="artisan">${t('roleArtisan')} (تاجر / صانع معتمد)</option>
          </select>
        </div>
        <button type="submit" class="primary" style="width:100%;padding:12px;margin-top:8px">${t('submitRegister')}</button>
      </form>
    </div>`;

  document.body.appendChild(modal);

  document.getElementById('closeAuth').onclick = () => modal.remove();
  const tabL = document.getElementById('tabLogin');
  const tabR = document.getElementById('tabRegister');
  const formL = document.getElementById('loginForm');
  const formR = document.getElementById('registerForm');

  tabL.onclick = () => { tabL.classList.add('active'); tabR.classList.remove('active'); formL.style.display='block'; formR.style.display='none'; };
  tabR.onclick = () => { tabR.classList.add('active'); tabL.classList.remove('active'); formR.style.display='block'; formL.style.display='none'; };

  // Quick 1-click test accounts
  document.getElementById('btnQuickBuyer').onclick = () => {
    document.getElementById('loginEmail').value = 'ahmed.client@ehky.eg';
    document.getElementById('loginRole').value = 'tourist';
    formL.requestSubmit();
  };
  document.getElementById('btnQuickMerchant').onclick = () => {
    document.getElementById('loginEmail').value = 'ragab.merchant@ehky.eg';
    document.getElementById('loginRole').value = 'artisan';
    formL.requestSubmit();
  };

  formL.onsubmit = (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const role = document.getElementById('loginRole').value;
    const name = email.split('@')[0].replace('.', ' ');
    currentUser = { name, email, role };
    isLoggedIn = true; userRole = role;
    try { localStorage.setItem('ehky-user', JSON.stringify(currentUser)); } catch(e){}
    updateAccountUI();
    modal.remove();
    horusExcited();
    if (typeof onSuccessCallback === 'function') onSuccessCallback();
    else route();
  };

  formR.onsubmit = (e) => {
    e.preventDefault();
    currentUser = {
      name: document.getElementById('regName').value,
      email: document.getElementById('regEmail').value,
      role: document.getElementById('regRole').value
    };
    isLoggedIn = true; userRole = currentUser.role;
    try { localStorage.setItem('ehky-user', JSON.stringify(currentUser)); } catch(e){}
    updateAccountUI();
    modal.remove();
    horusExcited();
    if (typeof onSuccessCallback === 'function') onSuccessCallback();
    else route();
  };
}

// ACCOUNT & DASHBOARD MODAL (My Orders, Tracking, Merchant Orders)
function openAccountDashboardModal() {
  if (!isLoggedIn || !currentUser) {
    openAuthModal();
    return;
  }
  let existing = document.getElementById('accountDashboardModal');
  if (existing) existing.remove();

  const isMerchant = currentUser.role === 'artisan';
  let allOrders = [];
  try {
    allOrders = JSON.parse(localStorage.getItem('ehky-orders') || '[]');
  } catch(e) {}

  // Filter orders for this user
  const userOrders = isMerchant 
    ? allOrders 
    : allOrders.filter(o => o.buyerEmail === currentUser.email || !o.buyerEmail);

  const modal = document.createElement('div');
  modal.id = 'accountDashboardModal';
  modal.className = 'ehky-modal-backdrop';
  modal.innerHTML = `
    <div class="ehky-modal-card" style="width:620px;max-width:calc(100vw - 32px)">
      <div class="ehky-modal-header">
        <div style="display:flex;align-items:center;gap:12px">
          <div style="width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#0f2147,#123d42);display:flex;align-items:center;justify-content:center;border:2px solid var(--gold);color:#ffe89a;font-size:18px;font-weight:bold">
            ${(currentUser.name||'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <strong style="display:block;font-size:16px;color:#ffe89a">${currentUser.name}</strong>
            <small style="color:var(--muted)">${currentUser.email} • <span style="color:${isMerchant?'var(--gold)':'var(--teal)'};font-weight:bold">${isMerchant ? '⚒️ تاجر / صانع معتمد' : '🛡️ عميل / مشتري'}</span></small>
          </div>
        </div>
        <button class="ehky-modal-close" id="closeAccountDashboard">×</button>
      </div>

      <!-- Dashboard Actions -->
      <div style="padding:16px 20px 0;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
        <h3 style="margin:0;font-size:16px;color:var(--ink)">
          ${isMerchant ? '📥 ' + t('merchantOrdersTab') : '📦 ' + t('myOrdersTab')} (${userOrders.length})
        </h3>
        ${isMerchant ? `
          <button type="button" class="primary" id="btnDashAddProduct" style="padding:7px 14px;font-size:12.5px;border-radius:8px">
            ➕ ${t('btnAddNewProduct')}
          </button>` : ''}
      </div>

      <!-- Orders List Area -->
      <div style="max-height:360px;overflow-y:auto;padding:16px 20px;display:flex;flex-direction:column;gap:12px">
        ${userOrders.length ? userOrders.map(order => `
          <div style="background:var(--paper);border:1px solid var(--line);border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:8px;box-shadow:0 2px 8px rgba(0,0,0,0.03)">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
              <div>
                <strong style="font-size:14px;color:var(--ink)">${order.itemTitle}</strong>
                <small style="color:var(--muted);display:block">كود الطلب: <strong style="color:var(--gold)">#${order.id}</strong> • ${order.date}</small>
              </div>
              <div style="text-align:right">
                <span style="font-weight:bold;color:var(--gold);font-size:15px">${formatDualPrice(order.priceEgp)}</span>
                <span class="badge" style="display:block;margin-top:2px;font-size:11px;background:${order.status==='delivered'?'#e8f5e9':(order.status==='shipped'?'#e3f2fd':'#fff8e1')};color:${order.status==='delivered'?'#2e7d32':(order.status==='shipped'?'#1565c0':'#f57f17')}">
                  ${order.statusLabel || t('orderStatusProcessing')}
                </span>
              </div>
            </div>

            <div style="font-size:12px;color:var(--muted);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;border-top:1px dashed var(--line);padding-top:8px">
              <span>👤 ${isMerchant ? 'العميل: ' + (order.buyerName||'مشتري') + ' (' + (order.buyerPhone||'-') + ')' : 'الورشة: ' + (order.artisanName||'شيخ الصنعة')}</span>
              <div style="display:flex;gap:6px">
                <button type="button" class="pill btn-track-order" data-order-id="${order.id}" style="font-size:11px;padding:3px 10px;border-color:var(--teal)">
                  📦 ${t('trackOrderBtn')}
                </button>
                ${isMerchant ? `
                  <button type="button" class="pill btn-advance-order" data-order-id="${order.id}" style="font-size:11px;padding:3px 8px;border-color:var(--gold);color:var(--gold)">
                    🔄 تحديث الحالة
                  </button>` : ''}
              </div>
            </div>
          </div>
        `).join('') : `
          <div style="text-align:center;padding:30px;color:var(--muted);background:var(--paper);border:1px dashed var(--line);border-radius:12px">
            <span style="font-size:36px;display:block;margin-bottom:8px">📦</span>
            <p style="margin:0;font-size:13.5px">لا توجد طلبات مسجلة بعد. تصفح سوق مصر واطلب قطعتك الأصلية!</p>
          </div>
        `}
      </div>

      <!-- Footer & Logout -->
      <div style="padding:14px 20px;border-top:1px solid var(--line);display:flex;justify-content:space-between;align-items:center">
        <button type="button" class="pill" id="btnLogoutDash" style="border-color:#e53935;color:#e53935;padding:6px 14px">
          🚪 ${t('logout')}
        </button>
        <button type="button" class="primary" id="btnCloseDash" style="padding:6px 20px">
          ${t('backToBrowse')}
        </button>
      </div>
    </div>`;

  document.body.appendChild(modal);

  document.getElementById('closeAccountDashboard').onclick = () => modal.remove();
  document.getElementById('btnCloseDash').onclick = () => modal.remove();

  document.getElementById('btnLogoutDash').onclick = () => {
    isLoggedIn = false; currentUser = null; userRole = 'tourist';
    try { localStorage.removeItem('ehky-user'); } catch(e) {}
    updateAccountUI();
    modal.remove();
    route();
  };

  const btnAdd = document.getElementById('btnDashAddProduct');
  if (btnAdd) {
    btnAdd.onclick = () => {
      modal.remove();
      openAddProductModal();
    };
  }

  modal.querySelectorAll('.btn-track-order').forEach(btn => {
    btn.onclick = () => {
      openOrderTrackingModal(btn.dataset.orderId);
    };
  });

  modal.querySelectorAll('.btn-advance-order').forEach(btn => {
    btn.onclick = () => {
      advanceOrderStatus(btn.dataset.orderId);
      modal.remove();
      openAccountDashboardModal();
    };
  });
}

// ADVANCE ORDER STATUS (Merchant Toggle: processing -> shipped -> delivered)
function advanceOrderStatus(orderId) {
  try {
    let orders = JSON.parse(localStorage.getItem('ehky-orders') || '[]');
    const ord = orders.find(o => o.id === orderId);
    if (!ord) return;
    if (ord.status === 'processing') {
      ord.status = 'shipped';
      ord.statusLabel = t('orderStatusShipped');
    } else if (ord.status === 'shipped') {
      ord.status = 'delivered';
      ord.statusLabel = t('orderStatusDelivered');
    } else {
      ord.status = 'processing';
      ord.statusLabel = t('orderStatusProcessing');
    }
    localStorage.setItem('ehky-orders', JSON.stringify(orders));
    alert(t('statusUpdatedSuccess') + ' (' + ord.statusLabel + ')');
  } catch(e) {}
}

// VIDEO LIGHTBOX MODAL & AUTOMATIC FALLBACK
window.handleVideoFallback = async function(craftId) {
  try {
    const craft = await window.HeritageService.getCraftDetails(craftId);
    const wrap = document.getElementById('videoEmbedWrapper');
    const btnY = document.getElementById('btnSourceYt');
    const btnH = document.getElementById('btnSourceHybrid');
    if (craft && craft.youtubeId && wrap) {
      wrap.innerHTML = renderVideoElement(craft, 'youtube');
      if (btnY) btnY.classList.add('active');
      if (btnH) btnH.classList.remove('active');
      activeVideoSource = 'youtube';
    }
  } catch(e) {}
};

window.openVideoModal = async function(craftId) {
  try {
    const craft = await window.HeritageService.getCraftDetails(craftId);
    if (!craft || !craft.youtubeId) return;

    let existing = document.getElementById('ehkyVideoLightbox');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'ehkyVideoLightbox';
    modal.className = 'modal-backdrop';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(8,18,37,0.85);backdrop-filter:blur(10px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;animation:fadeIn 0.25s ease';

    const langCode = currentLang || 'ar';

    modal.innerHTML = `
      <div class="video-modal-card" style="background:#0f1c30;border:2px solid var(--gold);border-radius:20px;width:100%;max-width:880px;overflow:hidden;box-shadow:0 24px 70px rgba(0,0,0,0.65);animation:scaleUp 0.25s ease">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 22px;background:linear-gradient(135deg,rgba(212,175,55,0.18),transparent);border-bottom:1px solid rgba(212,175,55,0.3)">
          <div style="display:flex;align-items:center;gap:12px">
            <span style="font-size:24px">🎬</span>
            <div>
              <h3 style="margin:0;font-size:17px;color:#fff">${craft.title}</h3>
              <small style="color:var(--gold);font-weight:600">📍 ${craft.provinceName} • ${craft.regions}</small>
            </div>
          </div>
          <button id="btnCloseVideoModal" style="background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.25);color:#fff;width:36px;height:36px;border-radius:50%;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:0.2s">✕</button>
        </div>
        <div style="position:relative;padding-bottom:56.25%;height:0;background:#000">
          <iframe src="https://www.youtube-nocookie.com/embed/${craft.youtubeId}?autoplay=1&rel=0&enablejsapi=1&cc_load_policy=1&cc_lang_pref=${langCode}&hl=${langCode}" 
            title="${craft.title}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowfullscreen 
            style="position:absolute;top:0;left:0;width:100%;height:100%;border:0"></iframe>
        </div>
        <div style="padding:14px 22px;display:flex;justify-content:space-between;align-items:center;background:#0b1424;flex-wrap:wrap;gap:10px">
          <span style="color:#d4af37;font-size:13px;display:flex;align-items:center;gap:6px">
            <span>🛡️</span> ${t('escrowSecured')} • ${t('verifiedBadge')}
          </span>
          <div style="display:flex;gap:10px">
            <a href="#craft/${craft.id}" onclick="document.getElementById('ehkyVideoLightbox').remove()" class="primary" style="padding:8px 18px;font-size:13px">
              🏺 ${t('exploreStory')}
            </a>
            <button id="btnDismissVideoModal" class="pill" style="padding:8px 16px;font-size:13px;background:rgba(255,255,255,0.08);color:#fff">
              ${t('close') || 'إغلاق'}
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.querySelector('#btnCloseVideoModal').onclick = () => modal.remove();
    modal.querySelector('#btnDismissVideoModal').onclick = () => modal.remove();
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

    const onEsc = (e) => {
      if (e.key === 'Escape') {
        modal.remove();
        window.removeEventListener('keydown', onEsc);
      }
    };
    window.addEventListener('keydown', onEsc);
  } catch(e) {
    console.error('Error opening video modal:', e);
  }
};

// ORDER TRACKING MODAL (Interactive 4-step Timeline)
function openOrderTrackingModal(orderId) {
  let existing = document.getElementById('orderTrackingModal');
  if (existing) existing.remove();

  let orders = [];
  try { orders = JSON.parse(localStorage.getItem('ehky-orders') || '[]'); } catch(e){}
  const order = orders.find(o => o.id === orderId) || {
    id: orderId,
    itemTitle: 'منتج تراثي من سوق مصر',
    artisanName: 'شيخ الصنعة المعتمد',
    artisanWorkshop: 'ورشة القاهرة التاريخية',
    priceEgp: 850,
    priceUsd: 17,
    date: new Date().toLocaleDateString(),
    deliveryAddress: 'عنوان التسليم المسجل',
    buyerPhone: '+20 100 123 4567',
    status: 'processing',
    statusLabel: t('orderStatusProcessing')
  };

  const isShipped = order.status === 'shipped' || order.status === 'delivered';
  const isDelivered = order.status === 'delivered';

  const modal = document.createElement('div');
  modal.id = 'orderTrackingModal';
  modal.className = 'ehky-modal-backdrop';
  modal.innerHTML = `
    <div class="ehky-modal-card" style="width:540px;max-width:calc(100vw - 32px)">
      <div class="ehky-modal-header">
        <div>
          <strong style="display:block;font-size:16px;color:#ffe89a">📦 تتبع الشحنة #${order.id}</strong>
          <small style="color:var(--muted)">بضمان منصة احكي يا مصر وحماية المشتري</small>
        </div>
        <button class="ehky-modal-close" id="closeTracking">×</button>
      </div>

      <div style="background:rgba(212,175,55,0.08);border:1px solid var(--gold);padding:14px;border-radius:12px;margin:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
          <div>
            <strong style="font-size:14.5px;color:var(--ink);display:block">${order.itemTitle}</strong>
            <small style="color:var(--muted)">صانع القطعة: ${order.artisanName} • ${order.artisanWorkshop}</small>
          </div>
          <span style="font-size:18px;font-weight:bold;color:var(--gold)">${formatDualPrice(order.priceEgp)}</span>
        </div>
        <div style="margin-top:8px;font-size:12px;color:var(--muted);border-top:1px dashed var(--line);padding-top:6px">
          📍 التوصيل إلى: <strong>${order.deliveryAddress || 'مصر'}</strong> (${order.buyerPhone || ''})
        </div>
      </div>

      <!-- 4-STEP TIMELINE -->
      <div class="order-timeline-wrap" style="padding:10px 24px 20px">
        <div class="timeline-step done" style="display:flex;gap:14px;position:relative;padding-bottom:20px">
          <div style="width:32px;height:32px;border-radius:50%;background:#2e7d32;color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:bold;flex-shrink:0;z-index:2">✓</div>
          <div>
            <strong style="font-size:13.5px;color:var(--ink);display:block">تم تأكيد الدفع والضمان 🔒</strong>
            <small style="color:var(--muted)">المبلغ محفوظ في حساب الضمان حتى الاستلام (${order.date})</small>
          </div>
        </div>

        <div class="timeline-step ${order.status==='processing'?'active':'done'}" style="display:flex;gap:14px;position:relative;padding-bottom:20px">
          <div style="width:32px;height:32px;border-radius:50%;background:${order.status==='processing'?'var(--gold)':'#2e7d32'};color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:bold;flex-shrink:0;z-index:2">
            ${order.status==='processing'?'⏳':'✓'}
          </div>
          <div>
            <strong style="font-size:13.5px;color:var(--ink);display:block">جاري التجهيز والنقش في الورشة ⚒️</strong>
            <small style="color:var(--muted)">يقوم الصانع حالياً بفحص وتجهيز القطعة التراثية للشحن</small>
          </div>
        </div>

        <div class="timeline-step ${order.status==='shipped'?'active':(isDelivered?'done':'pending')}" style="display:flex;gap:14px;position:relative;padding-bottom:20px">
          <div style="width:32px;height:32px;border-radius:50%;background:${order.status==='shipped'?'#1976d2':(isDelivered?'#2e7d32':'var(--line)')};color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:bold;flex-shrink:0;z-index:2">
            ${isDelivered?'✓':(order.status==='shipped'?'🚚':'3')}
          </div>
          <div>
            <strong style="font-size:13.5px;color:var(--ink);display:block">خرجت للشحن مع مندوب التوصيل 🚚</strong>
            <small style="color:var(--muted)">شحنة مؤمنة عبر أسطول النقل المحلي والدولي</small>
          </div>
        </div>

        <div class="timeline-step ${isDelivered?'done':'pending'}" style="display:flex;gap:14px;position:relative">
          <div style="width:32px;height:32px;border-radius:50%;background:${isDelivered?'#2e7d32':'var(--line)'};color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:bold;flex-shrink:0;z-index:2">
            ${isDelivered?'✓':'4'}
          </div>
          <div>
            <strong style="font-size:13.5px;color:var(--ink);display:block">تم التسليم للعميل بنجاح 🎁</strong>
            <small style="color:var(--muted)">تسليم آمن مع معاينة القطعة</small>
          </div>
        </div>
      </div>

      <div style="padding:14px 20px;border-top:1px solid var(--line);text-align:center">
        <button type="button" class="primary" id="btnCloseTracking" style="padding:8px 24px">
          حسناً، فهمت
        </button>
      </div>
    </div>`;

  document.body.appendChild(modal);
  document.getElementById('closeTracking').onclick = () => modal.remove();
  document.getElementById('btnCloseTracking').onclick = () => modal.remove();
}

// MERCHANT PUBLISH NEW PRODUCT MODAL
function openAddProductModal() {
  if (!isLoggedIn || !currentUser || currentUser.role !== 'artisan') {
    alert(t('loginRequiredToSell'));
    openAuthModal();
    return;
  }
  let existing = document.getElementById('addProductModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'addProductModal';
  modal.className = 'ehky-modal-backdrop';
  modal.innerHTML = `
    <div class="ehky-modal-card" style="width:520px;max-width:calc(100vw - 32px)">
      <div class="ehky-modal-header">
        <div>
          <strong style="display:block;font-size:16px;color:#ffe89a">⚒️ ${t('newProductModalTitle')}</strong>
          <small style="color:var(--muted)">سيتم عرض منتجك فوراً لآلاف المشترين والسياح في سوق مصر</small>
        </div>
        <button class="ehky-modal-close" id="closeAddProduct">×</button>
      </div>

      <form id="addProductForm" style="padding:20px;display:flex;flex-direction:column;gap:12px">
        <div class="form-row">
          <label>اسم القطعة / المنتج التراثي *</label>
          <input type="text" id="npTitle" required placeholder="مثال: لوحة نحاس فاطمية منقوشة آية الكرسي 50 سم">
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-row">
            <label>تصنيف الحرفة *</label>
            <select id="npCategory" style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--line);background:var(--paper);color:var(--ink)">
              <option value="copper">🏺 نحاسيات وفاطميات</option>
              <option value="palm">🧺 خوص ومنتجات نخيل</option>
              <option value="arabesque">🪵 أرابيسك وتطعيم صدف</option>
              <option value="pottery">🏺 فخار وطمي قناوي</option>
              <option value="alabaster">🗿 ألبستر ونحت حجري</option>
              <option value="textiles">🧵 نسيج وكليم أخميم</option>
              <option value="lanterns-boats">⛵ فوانيس ومراكب تراثية</option>
            </select>
          </div>
          <div class="form-row">
            <label>السعر بالجنيه المصري (EGP) *</label>
            <input type="number" id="npPrice" required placeholder="850" min="50" step="10">
          </div>
        </div>

        <div class="form-row">
          <label>صورة المنتج التراثي</label>
          <select id="npImagePreset" style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--line);background:var(--paper);color:var(--ink)">
            <option value="assets/category-craft.webp">صورة الحرف اليدوية الملكية (خان الخليلي)</option>
            <option value="assets/scene-cairo.webp">أرابيسك وأخشاب القاهرة المعزية</option>
            <option value="assets/scene-luxor.webp">ألبستر ونحت حجري الأقصر</option>
            <option value="assets/scene-sohag.webp">نول وكليم أخميم سوهاج</option>
            <option value="assets/scene-fayoum.webp">خوص طبيعي قرية الإعلام بالفيوم</option>
            <option value="assets/scene-qena.webp">فخار طبيعي قناوي</option>
            <option value="assets/scene-alex.webp">مراكب وفلوكات إسكندرية</option>
          </select>
        </div>

        <div class="form-row">
          <label>مدة التجهيز وحالة الشحن</label>
          <input type="text" id="npLead" value="جاهز للشحن الفوري (1 - 3 أيام)">
        </div>

        <button type="submit" class="primary" style="width:100%;padding:14px;font-size:15px;margin-top:6px">
          🚀 نشر المنتج في سوق مصر فوراً
        </button>
      </form>
    </div>`;

  document.body.appendChild(modal);
  document.getElementById('closeAddProduct').onclick = () => modal.remove();

  const form = document.getElementById('addProductForm');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const title = document.getElementById('npTitle').value.trim();
    const cat = document.getElementById('npCategory').value;
    const priceEgp = Number(document.getElementById('npPrice').value) || 500;
    const image = document.getElementById('npImagePreset').value;
    const lead = document.getElementById('npLead').value.trim();

    const catNames = {
      'copper': 'النقش على النحاس',
      'palm': 'صناعة الخوص',
      'arabesque': 'الأرابيسك والصدف',
      'pottery': 'الفخار والقلل',
      'alabaster': 'نحت الألباستر',
      'textiles': 'النسيج والكليم الأخميمي',
      'lanterns-boats': 'الفوانيس والمراكب'
    };

    const newProd = {
      id: `merchant-${Date.now()}`,
      title,
      priceEgp,
      priceUsd: Math.round(priceEgp / 50),
      category: cat,
      craftId: cat,
      craftName: catNames[cat] || 'صناعة تراثية',
      provinceId: 'cairo',
      provinceName: 'القاهرة',
      artisanId: 'artisan-merchant',
      artisanName: currentUser.name || 'شيخ الصنعة',
      artisanRating: 5.0,
      artisanWorkshop: 'ورشة سوق مصر المعتمدة',
      image,
      leadDays: lead,
      inStock: true
    };

    await window.HeritageService.addMerchantProduct(newProd);
    modal.remove();
    alert(t('productPublishedSuccess'));
    // Re-render marketplace if on artisans page
    if (location.hash === 'artisans' || location.hash.startsWith('artisans')) {
      route();
    }
  };
}


// NAVIGATION ROUTES
// -----------------------------------------------------------------------------
function routes() {
  return `
    <div class="hero-actions-container">
      <button class="hero-action-btn" data-route="map" title="${t('actionExploreEgypt')}">
        <span class="btn-icon">🗺️</span>
        <span class="btn-text">${t('actionExploreEgypt')}</span>
        <span class="btn-arrow">←</span>
      </button>
      <button class="hero-action-btn" data-route="heritage" title="${t('actionBrowseHeritage')}">
        <span class="btn-icon">🏺</span>
        <span class="btn-text">${t('actionBrowseHeritage')}</span>
        <span class="btn-arrow">←</span>
      </button>
      <button class="hero-action-btn" data-route="artisans?tab=products" title="${t('actionCraftsMarket')}">
        <span class="btn-icon">🛍️</span>
        <span class="btn-text">${t('actionCraftsMarket')}</span>
        <span class="btn-arrow">←</span>
      </button>
      <button class="hero-action-btn" data-route="artisans?tab=custom" title="${t('actionCustomCommission')}">
        <span class="btn-icon">⚒️</span>
        <span class="btn-text">${t('actionCustomCommission')}</span>
        <span class="btn-arrow">←</span>
      </button>
      <button class="hero-action-btn" data-route="foods" title="${t('actionDiscoverFoods')}">
        <span class="btn-icon">🍲</span>
        <span class="btn-text">${t('actionDiscoverFoods')}</span>
        <span class="btn-arrow">←</span>
      </button>
      <button class="hero-action-btn" data-cat="music" title="${t('actionFolkArts')}">
        <span class="btn-icon">🎶</span>
        <span class="btn-text">${t('actionFolkArts')}</span>
        <span class="btn-arrow">←</span>
      </button>
      <button class="hero-action-btn" data-cat="story" title="${t('actionTalesProverbs')}">
        <span class="btn-icon">📜</span>
        <span class="btn-text">${t('actionTalesProverbs')}</span>
        <span class="btn-arrow">←</span>
      </button>
    </div>`;
}

// -----------------------------------------------------------------------------
// 1. HOME VIEW
// -----------------------------------------------------------------------------
function home() {
  const cats = [
    { id:'craft', title:t('catCraft') },
    { id:'food', title:t('catFood') },
    { id:'music', title:t('catMusic') },
    { id:'story', title:t('catStory') }
  ];
  return `
    <section class="hero cinema">
      <video class="scene-video" autoplay muted loop playsinline preload="metadata" poster="assets/giza-daylight.jpg" aria-hidden="true">
        <source src="assets/giza-daylight.mp4" type="video/mp4">
      </video>
      <div class="scene-shade" aria-hidden="true"></div>
      <div class="hero-copy">
        <span class="eyebrow">${t('heroEyebrow')}</span>
        <h1>${t('heroTitle')}<em>${t('heroTitleEm')}</em></h1>
        <p>${t('heroDesc')}</p>
        <p class="hero-memory-line">${t('heroMemoryLine')}</p>
        <span class="quiet">${t('heroSubNotice')}</span>
        <button type="button" class="pill" data-replay-welcome>${t('journeyReplayWelcome')}</button>
      </div>
      <div class="hero-routes">${routes()}</div>
      <span class="scene-caption">${t('scenicCaption')}</span>
    </section>
    <div class="container">
      <div class="timeline" aria-label="Eras">
        ${[['ancient',t('ancientEgypt')],['coptic',t('copticEra')],['islamic',t('islamicEra')],['modern',t('modernEra')]].map(x=>`<button data-era="${x[0]}">${x[1]}</button>`).join('')}
      </div>
      <div class="section-head" id="heritageCategories" tabindex="-1"><h2>${t('heritageColorsTitle')}</h2></div>
      <div class="categories">
        ${cats.map(x=>`<button class="cat" data-cat="${x.id}"><div class="photo ${x.id}" role="img"></div><span>${x.title}</span><small>←</small></button>`).join('')}
      </div>
      <section class="intro-strip" style="background:linear-gradient(135deg,rgba(212,175,55,0.08),rgba(18,61,66,0.08));border:1px solid var(--gold);margin:40px 0;padding:30px;border-radius:18px">
        <h2>${t('fairTradeTitle')}</h2>
        <div>
          <p>${t('fairTradeDesc')}</p>
          <div style="display:flex;gap:12px;margin-top:15px;flex-wrap:wrap">
            <a href="#artisans" class="pill" style="background:var(--gold);color:#0f2147;font-weight:bold">${t('navArtisans')} ←</a>
            <a href="#foods" class="pill">${t('navFoods')} 📍</a>
          </div>
        </div>
      </section>
    </div>`;
}

// -----------------------------------------------------------------------------
// 2. MAP VIEW
// -----------------------------------------------------------------------------
function mapArtwork() {
  return `
    <div class="map-viewport" id="mapViewport">
      <div class="map-world" id="mapWorld">
        <img class="floating-country" src="assets/egypt-floating-south-v2.webp" alt="Egypt Heritage Map" draggable="false">
        ${provincesData.map(p => {
          const pos = p.mapPos || [50,50];
          return `<button class="map-spot ${p.id===selectedProvince?'active':''}" data-prov="${p.id}" data-map-prov="${p.id}" style="left:${pos[0]}%;top:${pos[1]}%" aria-label="${p.name}" title="${p.name}">
            <span class="spot-pulse"></span><span class="spot-core"></span><span class="spot-label">${p.name}</span>
          </button>`;
        }).join('')}
      </div>
    </div>`;
}

function mapPage() {
  const p = provincesData.find(x=>x.id===selectedProvince) || provincesData[0] || {id:'alex',name:'الإسكندرية'};
  return `
    <div class="page map-page">
      ${crumb(t('navMap'))}
      <div class="map-header">
        <div>
          <span class="eyebrow">${t('routeMapTitle')}</span>
          <h1>${t('mapTitle')}</h1>
          <p class="sub">${t('mapDesc')}</p>
        </div>
        <div class="map-controls">
          <button class="pill" data-map-zoom="in" title="+">+</button>
          <button class="pill" data-map-zoom="out" title="−">−</button>
          <button class="pill" data-map-zoom="reset" title="⟲">⟲</button>
        </div>
      </div>
      <div class="map-layout">
        <div class="map-canvas-card">${mapArtwork()}</div>
        <aside class="map-sidebar">
          <div class="search-box"><input type="text" id="provinceSearch" placeholder="${t('searchGovernorate')}" autocomplete="off"></div>
          <div class="province-card" id="provinceCard">
            <h2>${p.name}</h2>
            <p id="provinceDesc">${t('exploreProvince')}</p>
            <div style="display:flex;gap:10px;margin-top:15px;flex-wrap:wrap">
              <a href="#province/${p.id}" class="primary">${t('exploreProvince')}</a>
              <a href="#foods" class="pill">${t('navFoods')} 📍</a>
            </div>
          </div>
          <div class="provinces-list" id="provincesList">
            ${provincesData.map(item=>`<button class="prov-item ${item.id===selectedProvince?'active':''}" data-prov="${item.id}"><span>${item.name}</span><small>→</small></button>`).join('')}
          </div>
        </aside>
      </div>
    </div>`;
}

function updateProvince() {
  const p = provincesData.find(x=>x.id===selectedProvince);
  if (!p) return;
  const card = document.getElementById('provinceCard');
  if (card) {
    card.innerHTML = `<h2>${p.name}</h2><p>${t('exploreProvince')}</p>
      <div style="display:flex;gap:10px;margin-top:15px;flex-wrap:wrap">
        <a href="#province/${p.id}" class="primary">${t('exploreProvince')}</a>
        <a href="#foods" class="pill">${t('navFoods')} 📍</a>
      </div>`;
  }
  document.querySelectorAll('.map-spot').forEach(s=>s.classList.toggle('active',s.dataset.prov===selectedProvince));
  document.querySelectorAll('.prov-item').forEach(i=>i.classList.toggle('active',i.dataset.prov===selectedProvince));
}

function updateProvinceList(q) {
  const list = document.getElementById('provincesList');
  if (!list) return;
  const filtered = provincesData.filter(p=>!q||p.name.includes(q.trim()));
  list.innerHTML = filtered.map(item=>`<button class="prov-item ${item.id===selectedProvince?'active':''}" data-prov="${item.id}"><span>${item.name}</span><small>→</small></button>`).join('');
}

// -----------------------------------------------------------------------------
// 3. HERITAGE BROWSE
// -----------------------------------------------------------------------------
function heritagePage(provFilter = null) {
  if (provFilter) locality = provFilter;
  const prov = provincesData.find(p=>p.id===locality);
  return `
    <div class="page">
      ${crumb(`${t('navHeritage')} ${prov?`/ ${prov.name}`:''}`)}
      <div class="detail-top"><div>
        <span class="eyebrow">${t('routeHeritageTitle')}</span>
        <h1>${prov ? `${t('heritageProvinceTitle')} ${prov.name}` : t('heritageTitle')}</h1>
        <p class="sub">${t('heritageDesc')}</p>
      </div></div>
      <div class="filters-bar" style="display:flex;gap:12px;margin:20px 0;flex-wrap:wrap;align-items:center">
        <div class="search-box" style="flex:1;min-width:220px">
          <input type="text" id="heritageSearch" placeholder="${t('searchPlaceholder')}" value="${searchTerm}">
        </div>
        <select id="locality" class="filter-select">
          <option value="all">${t('allGovernorates')}</option>
          ${provincesData.map(p=>`<option value="${p.id}" ${locality===p.id?'selected':''}>${p.name}</option>`).join('')}
        </select>
        <select id="era" class="filter-select">
          <option value="all" ${era==='all'?'selected':''}>${t('allEras')}</option>
          <option value="ancient" ${era==='ancient'?'selected':''}>${t('ancientEgypt')}</option>
          <option value="coptic" ${era==='coptic'?'selected':''}>${t('copticEra')}</option>
          <option value="islamic" ${era==='islamic'?'selected':''}>${t('islamicEra')}</option>
          <option value="modern" ${era==='modern'?'selected':''}>${t('modernEra')}</option>
        </select>
      </div>
      <div class="category-tabs" style="display:flex;gap:8px;margin-bottom:24px;overflow-x:auto;padding-bottom:6px">
        ${[['all',t('catAll')],['craft',t('catCraft')],['food',t('catFood')],['music',t('catMusic')],['story',t('catStory')],['custom',t('catCustom')]].map(([id,label])=>`<button class="filter-pill ${category===id?'active':''}" data-filter="${id}">${label}</button>`).join('')}
      </div>
      <div class="results-grid" id="heritageResults">
        <div class="loading-spinner">${t('loadingResults')}</div>
      </div>
    </div>`;
}

/** Heritage record card for the browse grid (demo styling). */
function heritageRecordCard(rawRecord) {
  const H = window.HeritageRecords;
  const record = H.localizedRecord(rawRecord);
  const description = record.description || '';
  const location = (record.places || []).join(currentLang === 'ar' ? '، ' : ', ') || record.area || '';
  return `<a href="${H.recordHref(rawRecord)}" class="item-card record-card">
    <img class="record-card-image" src="${esc(H.recordIllustration(rawRecord))}" alt="" loading="lazy" decoding="async">
    <div class="card-copy">
      <small>${esc(recordCategoryLabel(rawRecord))}${location ? ' • ' + esc(location) : ''}</small>
      <h2>${esc(record.title)}</h2>
      <p>${esc(description.slice(0, 155))}${description.length > 155 ? '…' : ''}</p>
      <span class="badge">${t('recordCardBadge')}</span>
      <span class="record-arrow" aria-hidden="true">${currentLang === 'ar' ? '←' : '→'}</span>
    </div>
  </a>`;
}

function renderResults() {
  const container = document.getElementById('heritageResults');
  if (!container) return;
  const H = window.HeritageRecords;
  if (!H) {
    container.innerHTML = `<div class="empty"><strong>${t('noResults')}</strong></div>`;
    return;
  }
  const stripDiacritics = value => value.replace(/[\u064B-\u065F]/g, '');
  const query = stripDiacritics(H.normalizeAr(searchTerm)).toLowerCase();
  const scoped = locality === 'all' ? H.records : H.recordsForProvince(locality);
  const matches = scoped.filter(record => {
    const translated = H.localizedRecord(record);
    const searchable = stripDiacritics(H.normalizeAr(
      [record.code, record.title, translated.title, translated.description, translated.area, ...translated.places].join(' ')
    )).toLowerCase();
    return era === 'all' && (category === 'all' || record.kind === category) && searchable.includes(query);
  }).sort((a, b) => Number(H.isFeaturedRecord(b)) - Number(H.isFeaturedRecord(a)));
  container.innerHTML = matches.length
    ? matches.map(heritageRecordCard).join('')
    : `<div class="empty"><strong>${t('noResults')}</strong><p>${era !== 'all' ? t('recordsEraNote') : t('noResultsDesc')}</p><button class="primary" id="resetFilters">${t('viewAll')}</button></div>`;
  document.querySelectorAll('[data-filter]').forEach(b => b.classList.toggle('active', b.dataset.filter === category));
}

// -----------------------------------------------------------------------------
// 4. CRAFT DETAIL
// -----------------------------------------------------------------------------
async function craftPage(id='boats') {
  const craft = await window.HeritageService.getCraftDetails(id);
  if (!craft) return `<div class="page"><h1>${t('craftNotFound')}</h1><a href="#heritage" class="primary">${t('backToHeritage')}</a></div>`;
  const craftArtisans = await window.HeritageService.getArtisans({craftId:craft.id});

  let videoPlayerHtml = '';
  if (craft.localVideo || craft.youtubeId) {
    const effectiveSource = isOnlineEnv ? 'youtube' : activeVideoSource;
    // Online mode: local video files are not deployed — YouTube only, hide the toggle.
    const togglePillsHtml = (!isOnlineEnv && craft.localVideo)
      ? `<div class="video-toggle-pills" style="display:flex;gap:6px;background:rgba(212,175,55,0.15);padding:4px;border-radius:30px">
            <button class="pill ${effectiveSource==='youtube'?'active':''}" id="btnSourceYt" style="font-size:12px;padding:4px 12px">🌐 ${t('youtubeLabel')}</button>
            <button class="pill ${effectiveSource==='hybrid'?'active':''}" id="btnSourceHybrid" style="font-size:12px;padding:4px 12px">💻 ${t('localVideoLabel')}</button>
          </div>`
      : '';
    videoPlayerHtml = `
      <section class="video-container-card" style="margin:25px 0;background:var(--paper);border:2px solid var(--gold);border-radius:18px;padding:20px;box-shadow:0 12px 36px rgba(0,0,0,0.12)">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px">
          <div><h3 style="margin:0;font-size:18px;color:var(--ink)">🎬 ${t('watchVideo')}</h3>
            <small style="color:var(--muted)">${isOnlineEnv ? ('🌐 ' + t('youtubeLabel') + ' — ' + t('onlineVideoBadge')) : ('💻 ' + t('videoOfflineNote'))}</small></div>
          ${togglePillsHtml}
        </div>
        <div id="videoEmbedWrapper" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;background:#000;box-shadow:inset 0 0 20px rgba(0,0,0,0.6)">
          ${renderVideoElement(craft,effectiveSource)}
        </div>
      </section>`;
  }

  let artisansSectionHtml = `
    <section style="margin:35px 0;padding:24px;background:rgba(212,175,55,0.06);border:1px solid var(--gold);border-radius:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:16px">
        <div><h2 style="margin:0;font-size:20px">🏺 ${t('orderFromMaster')}</h2>
          <p style="margin:4px 0 0;font-size:13px;color:var(--muted)">${t('orderFromMasterDesc')}</p></div>
        <a href="#artisans" class="pill">${t('allArtisans')}</a>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px">
        ${craftArtisans.length?craftArtisans.map(a=>renderArtisanCard(a)).join(''):`<div style="padding:15px;background:var(--paper);border-radius:10px;border:1px dashed var(--line);grid-column:1/-1"><p style="margin:0;color:var(--muted)">${t('moreWorkshops')}</p></div>`}
      </div>
    </section>`;

  // Heritage record documentation enrichment (boats + copper-engraving pages)
  let recordEnrichmentHtml = '';
  const recordId = CRAFT_RECORD_IDS[craft.id];
  const rawRec = recordId && window.HeritageRecords ? window.HeritageRecords.findRecord('craft', recordId) : null;
  if (rawRec) {
    const rec = window.HeritageRecords.localizedRecord(rawRec);
    const toolIndex = rawRec.details.findIndex(([key]) => key === 'الأدوات');
    const toolsDetail = toolIndex > -1 && rec.details[toolIndex] ? rec.details[toolIndex] : null;
    const productsIndex = rawRec.details.findIndex(([key]) => key === 'أمثلة للمنتجات');
    const original = rec.sources.find(s => s.url);
    recordEnrichmentHtml = `
      ${heritageVisualList(toolsDetail ? toolsDetail[0] : 'الأدوات', craftToolPictures[rawRec.id], toolsDetail ? toolsDetail[1] : '')}
      <div class="craft-record-panels">
        ${productsIndex > -1 && rec.details[productsIndex] ? heritageVisualList(rec.details[productsIndex][0], copperProductPictures, '', 'heritage-product-list') : ''}
        ${rawRec.id === 'R000016' ? exhibitionSection() : ''}
        <section class="demo-panel record-docs-panel">
          ${heritageReferenceLine(rec.sources)}
          ${original ? recordExternalLink(original.url, t('recordViewSource'), 'primary') : ''}
        </section>
      </div>`;
  }

  return `
    <div class="page">
      ${crumb(`<a href="#heritage">${t('navHeritage')}</a> / <a href="#province/${craft.provinceId}">${craft.provinceName}</a> / ${craft.title}`)}
      <div class="detail-top"><div>
        <span class="eyebrow">${craft.category==='craft'?t('catCraft'):t('catMusic')} • ${craft.provinceName}</span>
        <h1>${craft.title}</h1><p class="sub">${craft.summary}</p>
        <div style="display:flex;gap:8px;align-items:center;margin:12px 0;flex-wrap:wrap">
          <span class="badge">${t('verifiedBadge')}</span>
          <span class="badge" style="background:var(--teal);color:#fff">📍 ${craft.regions}</span>
        </div>
      </div>
      <div class="card-art" style="${craft.youtubeId?`background:url('https://img.youtube.com/vi/${craft.youtubeId}/hqdefault.jpg') center/cover;position:relative;`:''}">
        ${craft.youtubeId?`
          <button type="button" class="video-play-overlay-btn" onclick="event.preventDefault();event.stopPropagation();window.openVideoModal('${craft.id}');" title="${t('watchVideo')}" aria-label="${t('watchVideo')}">
            <span class="video-play-circle" style="width:68px;height:68px">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
            </span>
            <span class="video-play-tag" style="font-size:12px;padding:5px 14px">🎬 ${t('watchVideo')}</span>
          </button>`:boatSvg}
      </div></div>
      ${videoPlayerHtml}
      <div class="detail-grid">
        <article class="article">
          <section><h2>${t('craftHistory')}</h2><p>${craft.description}</p></section>
          <section><h2>${t('materialsUsed')}</h2><p>${craft.materials}</p></section>
          ${craft.tools?`<section><h2>${t('toolsUsed')}</h2><p>${craft.tools}</p></section>`:''}
          <section><h2>${t('craftSteps')}</h2><ol>${craft.steps.map(s=>`<li>${s}</li>`).join('')}</ol></section>
        </article>
        <aside class="facts">
          <h3>${t('documentationCard')}</h3>
          <dl>
            <dt>${t('province')}</dt><dd>${craft.provinceName}</dd>
            <dt>${t('regions')}</dt><dd>${craft.regions}</dd>
            <dt>${t('status')}</dt><dd><span style="color:var(--teal);font-weight:bold">${t('verifiedBadge')}</span></dd>
            <dt>${t('buyerProtection')}</dt><dd style="color:var(--gold);font-weight:bold">🛡️ ${t('escrowSecured')}</dd>
          </dl>
          <button class="primary" id="askHorusBtn" style="margin-top:20px;width:100%">${t('askHorusCraft')}</button>
        </aside>
      </div>
      ${recordEnrichmentHtml}
      ${artisansSectionHtml}
    </div>`;
}

function renderVideoElement(craft, mode) {
  const langCode = currentLang || 'ar';
  if ((mode === 'youtube' || isOnlineEnv || !craft.localVideo) && craft.youtubeId) {
    return `<iframe src="https://www.youtube-nocookie.com/embed/${craft.youtubeId}?rel=0&enablejsapi=1&cc_load_policy=1&cc_lang_pref=${langCode}&hl=${langCode}&autoplay=0" 
      title="${craft.title}" 
      loading="lazy" 
      frameborder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
      allowfullscreen 
      referrerpolicy="strict-origin-when-cross-origin" 
      style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;"></iframe>`;
  } else if (mode === 'hybrid' && craft.localVideo) {
    return `<video id="playerLocal" controls playsinline preload="metadata" style="position:absolute;top:0;left:0;width:100%;height:100%;background:#000;border:0" 
      onerror="window.handleVideoFallback && window.handleVideoFallback('${craft.id}')">
      <source src="${craft.localVideo}" type="video/mp4" onerror="window.handleVideoFallback && window.handleVideoFallback('${craft.id}')">
      <p style="color:#fff;padding:20px;text-align:center">${t('localVideoNotFound')}</p>
    </video>`;
  } else if (craft.youtubeId) {
    return `<iframe src="https://www.youtube-nocookie.com/embed/${craft.youtubeId}?rel=0&enablejsapi=1&cc_load_policy=1&cc_lang_pref=${langCode}&hl=${langCode}&autoplay=0" 
      title="${craft.title}" 
      loading="lazy" 
      frameborder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
      allowfullscreen 
      referrerpolicy="strict-origin-when-cross-origin" 
      style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;"></iframe>`;
  }
  return `<div style="color:#fff;display:flex;align-items:center;justify-content:center;height:100%">${t('noVideoAvailable')}</div>`;
}

// -----------------------------------------------------------------------------
// 4.5 HERITAGE RECORDS — documented record pages (87 records)
// -----------------------------------------------------------------------------
const RECORD_EXHIBITION_URL = 'https://www.cdf.gov.eg/?q=calendar-node-field-event-day/day/2026-11-11';
const RECORD_AGENDA_URL = 'https://www.cdf.gov.eg/?q=calendar-node-field-event-day/month1';

/** Craft pages enriched with their documentation record. */
const CRAFT_RECORD_IDS = { boats: 'R000006', 'copper-engraving': 'R000016' };

const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[c]);

const recordExternalLink = (url, title, className = '') =>
  `<a class="${className}" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(title)} ↗</a>`;

const recordCategoryLabel = record => ({
  craft: t('catCraft'), food: t('catFood'), music: t('catMusic'), story: t('catStory')
}[record.kind]) || t('navHeritage');

/** English labels for the visual lists, shown for every non-Arabic language. */
const VISUAL_LABEL_EN = {
  'الأدوات': 'Tools',
  'المكونات الأساسية': 'Key ingredients',
  'أمثلة للمنتجات': 'Examples of products',
  'شاكوش': 'Hammer',
  'سندان': 'Anvil',
  'قلم نقش': 'Engraving punch',
  'مسطرة': 'Ruler',
  'برجل نقش': 'Dividers',
  'الفأرة': 'Hand plane',
  'الربوة': 'Rabbet plane',
  'منشار كهربائي': 'Power saw',
  'مطرقة': 'Hammer',
  'كور الحدادة': 'Forge',
  'معدات اللحام': 'Welding equipment',
  'عدس أبو جبة': 'Whole brown lentils',
  'أرز': 'Rice',
  'مكرونة': 'Pasta',
  'طماطم': 'Tomatoes',
  'بصل': 'Onion',
  'ثوم': 'Garlic',
  'زيت': 'Oil',
  'ملح': 'Salt',
  'كمون': 'Cumin',
  'حمص الشام': 'Chickpeas',
  'طماطم مبشورة': 'Grated tomatoes',
  'طحينة حمراء': 'Red tahini',
  'زيت بذرة الكتان': 'Flaxseed oil',
  'بقدونس': 'Parsley',
  'كزبرة خضراء': 'Fresh coriander',
  'شبت': 'Dill',
  'خل': 'Vinegar',
  'عصير ليمون': 'Lemon juice',
  'توابل الحباش': 'Habbash seasoning',
  'شواش الذرة': 'Corn silk',
  'حمص الشام · يُطحن كبديل لشواش الذرة': 'Ground chickpeas, an alternative to corn silk',
  'كرات الكشك المجففة': 'Dried kishk balls',
  'مرقة بط أو دجاج أو لحم': 'Duck, chicken or meat stock',
  'سمن بلدي': 'Local ghee',
  'فلفل أسود': 'Black pepper',
  'دقيق أبيض': 'White flour',
  'سكر': 'Sugar',
  'ماء': 'Water',
  'صينية نحاسية منقوشة': 'Engraved copper tray',
  'قطعة نحاسية زخرفية': 'Decorative copper piece'
};

const recordVisualLabel = value => currentLang === 'ar' ? value : (VISUAL_LABEL_EN[value] || value);

/** Visual tool lists for the two documented crafts (image name, Arabic label). */
const craftToolPictures = {
  R000016: [
    ['hammer', 'شاكوش'], ['anvil', 'سندان'], ['punch', 'قلم نقش'],
    ['ruler', 'مسطرة'], ['divider', 'برجل نقش']
  ],
  R000006: [
    ['plane', 'الفأرة'], ['rabbet-plane', 'الربوة'], ['bandsaw', 'منشار كهربائي'],
    ['hammer', 'مطرقة'], ['anvil', 'سندان'], ['forge', 'كور الحدادة'], ['welder', 'معدات اللحام']
  ]
};

/** Visual ingredient lists per food code (image name, Arabic label). */
const ingredientPictures = {
  F000001: [
    ['lentils', 'عدس أبو جبة'], ['rice', 'أرز'], ['pasta', 'مكرونة'],
    ['tomato', 'طماطم'], ['onion', 'بصل'], ['garlic', 'ثوم'], ['oil', 'زيت'],
    ['salt', 'ملح'], ['cumin', 'كمون'], ['chickpeas', 'حمص الشام']
  ],
  F000002: [
    ['tomato', 'طماطم مبشورة'], ['tahini', 'طحينة حمراء'], ['flax-oil', 'زيت بذرة الكتان'],
    ['parsley', 'بقدونس'], ['cilantro', 'كزبرة خضراء'], ['dill', 'شبت'], ['garlic', 'ثوم'],
    ['vinegar', 'خل'], ['lemon', 'عصير ليمون'], ['habash-spices', 'توابل الحباش'],
    ['corn-silk', 'شواش الذرة'], ['chickpeas', 'حمص الشام · يُطحن كبديل لشواش الذرة']
  ],
  F000003: [
    ['keshk', 'كرات الكشك المجففة'], ['broth', 'مرقة بط أو دجاج أو لحم'],
    ['ghee', 'سمن بلدي'], ['onion', 'بصل'], ['garlic', 'ثوم'], ['salt', 'ملح'], ['pepper', 'فلفل أسود']
  ],
  F000004: [
    ['flour', 'دقيق أبيض'], ['salt', 'ملح'], ['sugar', 'سكر'], ['water', 'ماء'], ['ghee', 'سمن بلدي']
  ]
};

/** Copper product examples (image name, Arabic label). */
const copperProductPictures = [
  ['copper-tray', 'صينية نحاسية منقوشة'],
  ['copper-decoration', 'قطعة نحاسية زخرفية']
];

/** Grid of small labelled images (tools, ingredients, products). */
function heritageVisualList(title, items, description = '', className = '') {
  if (!items) return '';
  const isAr = currentLang === 'ar';
  return `<section class="demo-panel heritage-visual-list ${className}">
    <h2>${esc(recordVisualLabel(title))}</h2>
    <ul class="heritage-visual-items" role="list">${items.map(([image, label]) => `
      <li><img src="assets/visual-index/${image}.webp" width="224" height="224" loading="lazy" decoding="async" alt="">
        <span>${esc(isAr ? label : recordVisualLabel(label))}</span></li>`).join('')}</ul>
    ${description ? `<p class="heritage-visual-description">${esc(description)}</p>` : ''}
    <p class="small-notice">${esc(t('recordAIVisualsNote'))}</p>
  </section>`;
}

/** Record image with its AI-generation note. */
function heritageFigure(record) {
  const H = window.HeritageRecords;
  const proverbAlt = record && record.kind === 'story' && Object.hasOwn(H.proverbIllustrations, record.code)
    ? (currentLang === 'ar' ? H.proverbIllustrations[record.code] : t('recordIllustrationAlt') + record.title)
    : '';
  if (!record || (!proverbAlt && !['craft', 'music', 'food'].includes(record.kind))) return '';
  const src = H.recordIllustration(record);
  return `<figure class="demo-figure${proverbAlt ? ' proverb-figure' : ''}">
    <img src="${esc(src)}" alt="${esc(proverbAlt || t('recordIllustrationAlt') + record.title)}" decoding="async"${proverbAlt ? ' width="319" height="319"' : ''}>
    <figcaption>${esc(proverbAlt ? t('recordAIDrawing') : t('recordAIImage'))}</figcaption>
  </figure>`;
}

/** Inline documentation video for craft, food and music records. */
function heritageVideoSection(record) {
  if (!record || !['food', 'craft', 'music'].includes(record.kind)) return '';
  const H = window.HeritageRecords;
  const video = [record.video, ...record.sources].find(source => source && H.videoEmbedUrl(source.url));
  if (!video) return '';
  const heading = { food: t('recordWatchFood'), craft: t('recordWatchCraft'), music: t('recordWatchMusic') }[record.kind];
  const title = esc(video.title);
  const embed = H.videoEmbedUrl(video.url);
  const thumbnail = embed.startsWith('https://www.youtube-nocookie.com/')
    ? `<img src="https://i.ytimg.com/vi/${embed.split('/').pop()}/hqdefault.jpg" alt="" loading="lazy">`
    : '';
  return `<section class="heritage-video heritage-video-feature">
    <h2>${esc(heading)}</h2>
    <button class="heritage-video-preview" type="button" aria-label="${esc(t('recordPlayVideoAria'))} ${title}"
      data-heritage-video="${esc(embed)}" data-video-title="${title}"
      style="background-image:url('${esc(H.recordIllustration(record))}')">
      ${thumbnail}
      <span class="heritage-video-play" aria-hidden="true">▶︎</span>
      <span class="heritage-video-label" aria-hidden="true">${esc(t('recordPlayVideo'))}</span>
    </button>
    <p>${title}</p>
    ${video.credit ? `<p class="small-notice">${esc(video.credit)}</p>` : ''}
    <p class="small-notice" data-video-fallback hidden>${esc(t('recordVideoFallbackPrefix'))} ${recordExternalLink(video.url, t('recordOpenAtPublisher'), 'demo-link')}.</p>
  </section>`;
}

/** Replace the video preview button with the embedded player. */
function playHeritageVideo(button) {
  const url = new URL(button.dataset.heritageVideo);
  url.searchParams.set('autoplay', '1');
  url.searchParams.set('playsinline', '1');
  url.searchParams.set('mute', '1');
  const player = document.createElement('iframe');
  player.className = 'heritage-video-player';
  player.title = button.dataset.videoTitle;
  player.referrerPolicy = 'strict-origin-when-cross-origin';
  player.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  player.allowFullscreen = true;
  player.src = url.href;
  const fallback = button.closest('.heritage-video') && button.closest('.heritage-video').querySelector('[data-video-fallback]');
  if (fallback) fallback.hidden = false;
  button.replaceWith(player);
  player.focus();
}

/** Where to try the koshari of the F000001 record in person. */
function kosharyVisitSection() {
  const official = 'https://www.koshary-aboutarek.com/ar/contact-us';
  const directions = 'https://www.google.com/maps/search/?api=1&query='
    + encodeURIComponent('Koshary Abou Tarek, 16 Marouf Street, Downtown Cairo');
  const travelGuide = 'https://www.thecairoguide.com/city/cairo/articles/cairo-s-street-food-trail-from-koshary-to-mango-juice';
  const coverage = 'https://www.almasryalyoum.com/news/details/3487694';
  return `<section class="demo-panel" aria-labelledby="koshary-visit-title">
    <span class="eyebrow">${esc(t('recordVisitEyebrow'))}</span>
    <h2 id="koshary-visit-title">${esc(t('recordTryFoodLive'))}</h2>
    <h3>${esc(t('recordKosharyPlace'))}</h3>
    <p>${esc(t('recordKosharyDesc'))}</p>
    <p><strong>${esc(t('recordKosharyAddressLabel'))}</strong> · ${esc(t('recordKosharyAddress'))}</p>
    <div class="demo-actions">
      ${recordExternalLink(directions, t('recordOpenDirections'), 'primary')}
      ${recordExternalLink(official, t('recordOfficialBranch'), 'demo-link')}
    </div>
    <p class="small-notice">${recordExternalLink(travelGuide, t('recordFoodTourGuide'), 'demo-link')} ·
      ${recordExternalLink(coverage, t('recordDiplomatCoverage'), 'demo-link')}</p>
  </section>`;
}

/** Traditional Crafts Center exhibition for the copper record. */
function exhibitionSection() {
  return `<section class="demo-panel">
    <span class="eyebrow">${esc(t('recordVisitEyebrow'))}</span>
    <h2>${esc(t('recordSeeCraftLive'))}</h2>
    <span class="badge">${esc(t('recordExhibitionBadge'))}</span>
    <h3>${esc(t('recordExhibitionTitle'))}</h3>
    <p>${esc(t('recordExhibitionDesc'))}</p>
    <p>${esc(t('recordExhibitionMeta'))}</p>
    <div class="demo-actions">${recordExternalLink(RECORD_EXHIBITION_URL, t('recordViewAnnouncement'), 'primary')}
      ${recordExternalLink(RECORD_AGENDA_URL, t('recordBrowseEvents'), 'demo-link')}</div>
  </section>`;
}

/** Craft records bridge to our real artisans souq. */
function craftMarketCard() {
  return `<section class="demo-panel craft-market-card">
    <h2>${esc(t('craftsExhibitionTitle'))}</h2>
    <img src="assets/craft-market-al-muizz.webp" alt="${esc(t('recordMarketImageAlt'))}" width="960" height="540" loading="lazy">
    <p>${esc(t('recordMarketDesc'))}</p>
    <a class="primary" href="#artisans">${esc(t('recordShopNow'))}</a>
  </section>`;
}

/** Performing-arts records: no confirmed shows, link to the public agenda. */
function folkShowsSection() {
  return `<section class="demo-panel">
    <h2>${esc(t('recordSeeOnStage'))}</h2>
    <p>${esc(t('recordNoShowsPartial'))}</p>
    <p>${esc(t('recordOtherShows'))}</p>
    ${recordExternalLink(RECORD_AGENDA_URL, t('recordBrowseShows'), 'demo-link')}
  </section>`;
}

/** Invite visitors to share their version of the P0004 proverb. */
function storyContribution(record) {
  return `<section class="demo-panel">
    <span class="eyebrow">${esc(t('recordTellEgypt'))}</span><h2>${esc(t('recordShareHow'))}</h2>
    <p>${esc(t('recordShareDesc'))}</p>
    <details class="demo-disclosure"><summary class="primary">${esc(t('recordShareButton'))}</summary>
      <form class="demo-form" data-story-form>
        <label>${esc(t('recordFormVersion'))}<input name="version" required maxlength="200" value="${esc(record.title)}"></label>
        <label>${esc(t('recordFormPlace'))}<input name="place" required maxlength="80"></label>
        <label>${esc(t('recordFormContext'))}<textarea name="context" required maxlength="500" rows="3"></textarea></label>
        <button class="primary" type="submit">${esc(t('recordFormSubmit'))}</button>
        <p class="demo-feedback" role="status" hidden></p>
      </form>
    </details>
  </section>`;
}

/** Documentation references line (links to the original sources). */
function heritageReferenceLine(sources) {
  if (!sources.length) return '';
  const separator = currentLang === 'ar' ? ' ؛ ' : '; ';
  return `<p class="record-references small-notice"><strong>${esc(t('recordReferences'))}</strong> ·
    ${sources.map(source => {
      const title = source.url ? recordExternalLink(source.url, source.title, 'demo-link') : esc(source.title);
      return title + (source.reference ? ` (${esc(source.reference)})` : '');
    }).join(separator)}</p>`;
}

/** Full page for one documented heritage record. */
function recordPage(rawRecord) {
  const H = window.HeritageRecords;
  const provinceEntry = Object.entries(H.provinceNames)
    .find(([, name]) => rawRecord.places.some(place => H.normalizeAr(place) === H.normalizeAr(name)));
  const provinceId = provinceEntry ? provinceEntry[0] : null;
  const localizedProvince = provinceId ? provincesData.find(p => p.id === provinceId) : null;
  const provinceLabel = (localizedProvince && localizedProvince.name) || (provinceEntry ? provinceEntry[1] : '');
  const record = H.localizedRecord(rawRecord);
  const video = heritageVideoSection(record);
  const media = video || heritageFigure(record);
  const copper = record.id === 'R000016';
  const proverb = record.code === 'P0004';
  const koshary = record.kind === 'food' && record.code === 'F000001';
  const location = [...new Set([...record.places, record.area].filter(Boolean))].join(' · ');
  const original = record.sources.find(s => s.url);
  const visualTitleAr = record.kind === 'food' ? 'المكونات الأساسية' : 'الأدوات';
  const visualItems = record.kind === 'food' ? ingredientPictures[record.code]
    : record.kind === 'craft' ? craftToolPictures[record.id] : null;
  const visualIndex = visualItems ? rawRecord.details.findIndex(([key]) => key === visualTitleAr) : -1;
  const productsIndex = copper ? rawRecord.details.findIndex(([key]) => key === 'أمثلة للمنتجات') : -1;
  const detailPanels = rawRecord.details.map((rawDetail, index) => {
    const detail = record.details && record.details[index] ? record.details[index] : rawDetail;
    if (index === visualIndex) return heritageVisualList(detail[0], visualItems, detail[1]);
    if (index === productsIndex) return heritageVisualList(detail[0], copperProductPictures, '', 'heritage-product-list');
    return `<section class="demo-panel${String(detail[1]).length > 420 ? ' record-long-panel' : ''}"><h2>${esc(detail[0])}</h2><p>${esc(detail[1])}</p></section>`;
  }).join('');
  return `<div class="page heritage-record-page">
    ${crumb(`<a href="#heritage">${t('navHeritage')}</a>` + (provinceId ? ` / <a href="#province/${provinceId}">${esc(provinceLabel)}</a>` : '') + ` / ${esc(record.title)}`)}
    <div class="detail-top demo-detail-top${video ? ' detail-with-video' : media ? '' : ' detail-without-media'}">
      <div><span class="eyebrow">${esc(recordCategoryLabel(record))}</span>
        <h1>${esc(record.title)}</h1><p class="sub">${esc(location)}</p>
        <span class="badge">${esc(t('recordDraftBadge'))}</span>
        <p class="sub record-description">${esc(record.description || t('recordNoDescription'))}</p>
        ${heritageReferenceLine(record.sources)}
        ${original ? recordExternalLink(original.url, t('recordViewSource'), 'primary') : ''}
      </div>
      ${media}
    </div>
    <div class="demo-record-body">
      ${detailPanels}
      ${koshary ? kosharyVisitSection() : ''}
      ${copper ? exhibitionSection() : ''}
      ${record.kind === 'craft' ? craftMarketCard() : ''}
      ${record.kind === 'music' ? folkShowsSection() : ''}
      ${proverb ? storyContribution(record) : ''}
    </div>
  </div>`;
}

// -----------------------------------------------------------------------------
// 5. FOODS
// -----------------------------------------------------------------------------
async function foodsPage() {
  const foods = await window.HeritageService.getFoods({search:searchTerm});
  return `
    <div class="page foods-page">
      ${crumb(t('navFoods'))}
      <div class="detail-top"><div>
        <span class="eyebrow">${t('catFood')}</span>
        <h1>${t('foodPageTitle')}</h1><p class="sub">${t('foodPageDesc')}</p>
      </div></div>
      <div class="filters-bar" style="display:flex;gap:12px;margin:20px 0;flex-wrap:wrap">
        <div class="search-box" style="flex:1;min-width:240px">
          <input type="text" id="foodSearchInput" placeholder="${t('foodSearchPlaceholder')}" value="${searchTerm}">
        </div>
      </div>
      <div class="results-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px">
        ${foods.map(food=>`
          <div class="food-card" style="background:var(--paper);border:1px solid var(--line);border-radius:18px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 24px rgba(0,0,0,0.06);transition:transform 0.2s">
            <div style="background:linear-gradient(135deg,#0f2147,#123d42);color:#d4af37;padding:24px 20px;position:relative">
              <span style="font-size:36px;display:block;margin-bottom:8px">🍲</span>
              <span class="badge" style="position:absolute;top:15px;${currentLang==='ar'?'left':'right'}:15px;background:rgba(212,175,55,0.25);color:#fff">${food.provinceName}</span>
              <h2 style="margin:0;font-size:20px;color:#fff">${food.title}</h2>
            </div>
            <div style="padding:20px;flex:1;display:flex;flex-direction:column;justify-content:space-between">
              <div>
                <p style="font-size:13.5px;line-height:1.7;color:var(--ink);margin:0 0 14px">${food.summary}</p>
                <div style="background:rgba(0,0,0,0.03);padding:10px 14px;border-radius:10px;margin-bottom:16px">
                  <strong style="font-size:12px;color:var(--teal);display:block;margin-bottom:4px">🌾 ${t('keyIngredients')}</strong>
                  <span style="font-size:12px;color:var(--muted)">${food.ingredients}</span>
                </div>
              </div>
              <div style="display:flex;gap:10px;flex-direction:column">
                <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(food.mapsQuery)}" target="_blank" rel="noopener noreferrer" class="primary" style="text-align:center;background:#2d88ff;border-color:#2d88ff;display:flex;align-items:center;justify-content:center;gap:8px">
                  <span>📍</span><span>${t('mapRestaurantsBtn')}</span>
                </a>
                <a href="#food/${food.id}" class="pill" style="text-align:center">${t('foodStoryLink')}</a>
              </div>
            </div>
          </div>`).join('')}
      </div>
    </div>`;
}

async function foodDetailPage(id) {
  const food = await window.HeritageService.getFoodById(id);
  if (!food) return `<div class="page"><h1>${t('dishNotFound')}</h1><a href="#foods" class="primary">${t('navFoods')} ←</a></div>`;
  return `
    <div class="page">
      ${crumb(`<a href="#foods">${t('navFoods')}</a> / ${food.title}`)}
      <div class="detail-top"><div>
        <span class="eyebrow">${t('catFood')} • ${food.provinceName}</span>
        <h1>${food.title}</h1><p class="sub">${food.summary}</p>
        <div style="display:flex;gap:10px;align-items:center;margin-top:12px">
          <span class="badge">${t('verifiedBadge')}</span>
          <span class="badge" style="background:var(--gold);color:#0f2147;font-weight:bold">${food.bestSeason||t('yearRound')}</span>
        </div>
      </div></div>
      <div class="detail-grid">
        <article class="article">
          <section><h2>${t('foodOrigin')}</h2><p>${food.description}</p></section>
          <section><h2>${t('authenticIngredients')}</h2><p>${food.ingredients}</p></section>
          <section class="maps-callout" style="background:rgba(45,136,255,0.08);border:1px solid #2d88ff;padding:24px;border-radius:16px;margin:25px 0">
            <h3 style="margin:0 0 8px;color:var(--ink)">📍 ${t('whereToEat')} ${food.provinceName}?</h3>
            <p style="margin:0 0 15px;font-size:13px;color:var(--muted)">${t('mapsQueryDesc')}</p>
            <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(food.mapsQuery)}" target="_blank" rel="noopener noreferrer" class="primary" style="background:#2d88ff;border-color:#2d88ff;display:inline-flex;align-items:center;gap:8px">
              <span>🗺️</span><span>${t('openMapsRestaurants')}</span>
            </a>
          </section>
        </article>
        <aside class="facts">
          <h3>${t('culinaryCard')}</h3>
          <dl>
            <dt>${t('province')}</dt><dd>${food.provinceName}</dd>
            <dt>${t('bestSeason')}</dt><dd>${food.bestSeason||t('yearRound')}</dd>
            <dt>${t('status')}</dt><dd><span style="color:var(--teal);font-weight:bold">${t('verifiedBadge')}</span></dd>
          </dl>
          <button class="primary" id="askHorusBtn" style="margin-top:20px;width:100%">${t('askHorusFood')}</button>
        </aside>
      </div>
    </div>`;
}

// -----------------------------------------------------------------------------
// 6. SOUQ MISR — INTEGRATED LIVING HERITAGE E-STORE & WORKSHOPS
// -----------------------------------------------------------------------------

// Sort a ready-products list according to the active souq sort mode.
function sortReadyProducts(list) {
  const arr = [...list];
  if (activeProductSort === 'price-asc') arr.sort((a, b) => a.priceEgp - b.priceEgp);
  else if (activeProductSort === 'price-desc') arr.sort((a, b) => b.priceEgp - a.priceEgp);
  else if (activeProductSort === 'rating') arr.sort((a, b) => (b.artisanRating || 0) - (a.artisanRating || 0));
  return arr; // 'recommended' keeps the source order (merchant picks first)
}

// Empty-state block for the products grid (with a clear-filters action).
function souqEmptyState() {
  return `<div class="empty-state-card" style="grid-column:1/-1;text-align:center;padding:40px;background:var(--paper);border:1px dashed var(--line);border-radius:14px;color:var(--muted)">
    <p style="margin:0 0 14px">${t('noProductsFound')}</p>
    <button type="button" class="pill btn-clear-souq-filters" style="border-color:var(--gold);color:var(--gold)">✕ ${t('clearFilters')}</button>
  </div>`;
}

async function artisansPage() {
  const isAr = (!window.I18N || window.I18N.current === 'ar');
  const isMerchant = isLoggedIn && currentUser && currentUser.role === 'artisan';
  const artisans = await window.HeritageService.getArtisans({});
  const readyProducts = await window.HeritageService.getReadyProducts({
    category: activeProductCategory,
    search: productSearchTerm
  });

  const craftCats = [
    { id: 'all', label: t('filterAll') },
    { id: 'copper', label: t('filterCopper') },
    { id: 'palm', label: t('filterPalm') },
    { id: 'arabesque', label: t('filterArabesque') },
    { id: 'pottery', label: t('filterPottery') },
    { id: 'alabaster', label: t('filterAlabaster') },
    { id: 'textiles', label: t('filterTextiles') },
    { id: 'lanterns-boats', label: t('filterLanternsBoats') }
  ];

  const sortedProducts = sortReadyProducts(readyProducts);

  return `
    <div class="page artisans-page">
      ${crumb(t('navArtisans'))}
      <div class="detail-top exhibition-hero"><div>
        <span class="eyebrow">${t('craftsExhibitionEyebrow')}</span>
        <h1>${t('craftsExhibitionTitle')}</h1>
        <p class="sub">${t('craftsExhibitionDesc')}</p>
      </div></div>

      <!-- Trust & Protection Banner -->
      <div class="protection-banner" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin:24px 0">
        <div class="trust-card" style="background:var(--paper);border:1px solid var(--gold);padding:16px 18px;border-radius:14px;display:flex;gap:12px;align-items:center">
          <span style="font-size:26px">🛡️</span>
          <div><strong style="display:block;font-size:13.5px">${t('fairPriceGuarantee')}</strong><small style="color:var(--muted)">${t('fairPriceDesc')}</small></div>
        </div>
        <div class="trust-card" style="background:var(--paper);border:1px solid var(--teal);padding:16px 18px;border-radius:14px;display:flex;gap:12px;align-items:center">
          <span style="font-size:26px">💬</span>
          <div><strong style="display:block;font-size:13.5px">${t('directLiveChat')}</strong><small style="color:var(--muted)">${t('directChatDesc')}</small></div>
        </div>
        <div class="trust-card" style="background:var(--paper);border:1px solid var(--gold);padding:16px 18px;border-radius:14px;display:flex;gap:12px;align-items:center">
          <span style="font-size:26px">💳</span>
          <div><strong style="display:block;font-size:13.5px">${t('secureEscrow')}</strong><small style="color:var(--muted)">${t('secureEscrowDesc')}</small></div>
        </div>
        <div class="trust-card" style="background:var(--paper);border:1px solid #ff9800;padding:16px 18px;border-radius:14px;display:flex;gap:12px;align-items:center">
          <span style="font-size:26px">✈️</span>
          <div><strong style="display:block;font-size:13.5px">${t('worldwideShipping')}</strong><small style="color:var(--muted)">${t('currencyUsdNotice')}</small></div>
        </div>
      </div>

      <!-- Currency Switcher & Merchant Publish Bar -->
      <div class="currency-switcher-bar">
        <div class="currency-label-wrap">
          <span class="currency-icon">💱</span>
          <strong>${t('currencySwitcherLabel')}:</strong>
        </div>
        <div class="currency-toggle-group">
          <button type="button" class="currency-pill ${currentCurrency==='dual'?'active':''}" data-currency="dual">${t('currDual')}</button>
          <button type="button" class="currency-pill ${currentCurrency==='egp'?'active':''}" data-currency="egp">${t('currEgp')}</button>
          <button type="button" class="currency-pill ${currentCurrency==='usd'?'active':''}" data-currency="usd">${t('currUsd')}</button>
        </div>
        <span class="currency-rate-hint">($1 USD ≈ 50 EGP)</span>

        <!-- Merchant Add Product Button -->
        <button type="button" class="primary btn-open-add-product" style="margin-inline-start:auto;padding:8px 16px;font-size:12.5px;border-radius:8px">
          ${t('btnAddNewProduct')}
        </button>
      </div>

      <!-- Exhibition Navigation Tabs -->
      <div class="exhibition-tabs-wrap">
        <button type="button" class="exhibition-tab ${activeExhibitionTab==='products'?'active':''}" data-ex-tab="products">
          ${t('tabReadyProducts')} (${readyProducts.length})
        </button>
        <button type="button" class="exhibition-tab ${activeExhibitionTab==='artisans'?'active':''}" data-ex-tab="artisans">
          ${t('tabMasterArtisans')} (${artisans.length})
        </button>
      </div>

      <!-- VIEW PANE 1: READY PRODUCTS EXHIBITION -->
      <div id="paneReadyProducts" style="display:${activeExhibitionTab==='products'?'block':'none'}">
        <div class="products-controls-bar">
          <div class="products-search-box">
            <input type="text" id="productSearchInput" placeholder="${t('searchProductsPlaceholder')}" value="${productSearchTerm}">
          </div>
          <div class="products-sort-row">
            <span class="souq-results-count" id="souqResultsCount">${t('resultsCountLabel')}: ${sortedProducts.length}</span>
            <label class="souq-sort-label">
              <span>${t('sortBy')}</span>
              <select id="productSortSelect" class="souq-sort-select">
                <option value="recommended" ${activeProductSort==='recommended'?'selected':''}>${t('sortRecommended')}</option>
                <option value="price-asc" ${activeProductSort==='price-asc'?'selected':''}>${t('sortPriceAsc')}</option>
                <option value="price-desc" ${activeProductSort==='price-desc'?'selected':''}>${t('sortPriceDesc')}</option>
                <option value="rating" ${activeProductSort==='rating'?'selected':''}>${t('sortRating')}</option>
              </select>
            </label>
          </div>
          <div class="products-filter-pills">
            ${craftCats.map(c => `
              <button type="button" class="prod-filter-pill ${activeProductCategory===c.id?'active':''}" data-prod-cat="${c.id}">
                ${c.label}
              </button>
            `).join('')}
          </div>
        </div>

        <div class="products-grid" id="productsGridWrap">
          ${sortedProducts.length ? sortedProducts.map(renderProductCard).join('') : souqEmptyState()}
        </div>
      </div>

      <!-- VIEW PANE 2: MASTER ARTISANS & WORKSHOPS -->
      <div id="paneMasterArtisans" style="display:${activeExhibitionTab==='artisans'?'block':'none'}">
        <div class="results-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:24px;margin-top:20px">
          ${artisans.map(a => renderArtisanCard(a, true)).join('')}
        </div>
      </div>
    </div>`;
}

// Re-fetch and repaint ONLY the products grid (search/filter/sort live update,
// without re-rendering the whole page so the search input keeps focus).
async function refreshSouqProductsGrid() {
  const gridWrap = document.getElementById('productsGridWrap');
  if (!gridWrap) return;
  // Skeleton cards appear only when the fetch is actually slow (>120ms),
  // so instant local data never flashes a loading state.
  let settled = false;
  const skeletonTimer = setTimeout(() => {
    if (!settled) gridWrap.innerHTML = Array.from({ length: 6 }, () => `
      <div class="product-skeleton" aria-hidden="true">
        <div class="sk-img"></div>
        <div class="sk-line"></div>
        <div class="sk-line sk-short"></div>
        <div class="sk-actions"></div>
      </div>`).join('');
  }, 120);
  try {
    const readyProducts = await window.HeritageService.getReadyProducts({
      category: activeProductCategory,
      search: productSearchTerm
    });
    settled = true;
    const sortedProducts = sortReadyProducts(readyProducts);
    gridWrap.innerHTML = sortedProducts.length
      ? sortedProducts.map(renderProductCard).join('')
      : souqEmptyState();
    const tabBtn = document.querySelector('.exhibition-tab[data-ex-tab="products"]');
    if (tabBtn) tabBtn.innerHTML = `${t('tabReadyProducts')} (${readyProducts.length})`;
    const counter = document.getElementById('souqResultsCount');
    if (counter) counter.textContent = `${t('resultsCountLabel')}: ${readyProducts.length}`;
  } finally {
    settled = true;
    clearTimeout(skeletonTimer);
  }
}

// Wire all interactive controls of Souq Misr (exhibition tabs, currency,
// live search, category filters, merchant publish button).
// Every binding is individually guarded, so it is also safe to call on the
// artisan profile page (it only binds the currency pills there).
function setupArtisansPageEvents() {
  // Exhibition tabs: Ready Products / Master Artisans
  const tabs = document.querySelectorAll('.exhibition-tab[data-ex-tab]');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const which = tab.dataset.exTab;
      if (!which || which === activeExhibitionTab) return;
      activeExhibitionTab = which;
      tabs.forEach(tb => tb.classList.toggle('active', tb === tab));
      const paneProducts = document.getElementById('paneReadyProducts');
      const paneArtisans = document.getElementById('paneMasterArtisans');
      if (paneProducts) paneProducts.style.display = which === 'products' ? 'block' : 'none';
      if (paneArtisans) paneArtisans.style.display = which === 'artisans' ? 'block' : 'none';
      horusExcited();
    });
  });

  // Currency pills (EGP / USD / dual)
  document.querySelectorAll('.currency-pill[data-currency]').forEach(btn => {
    btn.addEventListener('click', () => setCurrency(btn.dataset.currency));
  });

  // Live product search (debounced; input is outside the repainted grid,
  // so focus and caret position are preserved while typing)
  const searchInput = document.getElementById('productSearchInput');
  if (searchInput) {
    let debounceTimer = null;
    searchInput.addEventListener('input', () => {
      productSearchTerm = searchInput.value;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(refreshSouqProductsGrid, 250);
    });
  }

  // Category filter pills
  const pills = document.querySelectorAll('.prod-filter-pill[data-prod-cat]');
  pills.forEach(btn => {
    btn.addEventListener('click', () => {
      activeProductCategory = btn.dataset.prodCat || 'all';
      pills.forEach(p => p.classList.toggle('active', p === btn));
      refreshSouqProductsGrid();
    });
  });

  // Sort dropdown (recommended / price / rating)
  const sortSelect = document.getElementById('productSortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      activeProductSort = sortSelect.value;
      refreshSouqProductsGrid();
    });
  }

  // Merchant "publish new product" button
  const addBtn = document.querySelector('.btn-open-add-product');
  if (addBtn) addBtn.addEventListener('click', openAddProductModal);
}

function renderProductCard(p) {
  const iconMap = {
    'copper': '🏺',
    'palm': '🧺',
    'arabesque': '🪵',
    'pottery': '🏺',
    'alabaster': '🗿',
    'textiles': '🧵',
    'lanterns-boats': '⛵'
  };
  const icon = iconMap[p.category] || '🏺';
  const cleanTitle = (p.title || '').replace(/"/g, '&quot;');
  const imgUrl = p.image || 'assets/category-craft.webp';

  return `
    <div class="product-card">
      <div class="product-card-top" style="background: linear-gradient(180deg, rgba(14,30,56,0.35) 0%, rgba(14,30,56,0.85) 100%), url('${imgUrl}'); background-size: cover; background-position: center;">
        <div class="product-badge-row">
          <span class="badge-ready">⚡ ${t('readyToShip')}</span>
          <span class="badge-ship">✈️ ${t('worldwideShipping')}</span>
        </div>
        <div class="product-visual">
          <span class="product-craft-icon">${icon}</span>
          <span class="product-craft-tag">${p.craftName}</span>
        </div>
      </div>
      <div class="product-card-body">
        <h3 class="product-title" title="${cleanTitle}">${p.title}</h3>
        <div class="product-workshop">📍 ${p.provinceName} — ${p.artisanWorkshop}</div>
        <div class="product-artisan-line">
          <span>${t('madeBy')}</span>
          <a href="#artisan/${p.artisanId}" class="artisan-author-link">${p.artisanName}</a>
          <span class="artisan-rating-pill">★ ${p.artisanRating}</span>
        </div>
        <div class="product-price-row">
          ${formatDualPrice(p.priceEgp)}
        </div>
        <div class="product-actions">
          <button type="button" class="primary btn-buy-instant" data-artisan-id="${p.artisanId}" data-item-title="${cleanTitle}" data-item-price="${p.priceEgp}">
            ${t('instantBuy')}
          </button>
          <button type="button" class="pill btn-open-chat" data-artisan-id="${p.artisanId}" data-item-title="${cleanTitle}" data-item-price="${p.priceEgp}">
            💬 ${t('chatWithArtisan')}
          </button>
        </div>
      </div>
    </div>`;
}

function renderArtisanCard(a, fullView=false) {
  return `
    <div class="artisan-card" style="background:var(--paper);border:1px solid var(--line);border-radius:18px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 24px rgba(0,0,0,0.06);border-top:4px solid var(--gold)">
      <div style="padding:20px;border-bottom:1px solid var(--line)">
        <div style="display:flex;gap:14px;align-items:center">
          <div style="width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#0f2147,#123d42);display:flex;align-items:center;justify-content:center;border:2px solid var(--gold);flex-shrink:0;color:#ffe89a;font-size:28px">⚒️</div>
          <div>
            <div style="display:flex;align-items:center;gap:6px">
              <h3 style="margin:0;font-size:17px;color:var(--ink)">${a.name}</h3>
              <span title="${t('verifiedArtisan')}" style="color:var(--teal)">✓</span>
            </div>
            <small style="color:var(--muted);display:block">${a.craftName} • ${a.provinceName}</small>
            <div style="display:flex;gap:8px;align-items:center;margin-top:4px">
              <span style="color:#d4af37;font-size:13px">★ ${a.rating}</span>
              <span style="font-size:11px;color:var(--muted)">(${a.experienceYears} ${t('yearsExp')})</span>
            </div>
          </div>
        </div>
      </div>
      <div style="padding:20px;flex:1;display:flex;flex-direction:column;justify-content:space-between">
        <div>
          <p style="font-size:12.5px;line-height:1.6;color:var(--ink);margin:0 0 12px">${a.bio}</p>
          <div style="font-size:12px;color:var(--muted);margin-bottom:14px">
            <strong>📍 ${t('workshopLocation')}</strong> ${a.workshop}
          </div>
          ${a.readyItems&&a.readyItems.length?`
            <div style="background:rgba(0,0,0,0.02);border:1px solid var(--line);border-radius:10px;padding:12px;margin-bottom:16px">
              <strong style="font-size:12px;color:var(--teal);display:block;margin-bottom:6px">🏺 ${t('readyItems')}</strong>
              ${a.readyItems.slice(0,3).map(item=>`<div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;padding:5px 0;border-bottom:1px dashed var(--line)">
                <span style="color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-right:8px">${item.title}</span>
                <strong style="color:var(--gold);white-space:nowrap">${formatDualPrice(item.price)}</strong>
              </div>`).join('')}
            </div>`:''}
        </div>
        <div style="display:flex;gap:8px;flex-direction:column">
          <a href="#artisan/${a.id}" class="primary" style="width:100%;display:flex;align-items:center;justify-content:center;gap:6px;text-align:center">
            <span>👤</span><span>${t('viewProfile')}</span>
          </a>
          <button class="pill btn-open-chat" data-artisan-id="${a.id}" style="width:100%;display:flex;align-items:center;justify-content:center;gap:6px;border-color:var(--gold)">
            <span>💬</span><span>${t('chatWithArtisan')}</span>
          </button>
        </div>
      </div>
    </div>`;
}

// Artisan Profile Page
async function artisanProfilePage(id) {
  const a = await window.HeritageService.getArtisanById(id);
  if (!a) return `<div class="page"><h1>${t('craftNotFound')}</h1><a href="#artisans" class="primary">${t('allArtisans')}</a></div>`;
  return `
    <div class="page">
      ${crumb(`<a href="#artisans">${t('navArtisans')}</a> / ${a.name}`)}
      <div class="detail-top"><div>
        <span class="eyebrow">${a.craftName} • ${a.provinceName}</span>
        <h1>${a.name} <span style="color:var(--teal);font-size:20px">✓</span></h1>
        <p class="sub">${a.bio}</p>
        <div style="display:flex;gap:12px;align-items:center;margin-top:12px;flex-wrap:wrap">
          <span class="badge">★ ${a.rating}</span>
          <span class="badge" style="background:var(--teal);color:#fff">${a.experienceYears} ${t('yearsExp')}</span>
          <span class="badge">${t('verifiedBadge')}</span>
        </div>
      </div>
      ${a.image ? `
      <div style="width:230px;max-width:40%;flex-shrink:0;border:3px solid var(--gold);border-radius:18px;overflow:hidden;box-shadow:var(--shadow);align-self:center">
        <img src="${a.image}" alt="${esc((a.craftName||'') + ' — ' + (a.name||''))}" loading="lazy" decoding="async" style="display:block;width:100%;aspect-ratio:4/3;object-fit:cover">
      </div>` : `
      <div style="width:120px;height:120px;border-radius:50%;background:linear-gradient(135deg,#0f2147,#123d42);display:flex;align-items:center;justify-content:center;border:3px solid var(--gold);color:#ffe89a;font-size:52px;flex-shrink:0">⚒️</div>
      `}
      </div>

      <div class="currency-switcher-bar" style="margin:20px 0">
        <div class="currency-label-wrap">
          <span class="currency-icon">💱</span>
          <strong>${t('currencySwitcherLabel')}:</strong>
        </div>
        <div class="currency-toggle-group">
          <button type="button" class="currency-pill ${currentCurrency==='dual'?'active':''}" data-currency="dual">${t('currDual')}</button>
          <button type="button" class="currency-pill ${currentCurrency==='egp'?'active':''}" data-currency="egp">${t('currEgp')}</button>
          <button type="button" class="currency-pill ${currentCurrency==='usd'?'active':''}" data-currency="usd">${t('currUsd')}</button>
        </div>
      </div>

      <div class="detail-grid">
        <article class="article">
          <section><h2>📍 ${t('workshopLocation')}</h2><p>${a.workshop}</p></section>
          ${a.readyItems&&a.readyItems.length?`
            <section><h2>🏺 ${t('readyItems')}</h2>
              <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px;margin-top:16px">
                ${a.readyItems.map(item=>`
                  <div style="background:var(--paper);border:1px solid var(--line);border-radius:14px;padding:0;display:flex;flex-direction:column;overflow:hidden">
                    <img src="${item.image || a.image || 'assets/category-craft.webp'}" alt="${esc(item.title||'')}" loading="lazy" decoding="async" style="display:block;width:100%;aspect-ratio:16/10;object-fit:cover;background:var(--bg)">
                    <div style="padding:16px;display:flex;flex-direction:column;gap:8px;flex:1">
                      <h3 style="margin:0;font-size:16px">${item.title}</h3>
                      <div style="font-size:18px;font-weight:bold;color:var(--gold)">${formatDualPrice(item.price)}</div>
                      <button class="primary btn-buy-instant" data-artisan-id="${a.id}" data-item-title="${(item.title||'').replace(/"/g, '&quot;')}" data-item-price="${item.price}" style="margin-top:auto">${t('instantBuy')}</button>
                    </div>
                  </div>`).join('')}
              </div>
            </section>`:''}
          <section>
            <div class="ehky-protection-tag" style="border-radius:12px;margin-top:20px;border:1px solid var(--gold)">
              🛡️ <strong>${t('fairPriceGuarantee')}</strong> — ${t('fairPriceDesc')}
            </div>
          </section>
        </article>
        <aside class="facts">
          <h3>${t('documentationCard')}</h3>
          <dl>
            <dt>${t('province')}</dt><dd>${a.provinceName}</dd>
            <dt>${t('regions')}</dt><dd>${a.workshop}</dd>
            <dt>${t('status')}</dt><dd><span style="color:var(--teal);font-weight:bold">${t('verifiedBadge')}</span></dd>
            <dt>${t('buyerProtection')}</dt><dd style="color:var(--gold);font-weight:bold">🛡️ ${t('escrowSecured')}</dd>
          </dl>
          <button class="primary btn-open-chat" data-artisan-id="${a.id}" style="margin-top:16px;width:100%">💬 ${t('openChat')}</button>
          <button class="pill btn-order-commission" data-artisan-id="${a.id}" style="margin-top:8px;width:100%;border-color:var(--gold)">🛡️ ${t('bookOrder')}</button>
        </aside>
      </div>
    </div>`;
}

// -----------------------------------------------------------------------------
// 7. ARTISAN ORDER CHAT & 8. CHECKOUT MODALS
// -----------------------------------------------------------------------------
function openArtisanChatModal(artisanId, product = null) {
  window.HeritageService.getArtisanById(artisanId).then(artisan => {
    if (!artisan) return;
    let existing = document.getElementById('artisanChatModal');
    if (existing) existing.remove();

    const cleanProdTitle = product ? (product.title || '').replace(/"/g, '&quot;') : null;
    const initialGreeting = product 
      ? `أهلاً بك يا فندم! بخصوص استفسارك عن "${product.title}" المصنوعة يدوياً في ورشتنا، القطعة متوفرة حالياً وجاهزة للشحن الفوري. هل تود حجزها بالدفع الآمن أو الاستفسار عن مقاسات وتفاصيل خاصة؟`
      : t('artisanGreeting');

    const modal = document.createElement('div');
    modal.id = 'artisanChatModal';
    modal.className = 'ehky-modal-backdrop';
    modal.innerHTML = `
      <div class="ehky-modal-card" style="width:480px;max-width:calc(100vw - 32px)">
        <div class="ehky-modal-header">
          <div style="display:flex;gap:12px;align-items:center">
            <div style="width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#0f2147,#123d42);display:flex;align-items:center;justify-content:center;border:2px solid var(--gold);color:#ffe89a;font-size:20px">⚒️</div>
            <div>
              <strong style="display:block;font-size:15px;color:var(--ink)">${artisan.name} <span style="color:var(--teal)">✓</span></strong>
              <small style="color:var(--muted)">${artisan.craftName} • ${artisan.workshop}</small>
            </div>
          </div>
          <button class="ehky-modal-close" id="closeArtisanChat">×</button>
        </div>

        ${product ? `
          <div class="chat-product-preview-bar" style="background:rgba(212,175,55,0.1);border:1px solid var(--gold);padding:10px 14px;margin:12px 16px 0;border-radius:12px;display:flex;justify-content:space-between;align-items:center;gap:10px">
            <div style="display:flex;align-items:center;gap:10px;overflow:hidden">
              <span style="font-size:24px;flex-shrink:0">🏺</span>
              <div style="overflow:hidden">
                <strong style="display:block;font-size:13px;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${product.title}</strong>
                <span style="font-size:12px;font-weight:bold;color:var(--gold)">${formatDualPrice(product.priceEgp)}</span>
              </div>
            </div>
            <button type="button" class="primary btn-checkout-from-chat" data-artisan-id="${artisan.id}" data-item-title="${cleanProdTitle}" data-item-price="${product.priceEgp}" style="padding:6px 14px;font-size:12px;white-space:nowrap">
              🛒 ${t('instantBuy')}
            </button>
          </div>
        ` : ''}

        <div class="ehky-protection-tag" style="margin:12px 16px">
          🛡️ <strong>${t('protectionTagTitle')}</strong> — ${t('protectionTagDesc')}
        </div>

        <div class="artisan-chat-body" id="artisanChatMessages" style="height:260px;overflow-y:auto;padding:12px 16px;display:flex;flex-direction:column;gap:10px;background:var(--paper)">
          <div class="artisan-msg from-artisan">
            <p>${initialGreeting}</p>
            <span class="time">${t('now')}</span>
          </div>
        </div>

        <div class="artisan-chat-quick-replies" style="padding:8px 16px;display:flex;gap:6px;overflow-x:auto">
          <button type="button" class="quick-chip" data-msg="${product ? 'هل القطعة متوفرة للشحن الفوري؟' : t('chipCostCustom')}">${product ? 'هل القطعة جاهزة للشحن الفوري؟' : t('chipCostCustom')}</button>
          <button type="button" class="quick-chip" data-msg="${t('chipShipAbroad')}">${t('chipShipAbroad')}</button>
          <button type="button" class="quick-chip" data-msg="${t('chipCustomColors')}">${t('chipCustomColors')}</button>
        </div>

        <div class="artisan-chat-footer" style="padding:12px 16px;border-top:1px solid var(--line);display:flex;gap:8px">
          <input type="text" id="artisanChatInput" placeholder="${t('typeToArtisan')}" style="flex:1;padding:10px 14px;border-radius:10px;border:1px solid var(--line);background:var(--paper);color:var(--ink)">
          <button class="primary" id="btnSendArtisanMsg" style="padding:10px 18px">${t('sendMsg')}</button>
        </div>
      </div>`;

    document.body.appendChild(modal);
    document.getElementById('closeArtisanChat').onclick = () => modal.remove();

    const checkoutBtn = modal.querySelector('.btn-checkout-from-chat');
    if (checkoutBtn) {
      checkoutBtn.onclick = () => {
        modal.remove();
        handleBuyProduct({ artisanId: artisan.id, title: product.title, priceEgp: product.priceEgp });
      };
    }

    const msgBox = document.getElementById('artisanChatMessages');
    const input = document.getElementById('artisanChatInput');
    const send = () => {
      const txt = input.value.trim();
      if (!txt) return;
      const u = document.createElement('div');
      u.className = 'artisan-msg from-user';
      u.innerHTML = `<p>${txt}</p><span class="time">${t('now')}</span>`;
      msgBox.appendChild(u);
      input.value = '';
      msgBox.scrollTop = msgBox.scrollHeight;
      setTimeout(() => {
        const reply = document.createElement('div');
        reply.className = 'artisan-msg from-artisan';
        reply.innerHTML = `<p>${t('artisanAutoReply')} ${artisan.name}! ${t('artisanAutoReplyTail')}</p><span class="time">${t('now')}</span>`;
        msgBox.appendChild(reply);
        msgBox.scrollTop = msgBox.scrollHeight;
      }, 900);
    };

    document.getElementById('btnSendArtisanMsg').onclick = send;
    input.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
    modal.querySelectorAll('.quick-chip').forEach(btn => {
      btn.onclick = () => { input.value = btn.dataset.msg; send(); };
    });
  });
}

function handleBuyProduct(p) {
  if (!isLoggedIn || !currentUser) {
    alert(t('loginRequiredToBuy'));
    openAuthModal(() => {
      window.HeritageService.getArtisanById(p.artisanId).then(a => {
        if (a) openCheckoutModal(a, p.title, p.priceEgp);
      });
    });
    return;
  }
  window.HeritageService.getArtisanById(p.artisanId).then(a => {
    if (a) openCheckoutModal(a, p.title, p.priceEgp);
  });
}

function openCheckoutModal(artisan, itemTitle=null, itemPrice=null) {
  let existing = document.getElementById('checkoutModal');
  if (existing) existing.remove();
  const title = itemTitle || (artisan.readyItems&&artisan.readyItems[0]?artisan.readyItems[0].title:`${t('customCommission')} — ${artisan.craftName}`);
  const price = itemPrice || (artisan.readyItems&&artisan.readyItems[0]?artisan.readyItems[0].price:650);
  const priceUsd = Math.round(price / 50);

  const modal = document.createElement('div');
  modal.id = 'checkoutModal';
  modal.className = 'ehky-modal-backdrop';
  modal.innerHTML = `
    <div class="ehky-modal-card checkout-modal-card">
      <div class="ehky-modal-header">
        <div>
          <strong style="display:block;font-size:18px">🛡️ ${t('checkoutTitle')}</strong>
          <small style="color:var(--muted)">${t('checkoutSubtitle')}</small>
        </div>
        <button class="ehky-modal-close" id="closeCheckout">×</button>
      </div>

      <div class="order-summary-box" style="background:rgba(212,175,55,0.08);border:1px solid var(--gold);padding:16px;border-radius:12px;margin:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
          <div>
            <strong style="display:block;font-size:14.5px;color:var(--ink)">${title}</strong>
            <small style="color:var(--muted)">${artisan.name} • ${artisan.workshop}</small>
          </div>
          <div style="text-align:right">
            <div style="font-size:20px;font-weight:bold;color:var(--gold)">${formatDualPrice(price)}</div>
            <small style="color:var(--muted);font-size:11px;display:block">1$ ≈ 50 EGP</small>
          </div>
        </div>
      </div>

      <div class="ehky-protection-tag" style="background:#e8f5e9;border-color:#4caf50;color:#2e7d32">
        ✓ <strong>${t('guaranteeNotice')}</strong> · ${t('worldwideShipping')}
      </div>

      <div style="background:rgba(179,38,30,0.08);border:1px solid #b3261e;padding:8px 14px;border-radius:10px;margin:10px 16px 0;text-align:center;font-size:12px;color:#b3261e;font-weight:bold">
        ${t('demoModeNotice')}
      </div>

      <div class="payment-tabs" style="display:flex;gap:8px;margin:18px 16px 0;border-bottom:2px solid var(--line);padding-bottom:8px;flex-wrap:wrap">
        <button class="payment-tab-btn active" id="tabBtnCard" type="button">${t('internationalCardTab')}</button>
        <button class="payment-tab-btn" id="tabBtnVodafone" type="button">📱 ${t('vodafoneTab')}</button>
        <button class="payment-tab-btn" id="tabBtnPaypal" type="button">${t('paypalTab')}</button>
      </div>

      <!-- PANE 1: CARD (EGP / USD) -->
      <form id="paymentCardForm" class="payment-pane active">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-row">
            <label>${t('currencySwitcherLabel')}</label>
            <select id="checkoutCurrencySelect" style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--line);background:var(--paper);color:var(--ink)">
              <option value="egp" ${currentCurrency==='egp'?'selected':''}>${price} EGP (ج.م مصري)</option>
              <option value="usd" ${currentCurrency==='usd'?'selected':''}>$${priceUsd} USD (دولار أمريكي)</option>
            </select>
          </div>
          <div class="form-row"><label>${t('cardHolder')}</label><input type="text" id="chkCardHolder" required placeholder="Full Name" value="${(currentUser&&currentUser.name)||''}"></div>
        </div>
        <div class="form-row"><label>${t('cardNumber')}</label><input type="text" placeholder="xxxx xxxx xxxx xxxx" maxlength="19" required value="4242 •••• •••• 4242"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-row"><label>${t('cardExpiry')}</label><input type="text" placeholder="MM/YY" maxlength="5" required value="12/28"></div>
          <div class="form-row"><label>${t('cardCvv')}</label><input type="password" placeholder="***" maxlength="3" required value="888"></div>
        </div>
        <div class="form-row"><label>${t('deliveryAddress')}</label><input type="text" id="chkDeliveryAddress" placeholder="Country, City, Full Address" required value="15 شارع المعز، القاهرة التاريخية"></div>
        <div class="form-row"><label>${t('deliveryPhone')}</label><input type="tel" id="chkDeliveryPhone" placeholder="+20 1xx xxxx xxx" required value="+20 100 123 4567"></div>
        <button type="submit" class="primary" style="width:100%;padding:14px;font-size:16px;margin-top:10px">
          ${t('confirmPayment')} (${price} EGP / $${priceUsd} USD) 🔒
        </button>
      </form>

      <!-- PANE 2: VODAFONE CASH & INSTAPAY -->
      <form id="paymentVodafoneForm" class="payment-pane" style="display:none">
        <div style="background:#fff3e0;border:1px solid #ff9800;padding:14px;border-radius:10px;margin-bottom:15px">
          <strong style="display:block;color:#e65100;font-size:14px">${t('vodafoneSteps')}</strong>
          <ol style="margin:8px 0 0;padding-right:20px;font-size:12.5px;line-height:1.7;color:#bf360c">
            <li>المبلغ المطلوب تحويله: <strong>${price} ج.م</strong></li>
            <li style="font-size:15px;font-weight:bold;color:#d32f2f">رقم المحفظة المعتمدة: 010 2345 6789</li>
            <li>انسخ كود العملية لتأكيد الحجز الفوري</li>
          </ol>
        </div>
        <div class="form-row"><label>${t('vodafoneWallet')}</label><input type="tel" required placeholder="010xxxxxxxx" value="01012345678"></div>
        <div class="form-row"><label>${t('vodafoneTxId')}</label><input type="text" required placeholder="رقم المعاملة / العملية" value="TX-${Math.floor(100000+Math.random()*900000)}"></div>
        <div class="form-row"><label>${t('deliveryAddress')}</label><input type="text" required value="15 شارع المعز، القاهرة"></div>
        <button type="submit" class="primary" style="width:100%;padding:14px;font-size:16px;margin-top:10px;background:#e60000;border-color:#e60000">${t('confirmVodafone')} 🛡️</button>
      </form>

      <!-- PANE 3: PAYPAL / INTERNATIONAL USD -->
      <form id="paymentPaypalForm" class="payment-pane" style="display:none">
        <div style="background:#e3f2fd;border:1px solid #1976d2;padding:14px;border-radius:10px;margin-bottom:15px">
          <strong style="display:block;color:#0d47a1;font-size:14px">🌐 International Escrow Checkout ($ USD)</strong>
          <p style="margin:6px 0 0;font-size:12.5px;line-height:1.6;color:#1565c0">
            Secure international checkout via PayPal / Global Escrow in USD ($${priceUsd} USD). Worldwide insured DHL/FedEx shipping included.
          </p>
        </div>
        <div class="form-row"><label>PayPal Email</label><input type="email" placeholder="name@domain.com" required value="${(currentUser&&currentUser.email)||'tourist@world.com'}"></div>
        <div class="form-row"><label>Destination Country & Postal Code</label><input type="text" placeholder="e.g. Germany, UK, USA, France..." required value="Berlin, Germany (10115)"></div>
        <div class="form-row"><label>${t('deliveryAddress')}</label><input type="text" placeholder="Street, City, Postal Code" required value="Unter den Linden 24, Berlin"></div>
        <button type="submit" class="primary" style="width:100%;padding:14px;font-size:16px;margin-top:10px;background:#0070ba;border-color:#0070ba">
          Pay with PayPal ($${priceUsd} USD) ✈️
        </button>
      </form>

      <div id="checkoutSuccess" style="display:none;text-align:center;padding:30px 10px">
        <div style="font-size:52px;margin-bottom:12px">🎉</div>
        <h3 style="margin:0 0 10px;color:var(--ink);font-size:22px">${t('orderSuccess')}</h3>
        <p style="font-size:13.5px;color:var(--muted);line-height:1.7;max-width:440px;margin:0 auto 20px"></p>
        <button class="primary" id="btnFinishCheckout" style="padding:10px 28px">${t('backToBrowse')}</button>
      </div>
    </div>`;

  document.body.appendChild(modal);
  document.getElementById('closeCheckout').onclick = () => modal.remove();

  const tabCard = document.getElementById('tabBtnCard');
  const tabVoda = document.getElementById('tabBtnVodafone');
  const tabPaypal = document.getElementById('tabBtnPaypal');
  const paneCard = document.getElementById('paymentCardForm');
  const paneVoda = document.getElementById('paymentVodafoneForm');
  const panePaypal = document.getElementById('paymentPaypalForm');
  const successBox = document.getElementById('checkoutSuccess');

  const showPane = (tab, pane) => {
    [tabCard, tabVoda, tabPaypal].forEach(t => t.classList.remove('active'));
    [paneCard, paneVoda, panePaypal].forEach(p => p.style.display = 'none');
    tab.classList.add('active');
    pane.style.display = 'block';
  };

  tabCard.onclick = () => showPane(tabCard, paneCard);
  tabVoda.onclick = () => showPane(tabVoda, paneVoda);
  tabPaypal.onclick = () => showPane(tabPaypal, panePaypal);

  const handleSuccess = (e) => {
    e.preventDefault();
    const orderId = `${Math.floor(100000 + Math.random() * 900000)}`;
    const phoneInput = modal.querySelector('input[type="tel"]');
    const addrInput = modal.querySelector('#chkDeliveryAddress') || modal.querySelector('input[type="text"]');
    const phoneVal = phoneInput ? phoneInput.value : '+20 100 123 4567';
    const addrVal = addrInput ? addrInput.value : 'عنوان التوصيل المسجل';

    const orderRecord = {
      id: orderId,
      date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      buyerName: (currentUser && currentUser.name) || 'عميل سوق مصر',
      buyerEmail: (currentUser && currentUser.email) || 'client@ehky.eg',
      buyerPhone: phoneVal,
      deliveryAddress: addrVal,
      artisanId: artisan.id,
      artisanName: artisan.name,
      artisanWorkshop: artisan.workshop,
      itemTitle: title,
      priceEgp: price,
      priceUsd: Math.round(price / 50),
      currency: (document.getElementById('checkoutCurrencySelect') && document.getElementById('checkoutCurrencySelect').value) || 'egp',
      status: 'processing',
      statusLabel: t('orderStatusProcessing'),
      createdAt: Date.now()
    };

    try {
      const orders = JSON.parse(localStorage.getItem('ehky-orders') || '[]');
      orders.unshift(orderRecord);
      localStorage.setItem('ehky-orders', JSON.stringify(orders));
    } catch(err) {}

    paneCard.style.display = 'none';
    paneVoda.style.display = 'none';
    panePaypal.style.display = 'none';
    tabCard.parentElement.style.display = 'none';
    modal.querySelector('.order-summary-box').style.display = 'none';
    modal.querySelector('.ehky-protection-tag').style.display = 'none';

    successBox.querySelector('p').innerHTML = `
      كود الطلب المعتمد: <strong style="color:var(--gold);font-size:16px">#${orderRecord.id}</strong><br>
      ${artisan.name} — ${title}<br>
      <span style="display:inline-block;margin-top:8px;padding:4px 10px;background:#e8f5e9;color:#2e7d32;border-radius:8px;font-size:12px;font-weight:bold">
        ${t('orderStatusProcessing')}
      </span>
    `;

    // Add Track Order button to successBox
    let trackBtn = successBox.querySelector('#btnTrackFromSuccess');
    if (!trackBtn) {
      trackBtn = document.createElement('button');
      trackBtn.id = 'btnTrackFromSuccess';
      trackBtn.className = 'primary';
      trackBtn.style.cssText = 'padding:10px 22px;margin:10px 6px 0;background:var(--teal);border-color:var(--teal)';
      trackBtn.textContent = '📦 ' + t('trackOrderBtn');
      trackBtn.onclick = () => {
        modal.remove();
        openOrderTrackingModal(orderRecord.id);
      };
      successBox.insertBefore(trackBtn, document.getElementById('btnFinishCheckout'));
    }

    successBox.style.display = 'block';
  };

  paneCard.onsubmit = handleSuccess;
  paneVoda.onsubmit = handleSuccess;
  panePaypal.onsubmit = handleSuccess;
  document.getElementById('btnFinishCheckout').onclick = () => modal.remove();
}


// 9. ABOUT PAGE
// -----------------------------------------------------------------------------
function about() {
  return `
    <div class="page about">
      ${crumb(t('navAbout'))}
      <span class="eyebrow">${t('siteSubtitle')}</span>
      <h1>${t('aboutTitle')}</h1>
      <p>${t('aboutIntro')}</p>
      <h2>${t('aboutPlatformTitle')}</h2>
      <ul>
        <li>${t('aboutPoint1')}</li>
        <li>${t('aboutPoint2')}</li>
        <li>${t('aboutPoint3')}</li>
        <li>${t('aboutPoint4')}</li>
        <li>${t('aboutPoint5')}</li>
      </ul>
      <h2>${t('aboutMapRefsTitle')}</h2>
      <div class="reference-links">
        <a href="assets/boundaries-reference.jpg" target="_blank" rel="noopener noreferrer">${t('aboutMapRefBoundaries')} ↗</a>
        <a href="assets/terrain-reference.jpg" target="_blank" rel="noopener noreferrer">${t('aboutMapRefTerrain')} ↗</a>
      </div>
      <p>${t('aboutMapRefsNote')}</p>
      <a href="#home" class="primary">${t('aboutBackHome')}</a>
    </div>`;
}

// -----------------------------------------------------------------------------
// 10. ROUTER
// -----------------------------------------------------------------------------
async function route() {
  let hash = location.hash.slice(1) || 'home';
  if (hash === 'chat') { if (window.openEhkyChatbot) window.openEhkyChatbot(); return; }
  if (hash === 'heritage') { locality = 'all'; searchTerm = ''; }
  if (hash.startsWith('province/')) { locality = hash.split('/')[1]; category = 'all'; era = 'all'; searchTerm = ''; }

  let routeGroup = 'home';
  if (hash === 'map') routeGroup = 'map';
  else if (hash === 'heritage' || hash.startsWith('province/') || hash.startsWith('record/')) routeGroup = 'heritage';
  else if (hash === 'foods') routeGroup = 'foods';
  else if (hash.startsWith('food/')) routeGroup = 'food';
  else if (hash === 'artisans' || hash.startsWith('artisan/')) routeGroup = 'artisans';
  else if (hash.startsWith('craft/')) routeGroup = 'craft';
  updateHorusGuidance(routeGroup);

  if (hash === 'home') {
    app.innerHTML = home();
  } else if (hash === 'map') {
    app.innerHTML = mapPage();
    updateProvince();
    const si = document.getElementById('provinceSearch');
    if (si) si.addEventListener('input', e => updateProvinceList(e.target.value));
  } else if (hash === 'heritage' || hash.startsWith('province/')) {
    app.innerHTML = heritagePage(hash.startsWith('province/') ? hash.split('/')[1] : null);
    await renderResults();
    const hS = document.getElementById('heritageSearch');
    const hL = document.getElementById('locality');
    const hE = document.getElementById('era');
    if (hS) hS.addEventListener('input', e => { searchTerm = e.target.value; renderResults(); });
    if (hL) hL.addEventListener('change', e => { locality = e.target.value; renderResults(); });
    if (hE) hE.addEventListener('change', e => { era = e.target.value; renderResults(); });
  } else if (hash.startsWith('craft/')) {
    const craftId = hash.split('/')[1] || 'boats';
    app.innerHTML = await craftPage(craftId);
    const askBtn = document.getElementById('askHorusBtn');
    if (askBtn) askBtn.onclick = () => { if (window.openEhkyChatbot) window.openEhkyChatbot(`أخبرني عن حرفة ${craftId}`); };
    const btnH = document.getElementById('btnSourceHybrid');
    const btnY = document.getElementById('btnSourceYt');
    const wrap = document.getElementById('videoEmbedWrapper');
    if (btnH && btnY && wrap) {
      const craft = await window.HeritageService.getCraftDetails(craftId);
      btnH.onclick = () => { activeVideoSource='hybrid'; btnH.classList.add('active'); btnY.classList.remove('active'); wrap.innerHTML=renderVideoElement(craft,'hybrid'); };
      btnY.onclick = () => { activeVideoSource='youtube'; btnY.classList.add('active'); btnH.classList.remove('active'); wrap.innerHTML=renderVideoElement(craft,'youtube'); };
    }
  } else if (hash.startsWith('record/')) {
    const [, recKind, recId] = hash.split('/');
    // The two fully-documented crafts have their own dedicated pages.
    if (recId === 'R000006') { location.hash = 'craft/boats'; return; }
    if (recId === 'R000016') { location.hash = 'craft/copper-engraving'; return; }
    const record = window.HeritageRecords ? window.HeritageRecords.findRecord(recKind, recId) : null;
    app.innerHTML = record
      ? recordPage(record)
      : `<div class="page"><h1>${t('recordNotFound')}</h1><a href="#heritage" class="primary">${t('backToHeritage')}</a></div>`;
  } else if (hash === 'foods') {
    searchTerm = '';
    app.innerHTML = await foodsPage();
    const fS = document.getElementById('foodSearchInput');
    if (fS) fS.addEventListener('input', async(e) => { searchTerm = e.target.value; app.innerHTML = await foodsPage(); });
  } else if (hash.startsWith('food/')) {
    app.innerHTML = await foodDetailPage(hash.split('/')[1]);
    const askBtn = document.getElementById('askHorusBtn');
    if (askBtn) askBtn.onclick = () => { if (window.openEhkyChatbot) window.openEhkyChatbot('ما هي أسرار هذه الأكلة المصرية؟'); };
  } else if (hash === 'artisans' || hash.startsWith('artisans')) {
    if (hash.includes('tab=custom') || hash.includes('tab=artisans')) {
      activeExhibitionTab = 'artisans';
    } else if (hash.includes('tab=products')) {
      activeExhibitionTab = 'products';
    }
    app.innerHTML = await artisansPage();
    setupArtisansPageEvents();
  } else if (hash.startsWith('artisan/')) {
    app.innerHTML = await artisanProfilePage(hash.split('/')[1]);
    setupArtisansPageEvents(); // binds currency pills on the artisan profile too
  } else if (hash === 'about') {
    app.innerHTML = about();
  } else {
    app.innerHTML = home();
  }

  const navBase = hash.startsWith('record/') ? 'heritage' : hash.split('/')[0];
  document.querySelectorAll('nav a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${navBase}`));
  document.title = t('tabTitle');
  window.scrollTo({ top: 0, behavior: 'instant' });
}

// -----------------------------------------------------------------------------
// EVENT DELEGATION
// -----------------------------------------------------------------------------
app.addEventListener('click', e => {
  const p = e.target.closest('[data-prov]');
  if (p) { selectedProvince = p.dataset.prov; if (p.hasAttribute('data-map-prov')) { location.hash='province/'+selectedProvince; } else { updateProvince(); } horusExcited(); return; }

  const zoom = e.target.closest('[data-map-zoom]');
  if (zoom) { mapZoom = zoom.dataset.mapZoom==='reset'?1:Math.max(1,Math.min(2.5,mapZoom+(zoom.dataset.mapZoom==='in'?0.5:-0.5))); const w=document.getElementById('mapWorld'); if(w){if(mapZoom===1)w.style.removeProperty('width');else w.style.width=(mapZoom*100)+'%';} return; }

  // Heritage record video: swap the preview button for the embedded player
  const heritageVideoBtn = e.target.closest('[data-heritage-video]');
  if (heritageVideoBtn) { playHeritageVideo(heritageVideoBtn); return; }

  const r = e.target.closest('[data-route]');
  if (r) { location.hash=r.dataset.route; horusExcited(); return; }

  const c = e.target.closest('[data-cat]');
  if (c) { category=c.dataset.cat; era='all'; location.hash='heritage'; horusExcited(); return; }

  const f = e.target.closest('[data-filter]');
  if (f) { category=f.dataset.filter; renderResults(); return; }

  const ep = e.target.closest('[data-era]');
  if (ep) { era=ep.dataset.era; category='all'; location.hash='heritage'; return; }

  if (e.target.closest('#resetFilters')) { category='all'; locality='all'; era='all'; searchTerm=''; const s=document.getElementById('heritageSearch'); if(s)s.value=''; const er=document.getElementById('era'); if(er)er.value='all'; const lo=document.getElementById('locality'); if(lo)lo.value='all'; renderResults(); return; }

  // Souq empty-state: reset search + category filters
  const clearSouqBtn = e.target.closest('.btn-clear-souq-filters');
  if (clearSouqBtn) {
    productSearchTerm = '';
    activeProductCategory = 'all';
    const si = document.getElementById('productSearchInput');
    if (si) si.value = '';
    document.querySelectorAll('.prod-filter-pill[data-prod-cat]').forEach(p => p.classList.toggle('active', p.dataset.prodCat === 'all'));
    refreshSouqProductsGrid();
    return;
  }

  // Instant buy button (souq grid + artisan profile ready items)
  const buyBtn = e.target.closest('.btn-buy-instant');
  if (buyBtn) {
    handleBuyProduct({
      artisanId: buyBtn.dataset.artisanId,
      title: buyBtn.dataset.itemTitle,
      priceEgp: Number(buyBtn.dataset.itemPrice)
    });
    return;
  }

  const chatBtn = e.target.closest('.btn-open-chat');
  if (chatBtn) {
    const pCard = chatBtn.closest('.product-card');
    let prod = null;
    if (pCard || chatBtn.dataset.itemTitle) {
      prod = {
        title: chatBtn.dataset.itemTitle || (pCard && pCard.querySelector('.product-title') && pCard.querySelector('.product-title').textContent),
        priceEgp: Number(chatBtn.dataset.itemPrice) || 850
      };
    }
    openArtisanChatModal(chatBtn.dataset.artisanId, prod);
    return;
  }

  const orderBtn = e.target.closest('.btn-order-commission');
  if (orderBtn) { window.HeritageService.getArtisanById(orderBtn.dataset.artisanId).then(a=>{if(a)openCheckoutModal(a);}); return; }
});

// Heritage record story contribution form (demo feedback, no backend yet)
app.addEventListener('submit', e => {
  const form = e.target.closest('form[data-story-form]');
  if (!form) return;
  e.preventDefault();
  const feedback = form.querySelector('.demo-feedback');
  if (feedback) { feedback.textContent = t('recordFormFeedback'); feedback.hidden = false; }
});

// Horus pointing on hover
app.addEventListener('pointerover', e => {
  const spot = e.target.closest('[data-map-prov]');
  if (spot && spot.dataset.prov !== selectedProvince) { selectedProvince = spot.dataset.prov; updateProvince(); }
  const interactive = e.target.closest('.hero-action-btn, .route, .cat, .item-card, .food-card, .artisan-card, nav a, .pill, .primary');
  if (interactive) horusPointAt(interactive);
});

// -----------------------------------------------------------------------------
// SETUP
// -----------------------------------------------------------------------------
function setupLanguageSwitcher() {
  const langSelect = document.getElementById('langSelect');
  if (!langSelect) return;
  langSelect.value = currentLang;
  langSelect.addEventListener('change', e => { if (window.I18N) window.I18N.setLanguage(e.target.value); });
  window.addEventListener('ehkyLanguageChanged', async e => {
    currentLang = e.detail.lang;
    if (langSelect) langSelect.value = currentLang;
    if (window.HeritageService) {
      try {
        provincesData = await window.HeritageService.getProvinces();
      } catch (err) {
        console.warn('Failed to refresh provinces on lang change:', err);
      }
    }
    updateAccountUI();
    route();
  });
}

function setupThemeSwitcher() {
  const theme = document.getElementById('theme');
  if (!theme) return;
  try { document.body.classList.toggle('night', localStorage.getItem('ehky-theme') === 'night'); } catch {}
  theme.onclick = () => {
    document.body.classList.toggle('night');
    try { localStorage.setItem('ehky-theme', document.body.classList.contains('night')?'night':'day'); } catch {}
  };
}

function setupMobileNav() {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  if (!toggle || !nav) return;
  toggle.onclick = () => nav.classList.toggle('open');
  nav.addEventListener('click', e => { if (e.target.tagName === 'A') nav.classList.remove('open'); });
}

function setupAccountBtn() {
  const btn = document.getElementById('accountBtn');
  if (btn) {
    btn.onclick = () => {
      if (isLoggedIn && currentUser) {
        openAccountDashboardModal();
      } else {
        openAuthModal();
      }
    };
  }
}

// -----------------------------------------------------------------------------
// INIT
// -----------------------------------------------------------------------------
async function initApp() {
  try {
    if (window.HeritageService) {
      provincesData = await window.HeritageService.getProvinces();
      categoriesData = await window.HeritageService.getCategories();
    }
  } catch (err) { console.warn('[initApp] Data load failed:', err); }

  try { setupLanguageSwitcher(); } catch (e) { console.warn(e); }
  try { setupThemeSwitcher(); } catch (e) { console.warn(e); }
  try { setupMobileNav(); } catch (e) { console.warn(e); }
  try { setupAccountBtn(); } catch (e) { console.warn(e); }
  try { updateAccountUI(); } catch (e) { console.warn(e); }

  window.addEventListener('hashchange', () => { try { route(); } catch (e) { console.error('Route error:', e); } });

  try { await route(); } catch (err) {
    console.error('[initApp] Route failed:', err);
    if (app) app.innerHTML = home();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
