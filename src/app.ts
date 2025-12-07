// src/app.ts  
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import routes from './routes';                    // Normal user routes: /api/auth, /api/expenses, etc.
import adminRoutes from './routes/adminRoutes';    // Admin routes: /admin/users, /admin/expenses

import dotenv from 'dotenv';
import { getDbPool } from './utils/db';

dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(bodyParser.json({ limit: '5mb' }));

// USER API used by normal users (UserDashboard) /api/expenses, /api/auth
app.use('/api', routes);

// ADMIN API used by AdminDashboard /admin/users, /admin/expenses
app.use('/admin', adminRoutes);   

app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

if (process.env.NODE_ENV !== 'test') {
  getDbPool()
    .then(() => console.log('MySQL Database connected'))
    .catch(err => console.error('Database failed:', err));
}

export default app;