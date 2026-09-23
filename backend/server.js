import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';

import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import bloodRoutes from './routes/bloodRoutes.js';
import droneRoutes from './routes/droneRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import temperatureRoutes from './routes/temperatureRoutes.js';
import { setupSocketHandlers } from './socket/socketHandler.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// Socket.IO Server configuration
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'AeroMed Emergency Logistics Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/blood', bloodRoutes);
app.use('/api/drones', droneRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/temperature', temperatureRoutes);

// Setup Socket.IO telemetry broadcast
setupSocketHandlers(io);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 AeroMed Logistics Server running on port ${PORT}`);
  console.log(`📡 REST API Base: http://localhost:${PORT}/api`);
  console.log(`⚡ Socket.IO Ready: ws://localhost:${PORT}`);
  console.log(`====================================================`);
});
