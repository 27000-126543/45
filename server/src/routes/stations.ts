import { Router, Response } from 'express';
import { baseStations } from '../store/index.js';
import { authenticate, canAccessRegion, AuthenticatedRequest } from '../middleware/auth.js';
import { getStationsByCity, getStationById } from '../data/stations.js';
import { getRegionName } from '../data/regions.js';
import type { StationLoadData, DropCallDistribution, FaultRecord, Station } from '../types/index.js';

const router = Router();

function generateLoad7d(station: Station): StationLoadData[] {
  const data: StationLoadData[] = [];
  const now = Date.now();
  const baseLoad = station.currentLoad;

  for (let day = 6; day >= 0; day--) {
    for (let hour = 0; hour < 24; hour++) {
      const timestamp = new Date(now - day * 24 * 3600 * 1000 + hour * 3600 * 1000).toISOString();
      const hourFactor = Math.sin((hour - 6) * Math.PI / 12) * 0.3 + 0.7;
      const dayFactor = 1 + (Math.random() - 0.5) * 0.2;
      const load = Math.round(baseLoad * hourFactor * dayFactor);
      const users = Math.round(load * 10 + Math.random() * 100);
      data.push({ timestamp, load: Math.max(0, load), users: Math.max(0, users) });
    }
  }

  return data;
}

function generateDropDistribution(): DropCallDistribution[] {
  const data: DropCallDistribution[] = [];
  for (let hour = 0; hour < 24; hour++) {
    const baseCount = hour >= 8 && hour <= 20 ? 5 : 2;
    const count = Math.max(0, Math.round(baseCount + (Math.random() - 0.5) * 4));
    data.push({ hour, count });
  }
  return data;
}

function generateFaultRecords(stationId: string, stationName: string): FaultRecord[] {
  const faultTypes: FaultRecord['type'][] = ['hardware', 'software', 'power', 'signal', 'other'];
  const severities: FaultRecord['severity'][] = ['low', 'medium', 'high', 'critical'];
  const statuses: FaultRecord['status'][] = ['open', 'in_progress', 'resolved'];
  const technicians = ['李工程师', '王技术员', '张工', '陈工', '刘工'];
  const records: FaultRecord[] = [];
  const count = Math.floor(Math.random() * 4) + 1;

  for (let i = 0; i < count; i++) {
    const startTime = new Date(Date.now() - Math.random() * 30 * 24 * 3600 * 1000).toISOString();
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const resolvedTime = status === 'resolved'
      ? new Date(new Date(startTime).getTime() + Math.random() * 48 * 3600 * 1000).toISOString()
      : undefined;

    records.push({
      id: `F-${stationId}-${i + 1}`,
      stationId,
      stationName,
      type: faultTypes[Math.floor(Math.random() * faultTypes.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      description: ['基站信号波动', '电源模块故障', '软件版本异常', '传输链路告警', '天线调整需求'][i % 5],
      startTime,
      resolvedTime,
      status,
      technician: technicians[Math.floor(Math.random() * technicians.length)],
    });
  }

  return records;
}

router.get('/', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: '未认证' });
    return;
  }

  const { cityCode } = req.query as { cityCode?: string };

  let stationsList: Station[];

  if (cityCode) {
    if (!canAccessRegion(req.user, cityCode)) {
      res.status(403).json({ success: false, error: '无权限访问该区域' });
      return;
    }
    stationsList = getStationsByCity(cityCode);
  } else {
    stationsList = baseStations.filter(s => canAccessRegion(req.user!, s.cityCode));
  }

  res.json({ success: true, data: stationsList });
});

router.get('/:id', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: '未认证' });
    return;
  }

  const { id } = req.params;
  const station = getStationById(id);

  if (!station) {
    res.status(404).json({ success: false, error: '基站不存在' });
    return;
  }

  if (!canAccessRegion(req.user, station.cityCode)) {
    res.status(403).json({ success: false, error: '无权限访问该基站' });
    return;
  }

  res.json({ success: true, data: station });
});

router.get('/:id/load-7d', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: '未认证' });
    return;
  }

  const { id } = req.params;
  const station = getStationById(id);

  if (!station) {
    res.status(404).json({ success: false, error: '基站不存在' });
    return;
  }

  if (!canAccessRegion(req.user, station.cityCode)) {
    res.status(403).json({ success: false, error: '无权限访问该基站' });
    return;
  }

  const loadData = generateLoad7d(station);

  res.json({ success: true, data: loadData });
});

router.get('/:id/drop-distribution', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: '未认证' });
    return;
  }

  const { id } = req.params;
  const station = getStationById(id);

  if (!station) {
    res.status(404).json({ success: false, error: '基站不存在' });
    return;
  }

  if (!canAccessRegion(req.user, station.cityCode)) {
    res.status(403).json({ success: false, error: '无权限访问该基站' });
    return;
  }

  const distribution = generateDropDistribution();

  res.json({ success: true, data: distribution });
});

router.get('/city/:cityCode', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: '未认证' });
    return;
  }

  const { cityCode } = req.params;

  if (!canAccessRegion(req.user, cityCode)) {
    res.status(403).json({ success: false, error: '无权限访问该城市' });
    return;
  }

  const stationsList = getStationsByCity(cityCode);
  const cityName = getRegionName(cityCode);

  const data = stationsList.map(station => ({
    ...station,
    load7d: generateLoad7d(station),
    dropDistribution: generateDropDistribution(),
    faultRecords: generateFaultRecords(station.id, station.name),
  }));

  res.json({
    success: true,
    data: {
      cityCode,
      cityName,
      stations: data,
    },
  });
});

export default router;
