/**
 * ==============================================================================
 * EHKY YA MISR - BACKEND REST API SERVER
 * ==============================================================================
 * Provides endpoints for Provinces, Heritage Items, Crafts, and AI Chatbot.
 * ==============================================================================
 */

const express = require('express');
const cors = require('cors');

const provincesRoutes = require('./routes/provinces');
const heritageRoutes = require('./routes/heritage');
const chatRoutes = require('./routes/chat');
const foodsRoutes = require('./routes/foods');
const artisansRoutes = require('./routes/artisans');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/provinces', provincesRoutes);
app.use('/api/heritage', heritageRoutes);
app.use('/api/crafts', (req, res, next) => {
  req.url = '/crafts' + req.url;
  heritageRoutes(req, res, next);
});
app.use('/api/chat', chatRoutes);
app.use('/api/foods', foodsRoutes);
app.use('/api/artisans', artisansRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    project: 'Ehky Ya Misr (احكي يا مصر)',
    timestamp: new Date().toISOString()
  });
});

// Root friendly welcome
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family:sans-serif;text-align:center;padding:40px;direction:rtl">
      <h1>🏛️ سيرفر مشروع احكي يا مصر (Ehky Ya Misr Backend)</h1>
      <p>الباك إند يعمل بنجاح ومستعد لاستقبال طلبات الفرونت إند والـ API.</p>
      <p><a href="/api/health">فحص الحالة: /api/health</a> | <a href="/api/provinces">المحافظات: /api/provinces</a></p>
    </div>
  `);
});

// Start listening
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🏛️  Ehky Ya Misr Backend API Server is running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`👉 Health: http://localhost:${PORT}/api/health`);
  console.log(`👉 Provinces: http://localhost:${PORT}/api/provinces`);
  console.log(`======================================================\n`);
});

