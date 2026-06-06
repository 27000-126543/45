import {
  alerts,
  aggregatedMetrics,
  broadcast,
  getRegionName,
} from '../store/index.js';
import type { Alert, AlertType, AlertLevel } from '../types/index.js';

const DROP_RATE_THRESHOLD = 5;
const COMPLAINT_SURGE_THRESHOLD = 30;
const ONE_HOUR_MS = 60 * 60 * 1000;
const FIVE_MIN_MS = 5 * 60 * 1000;

const genAlertId = (): string => {
  return `alert-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const hasActiveAlert = (regionCode: string, type: AlertType): Alert | undefined => {
  return alerts.find(
    (a) =>
      a.regionCode === regionCode &&
      a.type === type &&
      a.status !== 'resolved' &&
      a.status !== 'approved'
  );
};

const checkDropRateAlerts = (): Alert[] => {
  const now = Date.now();
  const oneHourAgo = now - ONE_HOUR_MS;
  const fiveMinMs = FIVE_MIN_MS;

  const districtMetrics = aggregatedMetrics.filter((m) => m.regionType === 'district');

  const regionGroups = new Map<string, typeof districtMetrics>();
  for (const m of districtMetrics) {
    if (!regionGroups.has(m.regionCode)) {
      regionGroups.set(m.regionCode, []);
    }
    regionGroups.get(m.regionCode)!.push(m);
  }

  const newAlerts: Alert[] = [];

  for (const [regionCode, metrics] of regionGroups) {
    const sorted = metrics
      .filter((m) => {
        const t = new Date(m.timestamp).getTime();
        return t >= oneHourAgo && t <= now;
      })
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    const bucketed = new Map<string, number>();
    for (const m of sorted) {
      const t = new Date(m.timestamp).getTime();
      const bucket = Math.floor(t / fiveMinMs) * fiveMinMs;
      bucketed.set(String(bucket), m.dropRate);
    }

    const startTime = Math.floor(oneHourAgo / fiveMinMs) * fiveMinMs;
    const consecutivePoints: number[] = [];

    for (let i = 0; i < 12; i++) {
      const bucket = startTime + i * fiveMinMs;
      if (bucketed.has(String(bucket))) {
        consecutivePoints.push(bucketed.get(String(bucket))!);
      }
    }

    if (consecutivePoints.length >= 12 && consecutivePoints.every((dr) => dr > DROP_RATE_THRESHOLD)) {
      const existing = hasActiveAlert(regionCode, 'drop_rate');
      if (!existing) {
        const avgDropRate = consecutivePoints.reduce((s, v) => s + v, 0) / consecutivePoints.length;
        const regionName = getRegionName(regionCode, 'district');

        const alert: Alert = {
          id: genAlertId(),
          level: 1,
          type: 'drop_rate',
          title: `${regionName}连续1小时掉线率超过${DROP_RATE_THRESHOLD}%`,
          description: `${regionName}最近1小时(12个连续5分钟点)掉线率持续高于阈值${DROP_RATE_THRESHOLD}%，当前平均达${avgDropRate.toFixed(2)}%，请及时处理。`,
          regionCode,
          regionName,
          regionType: 'district',
          triggerValue: Math.round(avgDropRate * 100) / 100,
          threshold: DROP_RATE_THRESHOLD,
          startTime: new Date(startTime).toISOString(),
          duration: 60,
          status: 'pending_ack',
          approvalHistory: [],
          createdAt: new Date().toISOString(),
        };

        alerts.push(alert);
        newAlerts.push(alert);
      }
    }
  }

  return newAlerts;
};

const checkComplaintSurgeAlerts = (): Alert[] => {
  const now = Date.now();
  const oneHourAgo = now - ONE_HOUR_MS;
  const twoHoursAgo = now - 2 * ONE_HOUR_MS;

  const districtMetrics = aggregatedMetrics.filter((m) => m.regionType === 'district');

  const regionGroups = new Map<string, typeof districtMetrics>();
  for (const m of districtMetrics) {
    if (!regionGroups.has(m.regionCode)) {
      regionGroups.set(m.regionCode, []);
    }
    regionGroups.get(m.regionCode)!.push(m);
  }

  const newAlerts: Alert[] = [];

  for (const [regionCode, metrics] of regionGroups) {
    const currentHourComplaints = metrics
      .filter((m) => {
        const t = new Date(m.timestamp).getTime();
        return t >= oneHourAgo && t <= now;
      })
      .reduce((s, m) => s + m.complaintCount, 0);

    const prevHourComplaints = metrics
      .filter((m) => {
        const t = new Date(m.timestamp).getTime();
        return t >= twoHoursAgo && t < oneHourAgo;
      })
      .reduce((s, m) => s + m.complaintCount, 0);

    if (currentHourComplaints >= 3 && prevHourComplaints > 0) {
      const growthRate = ((currentHourComplaints - prevHourComplaints) / prevHourComplaints) * 100;

      if (growthRate > COMPLAINT_SURGE_THRESHOLD) {
        const existing = hasActiveAlert(regionCode, 'complaint_surge');
        if (!existing) {
          const regionName = getRegionName(regionCode, 'district');

          const alert: Alert = {
            id: genAlertId(),
            level: 1,
            type: 'complaint_surge',
            title: `${regionName}投诉量环比突增${growthRate.toFixed(0)}%`,
            description: `${regionName}近1小时用户投诉${currentHourComplaints}件，较前1小时(${prevHourComplaints}件)环比增长${growthRate.toFixed(1)}%，超过阈值${COMPLAINT_SURGE_THRESHOLD}%。`,
            regionCode,
            regionName,
            regionType: 'district',
            triggerValue: Math.round(growthRate * 100) / 100,
            threshold: COMPLAINT_SURGE_THRESHOLD,
            startTime: new Date(oneHourAgo).toISOString(),
            duration: 60,
            status: 'pending_ack',
            approvalHistory: [],
            createdAt: new Date().toISOString(),
          };

          alerts.push(alert);
          newAlerts.push(alert);
        }
      }
    }
  }

  return newAlerts;
};

const upgradeAlerts = (): Alert[] => {
  const now = Date.now();
  const upgraded: Alert[] = [];

  for (const alert of alerts) {
    if (
      alert.level === 1 &&
      alert.status !== 'resolved' &&
      alert.status !== 'approved' &&
      alert.status !== 'rejected'
    ) {
      const createdAt = new Date(alert.createdAt).getTime();
      if (now - createdAt >= ONE_HOUR_MS) {
        alert.level = 2 as AlertLevel;
        alert.upgradedAt = new Date().toISOString();
        alert.title = alert.title.replace(/^/, '【升级】');
        alert.description = `${alert.description}（预警已超过1小时未处理，自动升级为二级预警）`;
        upgraded.push(alert);
      }
    }
  }

  return upgraded;
};

let engineInterval: NodeJS.Timeout | null = null;

const startAlertEngine = (): void => {
  if (engineInterval) {
    return;
  }

  const runChecks = () => {
    const dropRateAlerts = checkDropRateAlerts();
    const complaintAlerts = checkComplaintSurgeAlerts();
    const upgradedAlerts = upgradeAlerts();

    const allNew = [...dropRateAlerts, ...complaintAlerts, ...upgradedAlerts];

    if (allNew.length > 0) {
      broadcast({
        type: 'alerts',
        data: {
          new: allNew.map((a) => ({
            id: a.id,
            level: a.level,
            type: a.type,
            title: a.title,
            regionName: a.regionName,
            status: a.status,
            createdAt: a.createdAt,
          })),
          dropRateCount: dropRateAlerts.length,
          complaintCount: complaintAlerts.length,
          upgradedCount: upgradedAlerts.length,
        },
      });
    }
  };

  runChecks();
  engineInterval = setInterval(runChecks, 60 * 1000);
};

const stopAlertEngine = (): void => {
  if (engineInterval) {
    clearInterval(engineInterval);
    engineInterval = null;
  }
};

export {
  checkDropRateAlerts,
  checkComplaintSurgeAlerts,
  upgradeAlerts,
  startAlertEngine,
  stopAlertEngine,
};
