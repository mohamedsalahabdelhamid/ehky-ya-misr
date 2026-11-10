# 🏛️ مشروع احكي يا مصر (Ehky Ya Misr)
### المعمارية المنفصلة: Frontend & Backend Architecture

نسخة مطورة ومقسمة معمارياً لمشروع **«احكي يا مصر — مصر في ذاكرة المستقبل»**.
تم تصميم هذه النسخة لتلبية متطلبات العمل الجماعي والتوسع المستقبلي:
1. **Frontend مستقل تماماً:** يمكن تشغيله وتجربته فوراً وبشكل محلي بدون تشغيل أي سيرفر أو كتابة أوامر بايثون.
2. **مكون شات بوت فرعوني مستقل (حكيم مصر):** بكود وملفات معزولة تماماً في مجلد خاص، جاهز لتسليمه لفريق الذكاء الاصطناعي وربطه فور انتهائهم.
3. **طبقة خدمة بيانات مهيأة لقاعدة البيانات:** تسمح لفريق قاعدة البيانات بربط الـ API الخاص بهم بتغيير سطر واحد فقط دون المساس بالواجهة.
4. **Backend REST API جاهز:** هيكل Node.js Express منظم يحتوي على Controllers و Routes و Endpoints قياسية.
5. **وضع ذكي أوفلاين/أونلاين:** الموقع يكتشف طريقة تشغيله ويختار مصدر البيانات والفيديو المناسب تلقائياً (انظر أدناه).

---

## 📂 الهيكل المعماري للمشروع (Project Structure):

```text
ehky-ya-misr/
├── frontend/                           # 🌐 واجهة المستخدم (مستقلة وخفيفة)
│   ├── index.html                      # الصفحة الرئيسية (يمكن فتحها مباشرة بالمتصفح)
│   ├── css/
│   │   └── style.css                   # تنسيقات الواجهة، الخريطة، والوضع الليلي
│   ├── js/
│   │   ├── app.js                      # منطق التطبيق والتنقل وعرض الصفحات والسوق
│   │   ├── i18n.js                     # محرك الترجمة (5 لغات: عربي/إنجليزي/فرنسي/إيطالي/ألماني)
│   │   ├── scenes.js                   # معالم الـ 27 محافظة وتبديل المشاهد
│   │   ├── motion.js                   # المؤثرات البصرية وتأثيرات الإضاءة
│   │   └── services/
│   │       ├── heritageService.js      # طبقة البيانات (وضع أوفلاين/أونلاين ذكي + Fallback)
│   │       ├── heritageTranslations.js # ترجمات البيانات للـ 5 لغات
│   │       └── DATABASE_INTEGRATION.md  # دليل فريق الداتا بيز
│   ├── components/
│   │   └── chatbot/                    # 🤖 مكوّن الشات بوت الفرعوني المستقل
│   │       ├── chatbot.js              # منطق المحادثة والربط السحابي
│   │       ├── chatbot.css             # التصميم الفرعوني الأنيق
│   │       ├── horus.css               # تصميم شخصية حورس ثلاثية الأبعاد
│   │       └── README.md               # دليل فريق الشات بوت
│   ├── assets/                         # الصور والمجسمات وأفاتار الفرعون الملكي
│   └── local_videos/                   # فيديوهات HD محلية (لا ترفع للـ git)
│
├── backend/                            # ⚙️ خادم الـ API (جاهز للتشغيل عند الحاجة)
│   ├── server.js                       # مدخل سيرفر Express
│   ├── package.json                    # إعدادات الحزم
│   ├── .env.example                    # متغيرات البيئة
│   ├── routes/                         # مسارات الـ API (provinces, heritage, foods, artisans, chat)
│   ├── controllers/                    # وحدات التحكم بمعالجة الطلبات
│   └── data/                          # بيانات بصيغة JSON (تُستبدل بقاعدة البيانات لاحقاً)
│
├── render.yaml                         # 🚀 إعداد النشر التلقائي على Render
├── DEPLOYMENT.md                       # 📖 دليل النشر خطوة بخطوة (Render + استضافة ثابتة)
├── start-server.bat                    # تشغيل سيرفر الفرونت إند محلياً (:8000)
├── open-frontend.bat                   # فتح الواجهة مباشرة بدون سيرفر (file://)
├── index.html                          # تحويل تلقائي إلى frontend/index.html
└── README.md                           # هذا الملف الشامل
```

---

## ⚡ 1. كيفية تشغيل الفرونت إند (بدون أي سيرفر وبدون بايثون):

المشروع مصمم ليعمل **Standalone**:
- يمكنك ببساطة النقر مرتين (Double Click) على ملف:
  [`frontend/index.html`](file:///e:/Misr-Living-Memory-Source/ehky-ya-misr/frontend/index.html)
- سيفتح مباشرة في متصفحك (Chrome / Edge / Firefox) بكامل تصميمه وميزاته، مع الخريطة التفاعلية، الـ 27 مشهداً، ومحادثة حكيم مصر!

أو باستخدام السكربت الجاهز:
- `start-server.bat` — يشغل سيرفاً محلياً على المنفذ 8000 ويفتح المتصفح تلقائياً.

---

## 🔄 2. الوضع الذكي: أوفلاين / أونلاين

| طريقة التشغيل | مصدر البيانات | مصدر الفيديو |
|---|---|---|
| فتح `index.html` مباشرة (`file://`) | البيانات المدمجة في الفرونت | ملفات `local_videos/` المحلية HD |
| تشغيله عبر سيرفر / استضافة (`http/https`) | الـ API مع السقوط التلقائي للبيانات المدمجة | بث يوتيوب |

- عند التشغيل عبر `http/https` يفحص الفرونت إند الـ API **مرة واحدة فقط في الجلسة** (`/api/health`)، فإذا كان السيرفر متاحاً يسحب البيانات منه، وإذا كان نائماً أو غير منشور يكمل فوراً على البيانات المدمجة دون أي بطء ملحوظ.
- التفاصيل الكاملة في [`frontend/js/services/DATABASE_INTEGRATION.md`](frontend/js/services/DATABASE_INTEGRATION.md).

---

## 🤖 3. لفريق الشات بوت (Chatbot Team Handover):
- سلمهم مجلد [`frontend/components/chatbot/`](frontend/components/chatbot/).
- كل ما عليهم فعله عندما ينتهون من نموذج الذكاء الاصطناعي هو:
  1. فتح ملف `chatbot.js`.
  2. تغيير `USE_REMOTE_API = true`.
  3. وضع رابط السيرفر الخاص بهم في `apiUrl`.
- الشات يحتوي على الأفاتار الفرعوني الملكي في [`frontend/assets/pharaoh-avatar.svg`](frontend/assets/pharaoh-avatar.svg).

---

## 🗄️ 4. لفريق قاعدة البيانات (Database Team Handover):
- سلمهم الدليل [`frontend/js/services/DATABASE_INTEGRATION.md`](frontend/js/services/DATABASE_INTEGRATION.md).
- عند بناء الجداول والـ API، غيّروا في `frontend/js/services/heritageService.js`:
  - `DATABASE_MODE = true` (لتجربة الربط دائماً)، أو اتركوه `'auto'` ليكتشف الوضع تلقائياً.
  - `API_BASE_URL = 'https://your-server/api'`.
- **الـ Endpoints المطبقة في `backend/` حالياً:** `/api/provinces`، `/api/heritage` (بفلاتر category/province/era/search)، `/api/crafts/:id`، `/api/foods` + `/api/foods/:id` (بفلاتر)، `/api/artisans` + `/api/artisans/:id` (بفلاتر)، `/api/chat`، `/api/health`.

---

## 🚀 5. تشغيل الباك إند (اختياري - عند الرغبة في تجربة الـ API):
```bash
cd ehky-ya-misr/backend
npm install
npm start
```
سيعمل على المنفذ: `http://localhost:5000`

---

## 🌍 6. النشر على الإنترنت (Render):
راجع [`DEPLOYMENT.md`](DEPLOYMENT.md) — دليل كامل خطوة بخطوة لنشر:
- الفرونت إند كـ **Static Site** (مجاني، لا ينام أبداً).
- الباك إند كـ **Web Service** (مجاني مع وضع السكون — الفرونت إند يتعامل معه تلقائياً).
