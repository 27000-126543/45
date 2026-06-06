import {
  baseStations,
  rawMetrics,
  broadcast,
} from '../store/index.js';
import type { RawStationMetrics } from '../types/index.js';
import { cleanRawMetrics, aggregateMetricsByRegion } from './processor.js';

const randomInRange = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

const generateStationMetrics = (): RawStationMetrics[] => {
  const now = new Date();
  const timestamp = now.toISOString();
  const metrics: RawStationMetrics[] = [];

  for (const station of baseStations) {
    let signalStrength: number;
    const anomalyRoll = Math.random();

    if (anomalyRoll < 0.02) {
      signalStrength = randomInRange(-150, -131);
    } else if (anomalyRoll < 0.04) {
      signalStrength = randomInRange(-59, -40);
    } else {
      signalStrength = randomInRange(-110, -80);
    }

    const dropCallCount = Math.floor(randomInRange(0, 51));
    const totalCallCount = Math.floor(randomInRange(1000, 10000));
    const trafficGB = randomInRange(0, 1000);
    const complaintCount = Math.floor(randomInRange(0, 4));

    metrics.push({
      id: `rm-${station.id}-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
      stationId: station.id,
      timestamp,
      signalStrength: Math.round(signalStrength * 100) / 100,
      dropCallCount,
      totalCallCount,
      trafficGB: Math.round(trafficGB * 100) / 100,
      complaintCount,
    });
  }

  return metrics;
};

let simulationInterval: NodeJS.Timeout | null = null;

const startSimulation = (): void => {
  if (simulationInterval) {
    return;
  }

  const runCycle = () => {
    const newMetrics = generateStationMetrics();
    rawMetrics.push(...newMetrics);

    const oneHourAgo = Date.now() - 3600 * 1000;
    const cutoff = new Date(oneHourAgo).toISOString();
    while (rawMetrics.length > 0 && rawMetrics[0].timestamp < cutoff) {
      rawMetrics.shift();
    }

    const cleaned = cleanRawMetrics(newMetrics);

    const fiveMinBucket = 5 * 60 * 1000;
    const now = Date.now();
    const bucketTime = Math.floor(now / fiveMinBucket) * fiveMinBucket;
    const bucket = new Date(bucketTime).toISOString();

    aggregateMetricsByRegion(bucket);

    broadcast({
      type: 'new_metrics',
      data: {
        rawCount: newMetrics.length,
        cleanedCount: cleaned.length,
        timestamp: new Date().toISOString(),
      },
    });
  };

  runCycle();
  simulationInterval = setInterval(runCycle, 30 * 1000);
};

const stopSimulation = (): void => {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
};

export {
  generateStationMetrics,
  startSimulation,
  stopSimulation,
};
