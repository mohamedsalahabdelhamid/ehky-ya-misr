# 🗄️ Database & API Integration Guide — دليل فريق قاعدة البيانات

مرحباً يا شباب! هذا الملف يشرح لفريق قاعدة البيانات والباك إند كيفية بناء الـ Endpoints والـ Data Schema لربطها بالفرونت إند بكل سهولة.

---

## 🎯 كيف يتصل الفرونت إند بالداتا بيز؟
في ملف `frontend/js/services/heritageService.js`:
فقط غيروا هذا الإعداد بعد تشغيل السيرفر والداتا بيز:
```javascript
const DATABASE_CONFIG = {
  USE_REMOTE_API: true, // غيّر إلى true
  API_BASE_URL: 'http://localhost:5000/api' // رابط سيرفركم
};
```

---

## 📡 الـ Endpoints المطلوبة من فريق الداتا بيز:

### 1. جلب قائمة المحافظات
- **الطلب:** `GET /api/provinces`
- **شكل الـ JSON المتوقع (Array):**
```json
[
  {
    "id": "alex",
    "name": "الإسكندرية",
    "path": "M257 89L325 106L351 116L350 128L326 126L307 119L296 115L270 107Z",
    "cx": 303,
    "cy": 102,
    "mapPos": [36, 12]
  }
]
```

### 2. البحث والفلترة في عناصر التراث
- **الطلب:** `GET /api/heritage?category=craft&province=alex&era=all&search=مراكب`
- **شكل الـ JSON المتوقع (Array of Items):**
```json
[
  {
    "id": "boats",
    "title": "صناعة المراكب",
    "category": "craft",
    "provinceId": "alex",
    "provinceName": "الإسكندرية",
    "regions": "أبو قير — الأنفوشي",
    "summary": "من تجهيز الخشب إلى بناء الهيكل والتشطيب…",
    "status": "سجل موثق"
  }
]
```

### 3. جلب تفاصيل حرفة أو عنصر تراثي كامل
- **الطلب:** `GET /api/crafts/:id` (مثلاً `GET /api/crafts/boats`)
- **شكل الـ JSON المتوقع:**
```json
{
  "id": "boats",
  "title": "صناعة المراكب",
  "category": "craft",
  "provinceId": "alex",
  "provinceName": "الإسكندرية",
  "regions": "أبو قير — الأنفوشي",
  "status": "سجل موثق",
  "summary": "ملخص الحرفة...",
  "description": "الوصف الكامل...",
  "materials": "الخامات والأدوات...",
  "steps": [
    "تجهيز الأخشاب...",
    "بناء الهيكل..."
  ]
}
```

---

## 💡 ميزة رائعة:
إذا تعطل السيرفر أو لم تنتهوا من بعض الـ Endpoints، فإن كود `heritageService.js` مصمم بحيث يسقط تلقائياً (Graceful Fallback) على البيانات المحلية المؤقتة دون أن يتوقف الموقع عن العمل أو تظهر شاشة بيضاء!

