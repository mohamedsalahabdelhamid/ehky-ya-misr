# 🏛️ مشروع احكي يا مصر (Ehky Ya Misr)
### المعمارية المنفصلة: Frontend & Backend Architecture

نسخة مطورة ومقسمة معمارياً لمشروع **«احكي يا مصر — مصر في ذاكرة المستقبل»**.
تم تصميم هذه النسخة لتلبية متطلبات العمل الجماعي والتوسع المستقبلي:
1. **Frontend مستقل تماماً:** يمكن تشغيله وتجربته فوراً وبشكل محلي بدون تشغيل أي سيرفر أو كتابة أوامر بايثون.
2. **مكون شات بوت فرعوني مستقل (حكيم مصر):** بكود وملفات معزولة تماماً في مجلد خاص، جاهز لتسليمه لفريق الذكاء الاصطناعي وربطه فور انتهائهم.
3. **طبقة خدمة بيانات مهيأة لقاعدة البيانات:** تسمح لفريق قاعدة البيانات بربط الـ API الخاص بهم بتغيير سطر واحد فقط دون المساس بالواجهة.
4. **Backend REST API جاهز:** هيكل Node.js Express منظم يحتوي على Controllers و Routes و Endpoints قياسية.

---

## 📂 الهيكل المعماري للمشروع (Project Structure):

```text
ehky-ya-misr/
├── frontend/                           # 🌐 واجهة المستخدم (مستقلة وخفيفة)
│   ├── index.html                      # الصفحة الرئيسية (يمكن فتحها مباشرة بالمتصفح)
│   ├── css/
│   │   └── style.css                   # تنسيقات الواجهة، الخريطة، والوضع الليلي
│   ├── js/
│   │   ├── app.js                      # منطق التطبيق والتنقل وعرض الصفحات
│   │   ├── scenes.js                   # معالم الـ 27 محافظة وتبديل المشاهد
│   │   ├── motion.js                   # المؤثرات البصرية وتأثيرات الإضاءة
│   │   └── services/
│   │       ├── heritageService.js      # طبقة البيانات (Offline Fallback + Database Ready)
│   │       └── DATABASE_INTEGRATION.md # دليل فريق الداتا بيز
│   ├── components/
│   │   └── chatbot/                    # 🤖 مكوّن الشات بوت الفرعوني المستقل
│   │       ├── chatbot.js              # منطق المحادثة والربط السحابي
│   │       ├── chatbot.css             # التصميم الفرعوني الأنيق
│   │       └── README.md               # دليل فريق الشات بوت
│   └── assets/                         # جميع الصور والمجسمات وأفاتار الفرعون الملكي
│
├── backend/                            # ⚙️ خادم الـ API (جاهز للتشغيل عند الحاجة)
│   ├── server.js                       # مدخل سيرفر Express
│   ├── package.json                    # إعدادات الحزم
│   ├── .env.example                    # متغيرات البيئة
│   ├── routes/                         # مسارات الـ API (Provinces, Heritage, Chat)
│   ├── controllers/                    # وحدات التحكم بمعالجة الطلبات
│   ├── data/                           # بيانات تجريبية بصيغة JSON
│   └── README.md                       # توثيق الباك إند
│
└── README.md                           # هذا الملف الشامل
```

---

## ⚡ 1. كيفية تشغيل الفرونت إند (بدون أي سيرفر وبدون بايثون):

المشروع مصمم ليعمل **Standalone**:
- يمكنك ببساطة النقر مرتين (Double Click) على ملف:
  [`frontend/index.html`](file:///e:/Misr-Living-Memory-Source/ehky-ya-misr/frontend/index.html)
- سيفتح مباشرة في متصفحك (Chrome / Edge / Firefox) بكامل تصميمه وميزاته، مع الخريطة التفاعلية، الـ 27 مشهداً، ومحادثة حكيم مصر!

---

## 🤖 2. لفريق الشات بوت (Chatbot Team Handover):
- سلمهم مجلد [`frontend/components/chatbot/`](file:///e:/Misr-Living-Memory-Source/ehky-ya-misr/frontend/components/chatbot/).
- كل ما عليهم فعله عندما ينتهون من نموذج الذكاء الاصطناعي هو:
  1. فتح ملف `chatbot.js`.
  2. تغيير `USE_REMOTE_API = true`.
  3. وضع رابط السيرفر الخاص بهم في `apiUrl`.
- الشات يحتوي على الأفاتار الفرعوني الملكي في [`frontend/assets/pharaoh-avatar.svg`](file:///e:/Misr-Living-Memory-Source/ehky-ya-misr/frontend/assets/pharaoh-avatar.svg).

---

## 🗄️ 3. لفريق قاعدة البيانات (Database Team Handover):
- سلمهم الدليل [`frontend/js/services/DATABASE_INTEGRATION.md`](file:///e:/Misr-Living-Memory-Source/ehky-ya-misr/frontend/js/services/DATABASE_INTEGRATION.md).
- عندما ينتهي فريق الداتا بيز من بناء الجداول والـ API:
  1. يفتحون ملف `frontend/js/services/heritageService.js`.
  2. يغيرون `USE_REMOTE_API = true`.
  3. يحددون `API_BASE_URL = 'http://localhost:5000/api'`.
- سيبدأ الفرونت إند فوراً في سحب البيانات الحقيقية من قاعدة البيانات!

---

## 🚀 4. تشغيل الباك إند (اختياري - عند الرغبة في تجربة الـ API):
إذا أردت تشغيل سيرفر الـ API المجهز:
```bash
cd ehky-ya-misr/backend
npm install
npm start
```
سيعمل على المنفذ: `http://localhost:5000`

