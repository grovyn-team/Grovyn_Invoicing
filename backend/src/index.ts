import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './utils/database.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import quotationRoutes from './routes/quotationRoutes.js';
import offerLetterRoutes from './routes/offerLetterRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import proposalRoutes from './routes/proposalRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/offer-letters', offerLetterRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/proposals', proposalRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Invoice Generator API is running' });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('Failed to connect to database:', error);
  process.exit(1);
});
