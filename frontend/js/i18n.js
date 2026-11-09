/**
 * ==============================================================================
 * EHKY YA MISR - INTERNATIONALIZATION (i18n) ENGINE
 * Supports: Arabic (ar), English (en), French (fr), Italian (it), German (de)
 * ==============================================================================
 */

(function () {
  'use strict';

  const SUPPORTED_LANGS = ['ar', 'en', 'fr', 'it', 'de'];
  let currentLang = 'ar';
  try {
    currentLang = localStorage.getItem('ehky-lang') || 'ar';
    if (!SUPPORTED_LANGS.includes(currentLang)) currentLang = 'ar';
  } catch {}

  const TRANSLATIONS = {
    ar: {
      siteTitle: 'احكي يا مصر',
      siteSubtitle: 'حكاية من المصريين… ذاكرة للأجيال',
      tagline: 'تراث حي',
      navHome: 'الرئيسية',
      navMap: 'الخريطة',
      navHeritage: 'التراث',
      navFoods: 'الأكلات المصرية',
      navArtisans: 'سوق الحرفيين',
      navAbout: 'عن المشروع',
      loginBtn: 'حسابي / تسجيل',
      roleTourist: 'زائر / سائح',
      roleArtisan: 'حرفي / بائع',
      heroEyebrow: 'مشروع احكي يا مصر · ذاكرة مكان وحكاية إنسان',
      heroTitle: 'اكتشف مصر..',
      heroTitleEm: 'في كل مكان حكاية',
      heroDesc: 'من النيل إلى البحر، ومن الواحات إلى المدن. تعرّف على مصر من خلال ناسها وحرفها وأكلاتها وفنونها، واكتشف حكاياتها المتوارثة.',
      heroSubNotice: 'ثلاث طرق للاكتشاف. ذاكرة واحدة تجمعنا.',
      routeMapTitle: 'استكشف المحافظات',
      routeMapDesc: 'اختار مكاناً على الخريطة، وابدأ رحلتك في تراثه.',
      routeMapGo: 'استكشف الخريطة',
      routeHeritageTitle: 'تصفح التراث',
      routeHeritageDesc: 'حرف وأكلات وفنون وحكايات… اكتشف ما يثير فضولك.',
      routeHeritageGo: 'استعرض التصنيفات',
      routeChatTitle: 'اسأل حورس الحكيم',
      routeChatDesc: 'مرشدك الذكي المتنقل لاكتشاف أسرار المحافظات والحرف.',
      routeChatGo: 'ابدأ المحادثة',
      verifiedBadge: 'سجل موثق ✓',
      videoBadge: 'فيديو توثيقي ▶',
      localVideoBadge: '💻 فيديو محلي فائق الجودة',
      onlineVideoBadge: '🌐 بث يوتيوب',
      catAll: 'الكل',
      catCraft: 'الحرف التقليدية',
      catFood: 'الأكلات الشعبية',
      catMusic: 'الفنون الشعبية',
      catStory: 'الأمثال والحكايات',
      catCustom: 'العادات والتقاليد',
      searchPlaceholder: 'ابحث عن حرفة، أكلة، محافظة…',
      exploreStory: 'اكتشف الحكاية ←',
      orderFromArtisan: 'اطلب قطعتك من الحرفي 🛡️',
      chatWithArtisan: 'شات مباشر مع الصانع',
      mapRestaurantsBtn: 'خريطة أشهر مطاعم الأكلة 📍',
      watchVideo: 'شاهد التوثيق المرئي',
      craftSteps: 'رحلة وخطوات الصنعة',
      materialsUsed: 'الخامات المستخدمة',
      toolsUsed: 'أدوات الصانع',
      province: 'المحافظة',
      regions: 'المناطق والورش',
      status: 'حالة التوثيق',
      dayMode: 'تفعيل الوضع النهاري',
      nightMode: 'تفعيل الوضع الليلي',
      horusTip: 'أنا حورس مرشدك الذكي، اضغط عليّ لمرافقتك في هذه الجولة!'
    },
    en: {
      siteTitle: 'Ehky Ya Misr',
      siteSubtitle: 'Egyptian Stories… A Legacy for Generations',
      tagline: 'Living Heritage',
      navHome: 'Home',
      navMap: 'Map',
      navHeritage: 'Heritage',
      navFoods: 'Traditional Foods',
      navArtisans: 'Artisans Market',
      navAbout: 'About',
      loginBtn: 'My Account / Sign In',
      roleTourist: 'Tourist / Buyer',
      roleArtisan: 'Master Artisan / Seller',
      heroEyebrow: 'Ehky Ya Misr Project · A Place Memory & Human Story',
      heroTitle: 'Discover Egypt..',
      heroTitleEm: 'A Story in Every Place',
      heroDesc: 'From the Nile to the seas, and from desert oases to ancient cities. Experience authentic Egypt through its people, crafts, foods, and living heritage.',
      heroSubNotice: 'Three ways to explore. One shared living memory.',
      routeMapTitle: 'Explore Governorates',
      routeMapDesc: 'Pick a location on the interactive map and begin your journey.',
      routeMapGo: 'Explore Map',
      routeHeritageTitle: 'Browse Heritage',
      routeHeritageDesc: 'Crafts, culinary arts, music and oral tales that inspire.',
      routeHeritageGo: 'View Categories',
      routeChatTitle: 'Ask Horus the Guide',
      routeChatDesc: 'Your intelligent animated companion exploring Egypt with you.',
      routeChatGo: 'Start Chat',
      verifiedBadge: 'Verified Record ✓',
      videoBadge: 'Documentary Video ▶',
      localVideoBadge: '💻 HD Local Video (Offline)',
      onlineVideoBadge: '🌐 YouTube Stream',
      catAll: 'All',
      catCraft: 'Traditional Crafts',
      catFood: 'Traditional Foods',
      catMusic: 'Folk Arts & Music',
      catStory: 'Tales & Proverbs',
      catCustom: 'Traditions & Customs',
      searchPlaceholder: 'Search for craft, food, governorate…',
      exploreStory: 'Explore Story →',
      orderFromArtisan: 'Order Piece from Artisan 🛡️',
      chatWithArtisan: 'Direct Chat with Craftsman',
      mapRestaurantsBtn: 'Google Maps: Top Traditional Eateries 📍',
      watchVideo: 'Watch Visual Documentary',
      craftSteps: 'Crafting Journey & Steps',
      materialsUsed: 'Materials Used',
      toolsUsed: 'Craftsman Tools',
      province: 'Governorate',
      regions: 'Districts & Workshops',
      status: 'Documentation Status',
      dayMode: 'Enable Day Mode',
      nightMode: 'Enable Night Mode',
      horusTip: 'I am Horus, your royal guide! Click me anytime to ask questions.'
    },
    fr: {
      siteTitle: 'Ehky Ya Misr',
      siteSubtitle: 'Mémoire Vivante de l’Égypte… Un Héritage Éternel',
      tagline: 'Patrimoine Vivant',
      navHome: 'Accueil',
      navMap: 'Carte',
      navHeritage: 'Patrimoine',
      navFoods: 'Cuisine Traditionnelle',
      navArtisans: 'Marché Artisanal',
      navAbout: 'À Propos',
      loginBtn: 'Mon Compte / Connexion',
      roleTourist: 'Touriste / Acheteur',
      roleArtisan: 'Maître Artisan / Vendeur',
      heroEyebrow: 'Projet Ehky Ya Misr · La Mémoire du Lieu et de l’Homme',
      heroTitle: 'Découvrez l’Égypte..',
      heroTitleEm: 'Une histoire en chaque lieu',
      heroDesc: 'Du Nil aux mers, des oasis aux cités millénaires. Vivez l’Égypte authentique à travers ses artisans, ses saveurs et ses traditions.',
      heroSubNotice: 'Trois façons d’explorer. Une même mémoire vivante.',
      routeMapTitle: 'Explorer les Régions',
      routeMapDesc: 'Choisissez un gouvernorat sur la carte et commencez votre voyage.',
      routeMapGo: 'Explorer la Carte',
      routeHeritageTitle: 'Parcourir le Patrimoine',
      routeHeritageDesc: 'Artisanat, gastronomie, musiques et légendes ancestrales.',
      routeHeritageGo: 'Voir Catégories',
      routeChatTitle: 'Demander à Horus',
      routeChatDesc: 'Votre guide royal intelligent et interactif.',
      routeChatGo: 'Discuter avec Horus',
      verifiedBadge: 'Certifié Conforme ✓',
      videoBadge: 'Documentaire Vidéo ▶',
      localVideoBadge: '💻 Vidéo HD Locale (Hors-ligne)',
      onlineVideoBadge: '🌐 Diffusion YouTube',
      catAll: 'Tout',
      catCraft: 'Artisanat d’Art',
      catFood: 'Cuisine Populaire',
      catMusic: 'Arts & Musique',
      catStory: 'Contes & Dictons',
      catCustom: 'Us & Coutumes',
      searchPlaceholder: 'Rechercher un métier, un plat, une région…',
      exploreStory: 'Découvrir l’Histoire →',
      orderFromArtisan: 'Commander auprès de l’Artisan 🛡️',
      chatWithArtisan: 'Chat Direct avec le Créateur',
      mapRestaurantsBtn: 'Carte Google Maps : Restaurants Typiques 📍',
      watchVideo: 'Visionner le Documentaire',
      craftSteps: 'Étapes de Fabrication',
      materialsUsed: 'Matières Premières',
      toolsUsed: 'Outils de l’Artisan',
      province: 'Gouvernorat',
      regions: 'Quartiers & Ateliers',
      status: 'Statut de Documentation',
      dayMode: 'Mode Jour',
      nightMode: 'Mode Nuit',
      horusTip: 'Je suis Horus, votre guide royal ! Cliquez pour me poser vos questions.'
    },
    it: {
      siteTitle: 'Ehky Ya Misr',
      siteSubtitle: 'Storie d’Egitto… Memoria per le Generazioni',
      tagline: 'Patrimonio Vivente',
      navHome: 'Home',
      navMap: 'Mappa',
      navHeritage: 'Patrimonio',
      navFoods: 'Cucina Tradizionale',
      navArtisans: 'Mercato Artigiano',
      navAbout: 'Chi Siamo',
      loginBtn: 'Mio Account / Accedi',
      roleTourist: 'Turista / Acquirente',
      roleArtisan: 'Mastro Artigiano / Venditore',
      heroEyebrow: 'Progetto Ehky Ya Misr · Memoria del Luogo e dell’Uomo',
      heroTitle: 'Scopri l’Egitto..',
      heroTitleEm: 'Una storia in ogni angolo',
      heroDesc: 'Dal Nilo ai mari, dalle oasi alle città millenarie. Vivi l’Egitto autentico attraverso le sue genti, arti, sapori e tradizioni.',
      heroSubNotice: 'Tre modi di esplorare. Un’unica memoria condivisa.',
      routeMapTitle: 'Esplora i Governatorati',
      routeMapDesc: 'Scegli un luogo sulla mappa interattiva e inizia il viaggio.',
      routeMapGo: 'Apri la Mappa',
      routeHeritageTitle: 'Sfoglia il Patrimonio',
      routeHeritageDesc: 'Artigianato, gastronomia, musica e racconti popolari.',
      routeHeritageGo: 'Categorie',
      routeChatTitle: 'Chiedi a Horus',
      routeChatDesc: 'La tua guida reale animata per scoprire ogni segreto.',
      routeChatGo: 'Avvia Chat',
      verifiedBadge: 'Registrato e Verificato ✓',
      videoBadge: 'Video Documentario ▶',
      localVideoBadge: '💻 Video HD Locale (Offline)',
      onlineVideoBadge: '🌐 Streaming YouTube',
      catAll: 'Tutto',
      catCraft: 'Artigianato Tradizionale',
      catFood: 'Cucina Tipica',
      catMusic: 'Musica Popolare',
      catStory: 'Racconti & Proverbi',
      catCustom: 'Usi & Tradizioni',
      searchPlaceholder: 'Cerca mestiere, piatto, regione…',
      exploreStory: 'Scopri la Storia →',
      orderFromArtisan: 'Ordina dall’Artigiano 🛡️',
      chatWithArtisan: 'Chat Diretta con il Maestro',
      mapRestaurantsBtn: 'Google Maps: Dove Mangiare Tipico 📍',
      watchVideo: 'Guarda il Video Documentario',
      craftSteps: 'Fasi di Lavorazione',
      materialsUsed: 'Materiali Utilizzati',
      toolsUsed: 'Attrezzi del Mestiere',
      province: 'Governatorato',
      regions: 'Distretti & Laboratori',
      status: 'Stato di Certificazione',
      dayMode: 'Modalità Giorno',
      nightMode: 'Modalità Notte',
      horusTip: 'Sono Horus, la tua guida reale! Clicca per chiedermi qualsiasi curiosità.'
    },
    de: {
      siteTitle: 'Ehky Ya Misr',
      siteSubtitle: 'Ägyptens Geschichten… Ein lebendiges Erbe',
      tagline: 'Lebendiges Erbe',
      navHome: 'Startseite',
      navMap: 'Karte',
      navHeritage: 'Kulturerbe',
      navFoods: 'Traditionelle Küche',
      navArtisans: 'Handwerkermarkt',
      navAbout: 'Über uns',
      loginBtn: 'Mein Konto / Anmelden',
      roleTourist: 'Tourist / Käufer',
      roleArtisan: 'Meisterhandwerker / Verkäufer',
      heroEyebrow: 'Projekt Ehky Ya Misr · Erinnerung an Ort und Mensch',
      heroTitle: 'Entdecke Ägypten..',
      heroTitleEm: 'Eine Geschichte an jedem Ort',
      heroDesc: 'Vom Nil bis zu den Meeren, von Oasen bis zu historischen Metropolen. Erleben Sie das echte Ägypten durch Menschen, Handwerk und Kulinarik.',
      heroSubNotice: 'Drei Wege zur Entdeckung. Ein gemeinsames Erbe.',
      routeMapTitle: 'Gouvernements erkunden',
      routeMapDesc: 'Wähle einen Ort auf der Karte und beginne deine Reise.',
      routeMapGo: 'Karte öffnen',
      routeHeritageTitle: 'Kulturerbe durchstöbern',
      routeHeritageDesc: 'Handwerkskunst, Kulinarik, Musik und überlieferte Legenden.',
      routeHeritageGo: 'Kategorien ansehen',
      routeChatTitle: 'Frag Horus',
      routeChatDesc: 'Dein königlicher animierter Reisebegleiter.',
      routeChatGo: 'Chat starten',
      verifiedBadge: 'Verifizierter Datensatz ✓',
      videoBadge: 'Dokumentarfilm ▶',
      localVideoBadge: '💻 Lokales HD-Video (Offline)',
      onlineVideoBadge: '🌐 YouTube-Stream',
      catAll: 'Alle',
      catCraft: 'Traditionelles Handwerk',
      catFood: 'Traditionelle Küche',
      catMusic: 'Volkskunst & Musik',
      catStory: 'Märchen & Sprichwörter',
      catCustom: 'Bräuche & Traditionen',
      searchPlaceholder: 'Handwerk, Gericht oder Region suchen…',
      exploreStory: 'Geschichte entdecken →',
      orderFromArtisan: 'Beim Handwerker bestellen 🛡️',
      chatWithArtisan: 'Direkter Chat mit dem Handwerker',
      mapRestaurantsBtn: 'Google Maps: Traditionelle Lokale 📍',
      watchVideo: 'Dokumentation ansehen',
      craftSteps: 'Herstellungsschritte',
      materialsUsed: 'Verwendete Materialien',
      toolsUsed: 'Werkzeuge des Meisters',
      province: 'Gouvernement',
      regions: 'Bezirke & Werkstätten',
      status: 'Dokumentationsstatus',
      dayMode: 'Tagmodus aktivieren',
      nightMode: 'Nachtmodus aktivieren',
      horusTip: 'Ich bin Horus, dein königlicher Führer! Klicke auf mich, um Fragen zu stellen.'
    }
  };

  function applyLanguage(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) lang = 'ar';
    currentLang = lang;
    try {
      localStorage.setItem('ehky-lang', lang);
    } catch {}

    const isRtl = lang === 'ar';
    document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
    document.body.classList.toggle('lang-ltr', !isRtl);

    window.dispatchEvent(new CustomEvent('ehkyLanguageChanged', { detail: { lang } }));
  }

  // Initialize
  applyLanguage(currentLang);

  window.I18N = {
    get current() {
      return currentLang;
    },
    get isRtl() {
      return currentLang === 'ar';
    },
    t(key) {
      const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.ar;
      return dict[key] || TRANSLATIONS.ar[key] || key;
    },
    setLanguage(lang) {
      applyLanguage(lang);
    },
    getSupported() {
      return [
        { code: 'ar', label: 'العربية', flag: '🇪🇬' },
        { code: 'en', label: 'English', flag: '🇬🇧' },
        { code: 'fr', label: 'Français', flag: '🇫🇷' },
        { code: 'it', label: 'Italiano', flag: '🇮🇹' },
        { code: 'de', label: 'Deutsch', flag: '🇩🇪' }
      ];
    }
  };
})();

