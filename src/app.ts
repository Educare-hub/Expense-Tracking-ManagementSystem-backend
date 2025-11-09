import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import routes from './routes';
import dotenv from 'dotenv';
import { getDbPool } from './utils/db';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));
app.use('/api', routes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));


if (process.env.NODE_ENV !== 'test') {
  getDbPool()
    .then(() => console.log('Database connected successfully'))
    .catch((err) => console.error('Database connection failed:', err));
}
export default app;
