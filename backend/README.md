# 🏛️ Ehky Ya Misr — Backend REST API

سيرفر الـ API لمشروع **«احكي يا مصر»**.

## 🚀 التشغيل السريع:

```bash
# 1. تثبيت الحزم
npm install

# 2. تشغيل السيرفر
npm start
```

السيرفر سيعمل على: `http://localhost:5000`

---

## 📡 مسارات الـ API المتاحة (Endpoints):

| Method | Endpoint | الوظيفة |
| :--- | :--- | :--- |
| `GET` | `/api/health` | فحص حالة السيرفر |
| `GET` | `/api/provinces` | إرجاع قائمة المحافظات الـ 27 |
| `GET` | `/api/provinces/:id` | إرجاع بيانات محافظة محددة (مثل `alex`) |
| `GET` | `/api/heritage` | البحث والفلترة في عناصر التراث |
| `GET` | `/api/crafts/:id` | إرجاع بيانات حرفة محددة (مثل `boats`) |
| `POST` | `/api/chat` | استلام سؤال المستخدم وإرجاع رد الشات بوت |

---

## 👥 للفرق الشريكة:
- **فريق الداتا بيز:** يمكنكم استبدال ملفات الـ JSON في مجلد `data/` بالاتصال الحقيقي بقاعدة البيانات (PostgreSQL / MongoDB / MySQL) داخل `controllers/`.
- **فريق الشات بوت:** ملف `controllers/chatController.js` جاهز لاستقبال نموذج الذكاء الاصطناعي الخاص بكم عبر LangChain أو Gemini API أو OpenAI.

