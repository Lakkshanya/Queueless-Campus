import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import http from 'http';
import authRoutes from './routes/authRoutes.js';
import tokenRoutes from './routes/tokenRoutes.js';
import counterRoutes from './routes/counterRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import connectDB from './config/db.js';
import serviceRoutes from './routes/serviceRoutes.js';
import sectionRoutes from './routes/sectionRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import requirementRoutes from './routes/requirementRoutes.js';
import { connectRedis } from './config/redis.js';
import path from 'path';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Initialize Redis
connectRedis();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('public/uploads'));

// Request Logger (MediSentry Style)
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Main Routes
app.use('/api/auth', authRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/counters', counterRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/requirements', requirementRoutes);

// Health check endpoint for mobile diagnostics
app.get('/api/ping', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend is reachable', timestamp: new Date() });
});

// Socket logic for real-time queue updates
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_user', (userId) => {
    socket.join(userId);
    console.log(`User joined personal room: ${userId}`);
  });

  socket.on('join_queue', (queueId) => {
    socket.join(queueId);
    console.log(`User joined queue: ${queueId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// App data to share IO instance
app.set('io', io);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('SERVER CRITICAL ERROR:', err);
  res.status(500).json({ 
    message: 'Internal Server Error', 
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
  });
});

const PORT = process.env.PORT || 8989;

connectDB().then(() => {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Available on network at http://192.168.1.6:${PORT}`);
  });
});
