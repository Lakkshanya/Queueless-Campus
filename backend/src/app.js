import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import tokenRoutes from './routes/tokenRoutes.js';
import counterRoutes from './routes/counterRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import requirementRoutes from './routes/requirementRoutes.js';

const app = express();

// Trust proxy for tunnels (localtunnel, ngrok, etc.)
app.set('trust proxy', true);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Route Middleware
app.use('/api/auth', authRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/counters', counterRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// Basic route test
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'QueueLess Backend API is running' });
});

export default app;
