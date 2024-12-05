import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import indexRouter from './src/routes/index.js';
import cron from 'node-cron';
import { newsScheduler } from './src/scheduler/newsScheduler.js';
import { cleanUpScheduler } from './src/scheduler/cleanUpScheduler.js';

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', indexRouter);

dotenv.config();

mongoose
  .connect(process.env.DB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    status: 'error',
    message: err.message || 'BE:Internal server error occurred',
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

cron.schedule('0 */5 * * *', () => {
  // every minute: '* * * * *'
  // every 5 hours: '0 */5 * * *'
  console.log('Every five hours');
  newsScheduler();
});

cron.schedule('0 */4 * * *', () => {
  // every minute: '* * * * *'
  console.log('Every four hours');
  cleanUpScheduler();
});
