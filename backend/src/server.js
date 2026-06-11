require('dotenv').config();

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');

// Tentativa de importar helmet e express-rate-limit (opcionais)
let helmet = null;
let rateLimit = null;

try {
  helmet = require('helmet');
} catch (e) {
  console.log('⚠️  helmet não instalado — continuando sem ele');
}

try {
  rateLimit = require('express-rate-limit');
} catch (e) {
  console.log('⚠️  express-rate-limit não instalado — continuando sem ele');
}

const app = express();

// ========================
// Middlewares globais
// ========================

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Helmet (se disponível)
if (helmet) {
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));
}

// Rate Limiting (se disponível e em produção)
if (rateLimit && process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100,
    message: {
      success: false,
      data: null,
      message: 'Muitas requisições. Tente novamente em 15 minutos',
    },
  });
  app.use(limiter);
}

// Arquivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ========================
// Health Check
// ========================

app.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'online',
      projeto: 'Imports GR API',
    },
    message: 'API funcionando corretamente',
  });
});

// ========================
// Rotas
// ========================

// Importação segura de rotas — não quebra o servidor se um arquivo não existir
const safeRequire = (modulePath, routeName) => {
  try {
    return require(modulePath);
  } catch (error) {
    console.log(`⚠️  Rota "${routeName}" não carregada: ${error.message}`);
    return null;
  }
};

const authRoutes = safeRequire('./routes/authRoutes', 'auth');
const productRoutes = safeRequire('./routes/productRoutes', 'products');
const categoryRoutes = safeRequire('./routes/categoryRoutes', 'categories');
const brandRoutes = safeRequire('./routes/brandRoutes', 'brands');
const cartRoutes = safeRequire('./routes/cartRoutes', 'cart');
const favoriteRoutes = safeRequire('./routes/favoriteRoutes', 'favorites');
const orderRoutes = safeRequire('./routes/orderRoutes', 'orders');
const customerRoutes = safeRequire('./routes/customerRoutes', 'customers');
const stockRoutes = safeRequire('./routes/stockRoutes', 'stock');
const dashboardRoutes = safeRequire('./routes/dashboardRoutes', 'dashboard');
const reportRoutes = safeRequire('./routes/reportRoutes', 'reports');

if (authRoutes) app.use('/api/auth', authRoutes);
if (productRoutes) app.use('/api/products', productRoutes);
if (categoryRoutes) app.use('/api/categories', categoryRoutes);
if (brandRoutes) app.use('/api/brands', brandRoutes);
if (cartRoutes) app.use('/api/cart', cartRoutes);
if (favoriteRoutes) app.use('/api/favorites', favoriteRoutes);
if (orderRoutes) app.use('/api/orders', orderRoutes);
if (customerRoutes) app.use('/api/customers', customerRoutes);
if (stockRoutes) app.use('/api/stock', stockRoutes);
if (dashboardRoutes) app.use('/api/dashboard', dashboardRoutes);
if (reportRoutes) app.use('/api/reports', reportRoutes);

// ========================
// Middleware de erro global
// ========================

app.use((err, req, res, next) => {
  console.error('❌ Erro:', err.message);
  console.error(err.stack);

  // Erro do Multer (upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'Arquivo muito grande. Tamanho máximo permitido: 5MB',
    });
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      data: null,
      message: `Erro no upload: ${err.message}`,
    });
  }

  res.status(err.status || 500).json({
    success: false,
    data: null,
    message: err.message || 'Erro interno do servidor',
  });
});

// ========================
// Iniciar servidor
// ========================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});

module.exports = app;
