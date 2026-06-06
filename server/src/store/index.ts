import type {
  RawStationMetrics,
  NetworkMetrics,
  Alert,
  AlertLevel,
} from '../types/index.js';
import { stations as stationData } from '../data/stations.js';
import { getRegionByCode, getRegionName as getRegionNameHelper } from '../data/regions.js';
import { users } from '../data/users.js';

const baseStations = stationData;

const rawMetrics: RawStationMetrics[] = [];
const aggregatedMetrics: NetworkMetrics[] = [];

const now = Date.now();
const fiveMinMs = 5 * 60 * 1000;

for (let i = 0; i < 20; i++) {
  const ts = new Date(now - (20 - i) * fiveMinMs).toISOString();
  ['110101', '440101', '310101'].forEach((code, idx) => {
    const regionName = getRegionNameHelper(code);
    aggregatedMetrics.push({
      regionCode: code,
      regionType: 'district',
      regionName,
      timestamp: ts,
      timeBucket: ts,
      signalCoverage: 88 + idx * 2,
      dropRate: 5.5 + Math.random() * 3,
      avgDownloadSpeed: 80 + idx * 20,
      satisfactionScore: 82 + idx * 3,
      stationCount: 3,
      totalSamples: 30,
      dataTrafficGB: 100 + idx * 50,
      complaintCount: 2 + idx,
      avgSignalStrength: -95 + idx * 3,
    });
  });
}

const initialAlerts: Alert[] = [
  {
    id: 'alert-demo-001',
    level: 1 as AlertLevel,
    type: 'drop_rate',
    title: '北京东城区连续1小时掉线率超过5%',
    description: '北京东城区最近1小时掉线率持续高于阈值5%，当前平均达6.8%，请及时处理。',
    regionCode: '110101',
    regionName: '东城区',
    regionType: 'district',
    triggerValue: 6.8,
    threshold: 5,
    startTime: new Date(now - 70 * 60 * 1000).toISOString(),
    duration: 70,
    status: 'pending_ack',
    approvalHistory: [],
    createdAt: new Date(now - 65 * 60 * 1000).toISOString(),
  },
  {
    id: 'alert-demo-002',
    level: 2 as AlertLevel,
    type: 'complaint_surge',
    title: '【升级】广州天河区投诉量环比突增45%',
    description: '广州天河区近1小时用户投诉8件，较前1小时环比增长45%，超过阈值30%。（预警已超过1小时未处理，自动升级为二级预警）',
    regionCode: '440101',
    regionName: '天河区',
    regionType: 'district',
    triggerValue: 45,
    threshold: 30,
    startTime: new Date(now - 130 * 60 * 1000).toISOString(),
    duration: 130,
    status: 'acknowledged',
    approvalHistory: [
      {
        step: 1,
        role: 'city',
        approverId: 'U003',
        approverName: '陈明',
        comment: '已确认该区域存在网络拥塞，正在排查基站负载异常',
        approvedAt: new Date(now - 50 * 60 * 1000).toISOString(),
        approved: true,
      },
    ],
    createdAt: new Date(now - 125 * 60 * 1000).toISOString(),
    upgradedAt: new Date(now - 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'alert-demo-003',
    level: 1 as AlertLevel,
    type: 'drop_rate',
    title: '上海黄浦区连续1小时掉线率超过5%',
    description: '上海黄浦区最近1小时掉线率持续高于阈值5%，当前平均达5.9%，请及时处理。',
    regionCode: '310101',
    regionName: '黄浦区',
    regionType: 'district',
    triggerValue: 5.9,
    threshold: 5,
    startTime: new Date(now - 65 * 60 * 1000).toISOString(),
    duration: 65,
    status: 'reviewing',
    approvalHistory: [
      {
        step: 1,
        role: 'city',
        approverId: 'U005',
        approverName: '林芳',
        comment: '已确认基站故障',
        approvedAt: new Date(now - 40 * 60 * 1000).toISOString(),
        approved: true,
      },
      {
        step: 2,
        role: 'province',
        approverId: 'U004',
        approverName: '李娜',
        comment: '已复核，建议紧急扩容',
        approvedAt: new Date(now - 20 * 60 * 1000).toISOString(),
        approved: true,
      },
    ],
    createdAt: new Date(now - 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'alert-demo-004',
    level: 1 as AlertLevel,
    type: 'complaint_surge',
    title: '北京西城区投诉量环比突增35%',
    description: '北京西城区近1小时用户投诉5件，较前1小时环比增长35%，超过阈值30%。',
    regionCode: '110102',
    regionName: '西城区',
    regionType: 'district',
    triggerValue: 35,
    threshold: 30,
    startTime: new Date(now - 40 * 60 * 1000).toISOString(),
    duration: 40,
    status: 'pending_ack',
    approvalHistory: [],
    createdAt: new Date(now - 35 * 60 * 1000).toISOString(),
  },
  {
    id: 'alert-demo-005',
    level: 2 as AlertLevel,
    type: 'drop_rate',
    title: '【升级】深圳南山区连续1小时掉线率超过5%',
    description: '深圳南山区最近1小时掉线率持续高于阈值5%，当前平均达7.2%。（预警已超过1小时未处理，自动升级为二级预警）',
    regionCode: '440301',
    regionName: '南山区',
    regionType: 'district',
    triggerValue: 7.2,
    threshold: 5,
    startTime: new Date(now - 150 * 60 * 1000).toISOString(),
    duration: 150,
    status: 'pending_ack',
    approvalHistory: [],
    createdAt: new Date(now - 145 * 60 * 1000).toISOString(),
    upgradedAt: new Date(now - 80 * 60 * 1000).toISOString(),
  },
];

const alerts: Alert[] = [...initialAlerts];

let wsClients: Set<any> = new Set();

const broadcast = (message: any) => {
  const data = JSON.stringify(message);
  wsClients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(data);
    }
  });
};

const addWsClient = (client: any) => {
  wsClients.add(client);
};

const removeWsClient = (client: any) => {
  wsClients.delete(client);
};

const getRegionName = (regionCode: string, regionType?: 'province' | 'city' | 'district'): string => {
  return getRegionNameHelper(regionCode);
};

const getRegionInfo = (regionCode: string) => {
  return getRegionByCode(regionCode);
};

export {
  baseStations,
  rawMetrics,
  aggregatedMetrics,
  alerts,
  users,
  broadcast,
  addWsClient,
  removeWsClient,
  getRegionName,
  getRegionInfo,
};
