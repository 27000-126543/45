import { Router, Response } from 'express';
import { aggregatedMetrics, getRegionName } from '../store/index.js';
import { provinces } from '../data/regions.js';
import { authenticate, canAccessRegion, AuthenticatedRequest } from '../middleware/auth.js';
import type { NetworkMetrics } from '../types/index.js';

const router = Router();

interface OverviewMetrics {
  signalCoverage: number;
  dropRate: number;
  avgDownloadSpeed: number;
  satisfactionScore: number;
  totalUsers: number;
  trafficVolume: number;
  regionCode: string;
  regionName: string;
}

function aggregateMetrics(metricsList: NetworkMetrics[]): OverviewMetrics {
  if (metricsList.length === 0) {
    return {
      signalCoverage: 0,
      dropRate: 0,
      avgDownloadSpeed: 0,
      satisfactionScore: 0,
      totalUsers: 0,
      trafficVolume: 0,
      regionCode: '',
      regionName: '',
    };
  }

  const signalCoverage = metricsList.reduce((s, m) => s + m.signalCoverage, 0) / metricsList.length;
  const totalDropCalls = metricsList.reduce((s, m) => s + m.dropCallCount, 0);
  const totalCalls = metricsList.reduce((s, m) => s + m.totalCallCount, 0);
  const dropRate = totalCalls > 0 ? (totalDropCalls / totalCalls) * 100 : 0;
  const avgDownloadSpeed = metricsList.reduce((s, m) => s + m.avgDownloadSpeed, 0) / metricsList.length;
  const satisfactionScore = metricsList.reduce((s, m) => s + m.satisfactionScore, 0) / metricsList.length;
  const totalUsers = metricsList.reduce((s, m) => s + m.totalUsers, 0);
  const trafficVolume = metricsList.reduce((s, m) => s + m.trafficVolume, 0);

  return {
    signalCoverage: Math.round(signalCoverage * 100) / 100,
    dropRate: Math.round(dropRate * 100) / 100,
    avgDownloadSpeed: Math.round(avgDownloadSpeed * 100) / 100,
    satisfactionScore: Math.round(satisfactionScore * 100) / 100,
    totalUsers,
    trafficVolume: Math.round(trafficVolume * 100) / 100,
    regionCode: metricsList[0].regionCode,
    regionName: getRegionName(metricsList[0].regionCode),
  };
}

function getLatestMetricsByRegion(regionCode?: string): NetworkMetrics[] {
  if (regionCode) {
    const regionMetrics = aggregatedMetrics.filter(m => m.regionCode === regionCode);
    if (regionMetrics.length === 0) return [];
    const latestTimestamp = regionMetrics[regionMetrics.length - 1].timestamp;
    return regionMetrics.filter(m => m.timestamp === latestTimestamp);
  }

  const latestByRegion = new Map<string, NetworkMetrics>();
  for (const m of aggregatedMetrics) {
    const existing = latestByRegion.get(m.regionCode);
    if (!existing || m.timestamp > existing.timestamp) {
      latestByRegion.set(m.regionCode, m);
    }
  }
  return Array.from(latestByRegion.values());
}

router.get('/overview', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: '未认证' });
    return;
  }

  const { regionCode } = req.query as { regionCode?: string };

  if (regionCode && !canAccessRegion(req.user, regionCode)) {
    res.status(403).json({ success: false, error: '无权限访问该区域' });
    return;
  }

  let targetMetrics: NetworkMetrics[];

  if (regionCode) {
    targetMetrics = getLatestMetricsByRegion(regionCode);
  } else {
    const allLatest = getLatestMetricsByRegion();
    targetMetrics = allLatest.filter(m => canAccessRegion(req.user!, m.regionCode));
  }

  const overview = aggregateMetrics(targetMetrics);

  res.json({ success: true, data: overview });
});

router.get('/trend', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: '未认证' });
    return;
  }

  let { regionCode } = req.query as { regionCode?: string };

  if (!regionCode) {
    if (req.user!.role === 'headquarters') {
      regionCode = '110000';
    } else {
      regionCode = req.user!.regionCode;
    }
  }

  if (!canAccessRegion(req.user!, regionCode)) {
    res.status(403).json({ success: false, error: '无权限访问该区域' });
    return;
  }

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const regionMetrics = aggregatedMetrics
    .filter(m => m.regionCode === regionCode && m.timestamp >= twentyFourHoursAgo)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  const trend = regionMetrics.map(m => ({
    timestamp: m.timestamp,
    timeSlot: m.timeSlot,
    signalCoverage: m.signalCoverage,
    dropRate: m.dropRate,
    avgDownloadSpeed: m.avgDownloadSpeed,
    satisfactionScore: m.satisfactionScore,
  }));

  res.json({ success: true, data: trend });
});

router.get('/ranking', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: '未认证' });
    return;
  }

  let rankingRegions: { code: string; name: string; type: 'province' | 'city' }[] = [];

  if (req.user.role === 'headquarters') {
    rankingRegions = provinces.map(p => ({ code: p.code, name: p.name, type: 'province' as const }));
  } else if (req.user.role === 'province') {
    const province = provinces.find(p => p.code === req.user!.regionCode.substring(0, 6));
    if (province) {
      rankingRegions = province.cities.map(c => ({ code: c.code, name: c.name, type: 'city' as const }));
    }
  } else {
    res.status(403).json({ success: false, error: '市级用户无排名权限' });
    return;
  }

  const ranking = rankingRegions.map(region => {
    const latestMetrics = getLatestMetricsByRegion(region.code);
    const agg = aggregateMetrics(latestMetrics);

    const coverageScore = agg.signalCoverage * 0.3;
    const dropRateScore = Math.max(0, (10 - agg.dropRate) * 10 * 0.3);
    const speedScore = Math.min(100, agg.avgDownloadSpeed) * 0.2;
    const satisfactionScore = agg.satisfactionScore * 0.2;
    const compositeScore = Math.round((coverageScore + dropRateScore + speedScore + satisfactionScore) * 100) / 100;

    return {
      regionCode: region.code,
      regionName: region.name,
      regionType: region.type,
      signalCoverage: agg.signalCoverage,
      dropRate: agg.dropRate,
      avgDownloadSpeed: agg.avgDownloadSpeed,
      satisfactionScore: agg.satisfactionScore,
      compositeScore,
    };
  });

  ranking.sort((a, b) => b.compositeScore - a.compositeScore);

  res.json({ success: true, data: ranking });
});

export default router;
