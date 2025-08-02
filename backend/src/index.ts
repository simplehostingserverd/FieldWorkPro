// Entry point for the FieldPro backend API
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './auth.routes';
import customersRoutes from './routes/customers.routes';
import jobsRoutes from './routes/jobs.routes';
import invoicesRoutes from './routes/invoices.routes';
import paymentsRoutes from './routes/payments.routes';
import inventoryRoutes from './routes/inventory.routes';
import equipmentRoutes from './routes/equipment.routes';
import integrationsRoutes from './routes/integrations.routes';
import {
  initializeIntegrations,
  authenticateIntegrations,
} from './integrations';
import cacheService from './services/cache';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to FieldPro API' });
});

// Auth routes
app.use('/auth', authRoutes);

// API routes
app.use('/api/customers', customersRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/integrations', integrationsRoutes);

// Initialize integrations
async function startServer() {
  try {
    // Initialize cache service
    console.log('🚀 Initializing cache service...');
    await cacheService.connect();

    // Initialize all integrations
    initializeIntegrations();

    // Authenticate integrations
    await authenticateIntegrations();

    // Start server
    app.listen(PORT, () => {
      console.log(`🎉 FieldPro API server running on port ${PORT}`);
      console.log('✅ Cache service initialized');
      console.log('✅ Integrations initialized and ready');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
