// src/index.ts  ← THIS IS THE FILE THAT ACTUALLY RUNS
import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Admin endpoints: http://localhost:${PORT}/admin/users`);
  console.log(`Admin endpoints: http://localhost:${PORT}/admin/expenses`);
});