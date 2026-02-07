import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('CompareUI Server is running.');
});

import configRoutes from './routes/configRoutes.js';
import codeRoutes from './routes/codeRoutes.js';

app.use('/api/config', configRoutes);
app.use('/api/code', codeRoutes);

export default app;
