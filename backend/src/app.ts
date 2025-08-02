import express, { Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';

import authRoutes from './routes/auth';
import customerRoutes from './routes/customers.routes';
import jobRoutes from './routes/jobs.routes';
import invoiceRoutes from './routes/invoices.routes';
import paymentRoutes from './routes/payments.routes';
import inventoryRoutes from './routes/inventory.routes';
import equipmentRoutes from './routes/equipment.routes';

// Load environment variables
dotenv.config();

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.config();
    this.routes();
  }

  private config(): void {
    // Middleware
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json());
  }

  private routes(): void {
    // Health check route
    this.app.get('/health', (req, res) => {
      res
        .status(200)
        .json({ status: 'OK', message: 'FieldPro API is running' });
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/customers', customerRoutes);
    this.app.use('/api/jobs', jobRoutes);
    this.app.use('/api/invoices', invoiceRoutes);
    this.app.use('/api/payments', paymentRoutes);
    this.app.use('/api/inventory', inventoryRoutes);
    this.app.use('/api/equipment', equipmentRoutes);
  }
}

export default new App().app;
