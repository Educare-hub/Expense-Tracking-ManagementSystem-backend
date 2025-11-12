import express from 'express';
import cors from 'cors';
import routes from './routes';
import dotenv from 'dotenv';
import { getDbPool } from './utils/db';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); 
app.use('/api', routes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const port = process.env.PORT || 8081;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

getDbPool().then(() => console.log('Database connected successfully'))
.catch((err) => console.error('Database connection failed:', err));
