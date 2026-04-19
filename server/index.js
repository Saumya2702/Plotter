/**
 * Plotter — Express Application Entry Point
 *
 * Middleware chain (order matters):
 *   helmet             → security headers
 *   cors               → allow frontend origin
 *   morgan             → HTTP request logging
 *   express.json       → parse JSON bodies
 *   rate limiter       → protect public endpoints
 *   routes             → business logic
 *   error middleware   → last — catches anything thrown above
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const storiesRouter = require('./routes/stories.routes');
const errorHandler = require('./middleware/error.middleware');
require('./services/db');
require('./services/redis');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());

const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_ORIGIN,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow if no origin (legacy/mobile) or if it's a known origin
      const isAllowed = !origin || 
                       allowedOrigins.includes(origin) || 
                       origin.endsWith('.vercel.app') || 
                       origin.endsWith('.onrender.com');
      
      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`[CORS] Blocked request from: ${origin}`);
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);

// ── Logging ──────────────────────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: false }));

// ── Rate limiting — 200 req / 15 min per IP ──────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — please try again later' },
});
app.use('/api', limiter);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({ message: "Welcome to the Plotter API! Use /api/health to check status." });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Feature routes ───────────────────────────────────────────────────────────
app.use('/api/stories', storiesRouter);
app.use('/api/stories/:storyId/comments', require('./routes/comments.routes'));
app.use('/api/reactions', require('./routes/reactions.routes'));
app.use('/api/explore', require('./routes/explore.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/notifications', require('./routes/notifications.routes'));

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});


app.use(errorHandler);

// ── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[Server] Plotter API running on http://localhost:${PORT}`);
  console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app; 
