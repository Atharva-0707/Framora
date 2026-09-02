const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const commentRoutes = require('./routes/commentRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');

const app = express();

// Production-ready CORS configuration
const getAllowedOrigins = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const clientUrls = (process.env.CLIENT_URL || '')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);

  if (isProduction) {
    return clientUrls;
  }
  return [
    ...clientUrls,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
  ];
};

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, server-to-server, curl, Postman)
      if (!origin) {
        return callback(null, true);
      }
      const allowed = getAllowedOrigins();
      if (allowed.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS Error: Origin ${origin} not allowed by Access-Control-Allow-Origin`));
    },
    credentials: true,
  })
);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve static legacy uploads for backward compatibility
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    app: 'Framora Photography Platform API',
    tagline: 'Every frame has a story.',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/purchases', purchaseRoutes);

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

module.exports = app;
