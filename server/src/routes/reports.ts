import { Router, Response } from 'express';
import { authenticate, canAccessRegion, AuthenticatedRequest } from '../middleware/auth.js';
import { getRegionName, getRegionByCode } from '../data/regions.js';
import type { WeeklyReport } from '../types/index.js';

const router = Router();

const reportsStore: WeeklyReport[] = [];

function generateTrend(current: number, delta: number): 'up' | 'down' | 'stable' {
  if (delta > 1) return 'up';
  if (delta < -1) return 'down';
  return 'stable';
}

function generateWeeklyReport(regionCode: string): WeeklyReport {
  const region = getRegionByCode(regionCode);
  const regionName = region?.name || getRegionName(regionCode);
  const regionType = region?.type || 'province';

  const now = new Date();
  const weekStart = new Date(now.getTime() - 7 * 24 * 3600 * 1000);

  const signalCoverageCurrent = 92 + Math.random() * 6;
  const signalCoverageLastWeek = signalCoverageCurrent + (Math.random() - 0.5) * 2;
  const signalCoverageYearAgo = signalCoverageCurrent + (Math.random() - 0.5) * 4;

  const dropRateCurrent = 1.5 + Math.random() * 2;
  const dropRateLastWeek = dropRateCurrent + (Math.random() - 0.5) * 0.5;
  const dropRateYearAgo = dropRateCurrent + (Math.random() - 0.5) * 1;

  const complaintRateCurrent = 0.5 + Math.random() * 1;
  const complaintRateLastWeek = complaintRateCurrent + (Math.random() - 0.5) * 0.3;
  const complaintRateYearAgo = complaintRateCurrent + (Math.random() - 0.5) * 0.5;

  const avgSpeedCurrent = 80 + Math.random() * 40;
  const avgSpeedLastWeek = avgSpeedCurrent + (Math.random() - 0.5) * 10;
  const avgSpeedYearAgo = avgSpeedCurrent + (Math.random() - 0.5) * 20;

  const topIssues = [
    '部分区域5G信号覆盖不足',
    '高峰期基站负载过高',
    '老旧基站设备老化问题',
    '个别区域投诉量上升',
    '传输链路容量瓶颈',
  ].slice(0, Math.floor(Math.random() * 3) + 2);

  const optimizationRecommendations = [
    '扩容高负载基站容量',
    '优化邻区切换参数',
    '新增弱覆盖区域基站',
    '升级老旧基站设备',
    '优化频率复用方案',
  ].slice(0, Math.floor(Math.random() * 3) + 2);

  const maintenancePlan: WeeklyReport['maintenancePlan'] = [];
  for (let i = 0; i < 3; i++) {
    const date = new Date(weekStart.getTime() + i * 2 * 24 * 3600 * 1000);
    maintenancePlan.push({
      date: date.toISOString().slice(0, 10),
      stations: [`ST-${String(1000 + i * 10).padStart(4, '0')}`, `ST-${String(1001 + i * 10).padStart(4, '0')}`],
      type: ['例行巡检', '硬件升级', '软件更新', '天线优化'][i % 4],
    });
  }

  const report: WeeklyReport = {
    id: `RPT-${regionCode}-${Date.now()}`,
    regionCode,
    regionName,
    regionType,
    weekStart: weekStart.toISOString().slice(0, 10),
    weekEnd: now.toISOString().slice(0, 10),
    generatedAt: now.toISOString(),
    metrics: {
      signalCoverage: {
        current: Math.round(signalCoverageCurrent * 100) / 100,
        lastWeek: Math.round(signalCoverageLastWeek * 100) / 100,
        yearAgo: Math.round(signalCoverageYearAgo * 100) / 100,
        trend: generateTrend(signalCoverageCurrent, signalCoverageCurrent - signalCoverageLastWeek),
      },
      dropRate: {
        current: Math.round(dropRateCurrent * 100) / 100,
        lastWeek: Math.round(dropRateLastWeek * 100) / 100,
        yearAgo: Math.round(dropRateYearAgo * 100) / 100,
        trend: generateTrend(dropRateCurrent, -(dropRateCurrent - dropRateLastWeek)),
      },
      complaintRate: {
        current: Math.round(complaintRateCurrent * 100) / 100,
        lastWeek: Math.round(complaintRateLastWeek * 100) / 100,
        yearAgo: Math.round(complaintRateYearAgo * 100) / 100,
        trend: generateTrend(complaintRateCurrent, -(complaintRateCurrent - complaintRateLastWeek)),
      },
      avgDownloadSpeed: {
        current: Math.round(avgSpeedCurrent * 100) / 100,
        lastWeek: Math.round(avgSpeedLastWeek * 100) / 100,
        yearAgo: Math.round(avgSpeedYearAgo * 100) / 100,
        trend: generateTrend(avgSpeedCurrent, avgSpeedCurrent - avgSpeedLastWeek),
      },
    },
    topIssues,
    optimizationRecommendations,
    maintenancePlan,
    alertSummary: {
      level1: Math.floor(Math.random() * 10),
      level2: Math.floor(Math.random() * 5),
      resolved: Math.floor(Math.random() * 8),
      pending: Math.floor(Math.random() * 5),
    },
  };

  return report;
}

router.get('/latest', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: '未认证' });
    return;
  }

  let regionCode = req.user.regionCode;

  if (req.user.role === 'headquarters') {
    regionCode = '440000';
  }

  const userReports = reportsStore.filter(r => canAccessRegion(req.user!, r.regionCode));

  if (userReports.length > 0) {
    userReports.sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));
    res.json({ success: true, data: userReports[0] });
    return;
  }

  const report = generateWeeklyReport(regionCode);
  reportsStore.push(report);

  res.json({ success: true, data: report });
});

router.get('/', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: '未认证' });
    return;
  }

  const { regionCode } = req.query as { regionCode?: string };

  let targetRegionCode = regionCode;
  if (!targetRegionCode) {
    targetRegionCode = req.user.role === 'headquarters' ? '440000' : req.user.regionCode;
  }

  if (!canAccessRegion(req.user, targetRegionCode)) {
    res.status(403).json({ success: false, error: '无权限访问该区域' });
    return;
  }

  let filtered = reportsStore.filter(r => r.regionCode === targetRegionCode);

  if (filtered.length === 0) {
    for (let i = 0; i < 4; i++) {
      const report = generateWeeklyReport(targetRegionCode);
      const weekOffset = i * 7 * 24 * 3600 * 1000;
      report.weekStart = new Date(new Date(report.weekStart).getTime() - weekOffset).toISOString().slice(0, 10);
      report.weekEnd = new Date(new Date(report.weekEnd).getTime() - weekOffset).toISOString().slice(0, 10);
      report.generatedAt = new Date(new Date(report.generatedAt).getTime() - weekOffset).toISOString();
      report.id = `RPT-${targetRegionCode}-${Date.now() - i}`;
      filtered.push(report);
    }
    reportsStore.push(...filtered);
  }

  filtered.sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));

  res.json({ success: true, data: filtered });
});

router.post('/generate', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: '未认证' });
    return;
  }

  const { regionCode } = req.body as { regionCode?: string };

  let targetRegionCode = regionCode;
  if (!targetRegionCode) {
    targetRegionCode = req.user.role === 'headquarters' ? '440000' : req.user.regionCode;
  }

  if (!canAccessRegion(req.user, targetRegionCode)) {
    res.status(403).json({ success: false, error: '无权限访问该区域' });
    return;
  }

  const report = generateWeeklyReport(targetRegionCode);
  reportsStore.push(report);

  res.json({ success: true, data: report });
});

export default router;
