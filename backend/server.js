import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import juniorRoutes from './routes/juniors.js';
import caseRoutes from './routes/cases.js';
import amountRoutes from './routes/amounts.js';
import hearingRoutes from './routes/hearings.js';
import settingRoutes from './routes/settings.js';
import dashboardRoutes from './routes/dashboard.js';
import { connectDB, isMongoConnected } from './database/connectDB.js';
import { syncFromMongo } from './database/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas Database Cluster
connectDB().then((connected) => {
  if (connected) {
    syncFromMongo();
  }
});

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Layer ERP Backend REST API',
    database: isMongoConnected() ? 'MongoDB Atlas Cluster (Connected)' : 'Local Resilient Cache',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/juniors', juniorRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/amounts', amountRoutes);
app.use('/api/hearings', hearingRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? null : err.message
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`⚖️  Layer ERP Backend Server Running`);
  console.log(`🚀 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🩺 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=========================================`);
});

export default app;
