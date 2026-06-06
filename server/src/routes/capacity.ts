import { Router, Response } from 'express';
import { authenticate, canAccessRegion, AuthenticatedRequest } from '../middleware/auth.js';
import { getRegionName, getAllCities } from '../data/regions.js';
import type { CapacityPrediction, ScenarioExtraction, RecommendedStation } from '../types/index.js';

const router = Router();

const predictionHistory: CapacityPrediction[] = [];

function generateRecommendedStations(cityCode: string, count: number): RecommendedStation[] {
  const city = getAllCities().find(c => c.code === cityCode);
  const baseLat = city ? 30 + Math.random() * 10 : 30;
  const baseLng = city ? 110 + Math.random() * 10 : 110;
  const stations: RecommendedStation[] = [];
  const priorities: (1 | 2 | 3 | 4 | 5)[] = [5, 4, 3, 2, 1];
  const reasons = [
    '高密度住宅区，用户增长快',
    '商业中心话务量激增',
    '新开发区覆盖盲区',
    '交通枢纽容量不足',
    '工业园区信号弱覆盖',
  ];

  for (let i = 0; i < count; i++) {
    stations.push({
      id: `REC-${cityCode}-${i + 1}`,
      location: `${getRegionName(cityCode)}推荐基站${i + 1}号`,
      latitude: Math.round((baseLat + (Math.random() - 0.5) * 0.5) * 10000) / 10000,
      longitude: Math.round((baseLng + (Math.random() - 0.5) * 0.5) * 10000) / 10000,
      estimatedUsers: Math.floor(2000 + Math.random() * 8000),
      priority: priorities[i % 5],
      estimatedCost: Math.floor(200000 + Math.random() * 500000),
      type: Math.random() > 0.4 ? '5G' : '4G',
      reason: reasons[i % reasons.length],
    });
  }

  return stations;
}

function parseExcelMock(): ScenarioExtraction[] {
  const types: ScenarioExtraction['type'][] = ['residential', 'commercial', 'industrial', 'transportation'];
  const typeNames: Record<ScenarioExtraction['type'], string[]> = {
    residential: ['阳光花园小区', '幸福家园', '绿城花园', '万科城'],
    commercial: ['万象城商圈', '万达广场', 'CBD商务区', '步行街'],
    industrial: ['高新技术产业园', '经济开发区', '工业园A区', '制造基地'],
    transportation: ['高铁站', '地铁枢纽站', '国际机场', '长途客运站'],
  };
  const count = Math.floor(Math.random() * 3) + 2;
  const scenarios: ScenarioExtraction[] = [];

  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const names = typeNames[type];
    scenarios.push({
      type,
      name: names[Math.floor(Math.random() * names.length)],
      estimatedUsers: Math.floor(1000 + Math.random() * 15000),
      area: `${(Math.random() * 5 + 0.5).toFixed(2)}平方公里`,
    });
  }

  return scenarios;
}

router.post('/upload', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: '未认证' });
    return;
  }

  const scenarios = parseExcelMock();

  res.json({ success: true, data: scenarios });
});

router.post('/predict', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: '未认证' });
    return;
  }

  const { cityCode, scenarios } = req.body as { cityCode?: string; scenarios?: ScenarioExtraction[] };

  if (!cityCode) {
    res.status(400).json({ success: false, error: '缺少cityCode参数' });
    return;
  }

  if (!canAccessRegion(req.user, cityCode)) {
    res.status(403).json({ success: false, error: '无权限访问该区域' });
    return;
  }

  const cityName = getRegionName(cityCode);
  const scenarioList = scenarios || parseExcelMock();
  const totalEstimatedUsers = scenarioList.reduce((s, sc) => s + sc.estimatedUsers, 0);

  const currentCapacity = 50000 + Math.floor(Math.random() * 100000);
  const predictedDemand = currentCapacity + Math.floor(totalEstimatedUsers * (1 + Math.random() * 0.5));
  const gap = Math.max(0, predictedDemand - currentCapacity);
  const gapPercentage = currentCapacity > 0 ? Math.round((gap / currentCapacity) * 10000) / 100 : 0;

  let spectrumExpansionPriority: CapacityPrediction['spectrumExpansionPriority'] = 'low';
  if (gapPercentage >= 50) spectrumExpansionPriority = 'critical';
  else if (gapPercentage >= 30) spectrumExpansionPriority = 'high';
  else if (gapPercentage >= 15) spectrumExpansionPriority = 'medium';

  const recommendedStationsCount = Math.ceil(gap / 5000);
  const recommendedStations = generateRecommendedStations(cityCode, Math.min(recommendedStationsCount, 5));

  const prediction: CapacityPrediction = {
    id: `PRED-${Date.now()}`,
    cityCode,
    cityName,
    predictedMonth: new Date().toISOString().slice(0, 7),
    currentCapacity,
    predictedDemand,
    gap,
    gapPercentage,
    recommendedStations,
    spectrumExpansionPriority,
    scenario: scenarioList.map(s => s.name),
  };

  predictionHistory.unshift(prediction);

  res.json({ success: true, data: prediction });
});

router.get('/history', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: '未认证' });
    return;
  }

  const filtered = predictionHistory.filter(p => canAccessRegion(req.user!, p.cityCode));

  res.json({ success: true, data: filtered });
});

export default router;
