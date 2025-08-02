// Entry point for the FieldPro backend API
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './auth.routes';

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

// Start server
app.listen(PORT, () => {
  console.log(`FieldPro API server running on port ${PORT}`);
});

export default app;
