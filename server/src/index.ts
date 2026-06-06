import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer } from 'ws';
import { addWsClient, removeWsClient } from './store/index.js';
import { startSimulation } from './services/simulator.js';
import { startAlertEngine } from './services/alertEngine.js';

import authRouter from './routes/auth.js';
import regionsRouter from './routes/regions.js';
import metricsRouter from './routes/metrics.js';
import alertsRouter from './routes/alerts.js';
import stationsRouter from './routes/stations.js';
import capacityRouter from './routes/capacity.js';
import reportsRouter from './routes/reports.js';

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/regions', regionsRouter);
app.use('/api/metrics', metricsRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/stations', stationsRouter);
app.use('/api/capacity', capacityRouter);
app.use('/api/reports', reportsRouter);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Server Error]', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  addWsClient(ws);

  ws.on('close', () => {
    removeWsClient(ws);
  });
});

startSimulation();
startAlertEngine();

server.listen(PORT, () => {
  console.log(`[Server] HTTP server running on http://localhost:${PORT}`);
  console.log(`[Server] WebSocket server running on ws://localhost:${PORT}/ws`);
  console.log(`[Server] Simulation and Alert Engine started`);
});
