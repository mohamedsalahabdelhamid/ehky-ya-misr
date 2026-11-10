# 🚀 دليل النشر — احكي يا مصر على الإنترنت

هذا الدليل يشرح خطوة بخطوة كيفية نشر المشروع كاملاً (فرونت إند + باك إند) على منصة **Render.com** بشكل مجاني، أو نشر الفرونت إند فقط على أي استضافة ثابتة.

---

## 🧩 نظرة عامة على البنية بعد النشر

| الجزء | نوع الخدمة على Render | الخطة | ملاحظات |
|---|---|---|---|
| الفرونت إند (`frontend/`) | Static Site | مجانية | لا تنام أبداً — سرعة دائمة |
| الباك إند (`backend/`) | Web Service (Node) | مجانية | تنام بعد خمول؛ الفرونت إند يتعامل مع ذلك تلقائياً |

**مهم:** فيديوهات `local_videos/` المحلية (حجمها ~1.6GB) لا تُرفَع مع النشر لأنها مستثناة من الـ git — في الوضع الأونلاين يعمل الموقع ببث يوتيوب تلقائياً. هذا هو السلوك المقصود.

---

## 🅰️ الطريقة الأولى: النشر الكامل عبر Blueprint (الأسرع)

ملف [`render.yaml`](render.yaml) جاهز في جذر المشروع ويصف الخدمتين.

1. **ارفع المشروع إلى GitHub** (افترض أنك فعلت):
   ```bash
   git remote add origin https://github.com/USERNAME/ehky-ya-misr.git
   git push -u origin main
   ```

2. **أنشئ الحساب**: افتح [render.com](https://render.com) وسجّل بحساب GitHub.

3. **من لوحة التحكم**: اضغط **New +** ← **Blueprint** ← اختر مستودع `ehky-ya-misr`.
   - Render سيقرأ `render.yaml` تلقائياً وينشئ:
     - `ehky-ya-misr-frontend` (Static Site)
     - `ehky-ya-misr-backend` (Web Service)
   - اضغط **Apply** وانتظر دقيقتين حتى يكتمل النشر.

4. **اربط الفرونت إند بالباك إند** (خطوة واحدة فقط):
   - من صفحة خدمة الباك إند، انسخ رابطها، مثلاً:
     `https://ehky-ya-misr-backend.onrender.com`
   - افتح `frontend/js/services/heritageService.js` وعدّل السطر:
     ```javascript
     API_BASE_URL: 'https://ehky-ya-misr-backend.onrender.com/api'
     ```
   - اعمل commit وpush:
     ```bash
     git add frontend/js/services/heritageService.js
     git commit -m "chore(deploy): point frontend to production API"
     git push
     ```
   - Render سيعيد نشر الفرونت إند تلقائياً. انتهى! 🎉

5. **التحقق:**
   - افتح رابط الفرونت إند → الموقع يعمل كاملاً.
   - افتح `https://BACKEND-URL/api/health` → يجب أن ترى `{"status":"online"}`.

---

## 🅱️ الطريقة الثانية: إنشاء الخدمتين يدوياً

### 1. الباك إند (Web Service)
1. **New +** ← **Web Service** ← اربط المستودع.
2. الإعدادات:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/health`
3. Create Web Service وانتظر النشر.

### 2. الفرونت إند (Static Site)
1. **New +** ← **Static Site** ← اربط نفس المستودع.
2. الإعدادات:
   - **Root Directory:** `frontend` (أو اتركه فارغاً وحدد Publish Path = `./frontend`)
   - **Build Command:** اتركه فارغاً أو `echo done`
   - **Publish Directory:** `./frontend`
3. Create Static Site.

ثم اتبع الخطوة 4 أعلاه لربط `API_BASE_URL`.

---

## 🌐 بدائل النشر الثابت للفرونت إند فقط

إذا أردت فقط الموقع بدون باك إند الآن (كل البيانات مدمجة أصلاً في الفرونت إند):

| المنصة | الطريقة |
|---|---|
| **GitHub Pages** | Settings → Pages → Deploy from branch → `main` / مجلد `/frontend` |
| **Netlify** | اسحب مجلد `frontend` وأفلته في app.netlify.com/drop |
| **Cloudflare Pages** | Create project → ربط المستودع → Output directory = `frontend` |

> الفرونت إند مصمم ليعمل بدون باك إند نهائياً — سيكتشف عدم توفره خلال ثانية ويعمل بالبيانات المدمجة.

---

## 😴 ملاحظة "نوم" الباك إند في الخطة المجانية

الخدمات المجانية على Render تنام بعد ~15 دقيقة من عدم الاستخدام، وأول طلب بعدها يستغرق 30-60 ثانية للاستيقاظ. **الفرونت إند يتعامل مع ذلك تلقائياً**:
- يفحص `/api/health` مرة واحدة لكل جلسة مستخدم بمهلة قصيرة.
- إذا لم يجب الباك إند، يكمل فوراً على البيانات المدمجة — المستخدم لن يرى شاشة انتظار.
- عند استيقاظ الباك إند، الجلسات الجديدة ستستخدم الـ API.

## 🔁 تحديثات لاحقة

كل `git push` إلى `main` يعيد نشر الخدمتين تلقائياً (Auto-Deploy). لا حاجة لأي خطوة إضافية.

## 🛡️ متغيرات البيئة (عند الحاجة)

- `GEMINI_API_KEY` / `OPENAI_API_KEY`: تُضاف من لوحة Render (Environment) عند جاهزية فريق الذكاء الاصطناعي — موجودة معطلة في `render.yaml`.
- لا تضع أي مفاتيح في الكود أو الـ git أبداً.
