import express from 'express';
import cors from 'cors';
import { initDB } from './db';
import { errorHandler, notFound } from './middleware/errorHandler';

import crowdPacksRouter from './routes/crowdPacks';
import materialsRouter from './routes/materials';
import resourcePositionsRouter from './routes/resourcePositions';
import configsRouter from './routes/configs';
import rulesRouter from './routes/rules';
import analyticsRouter from './routes/analytics';
import deliveryRouter from './routes/delivery';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database
initDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/crowd-packs', crowdPacksRouter);
app.use('/api/materials', materialsRouter);
app.use('/api/resource-positions', resourcePositionsRouter);
app.use('/api/configs', configsRouter);
app.use('/api/rules', rulesRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/delivery', deliveryRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'XT Operations Platform API', version: '1.0.0' });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 XT Operations Platform API running at http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health\n`);
});

export default app;
