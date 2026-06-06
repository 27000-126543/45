import type {
  Province,
  BaseStation,
  NetworkMetrics,
  Alert,
  FaultRecord,
  CapacityPrediction,
  WeeklyReport,
  StationLoadData,
  DropCallDistribution,
  User,
} from '../types';

export const mockUser: User = {
  id: 'u001',
  name: '张工程师',
  role: 'headquarters',
  region: '全国',
  regionCode: 'CN',
};

export const provinces: Province[] = [
  {
    code: '110000',
    name: '北京市',
    cities: [
      {
        code: '110000',
        name: '北京市',
        provinceCode: '110000',
        districts: [
          { code: '110101', name: '东城区', cityCode: '110000' },
          { code: '110102', name: '西城区', cityCode: '110000' },
          { code: '110105', name: '朝阳区', cityCode: '110000' },
          { code: '110106', name: '丰台区', cityCode: '110000' },
          { code: '110108', name: '海淀区', cityCode: '110000' },
        ],
      },
    ],
  },
  {
    code: '310000',
    name: '上海市',
    cities: [
      {
        code: '310000',
        name: '上海市',
        provinceCode: '310000',
        districts: [
          { code: '310101', name: '黄浦区', cityCode: '310000' },
          { code: '310104', name: '徐汇区', cityCode: '310000' },
          { code: '310105', name: '长宁区', cityCode: '310000' },
          { code: '310106', name: '静安区', cityCode: '310000' },
          { code: '310110', name: '杨浦区', cityCode: '310000' },
          { code: '310115', name: '浦东新区', cityCode: '310000' },
        ],
      },
    ],
  },
  {
    code: '440000',
    name: '广东省',
    cities: [
      {
        code: '440100',
        name: '广州市',
        provinceCode: '440000',
        districts: [
          { code: '440103', name: '荔湾区', cityCode: '440100' },
          { code: '440104', name: '越秀区', cityCode: '440100' },
          { code: '440105', name: '海珠区', cityCode: '440100' },
          { code: '440106', name: '天河区', cityCode: '440100' },
        ],
      },
      {
        code: '440300',
        name: '深圳市',
        provinceCode: '440000',
        districts: [
          { code: '440303', name: '罗湖区', cityCode: '440300' },
          { code: '440304', name: '福田区', cityCode: '440300' },
          { code: '440305', name: '南山区', cityCode: '440300' },
          { code: '440306', name: '宝安区', cityCode: '440300' },
        ],
      },
      {
        code: '440600',
        name: '佛山市',
        provinceCode: '440000',
        districts: [
          { code: '440604', name: '禅城区', cityCode: '440600' },
          { code: '440605', name: '南海区', cityCode: '440600' },
        ],
      },
    ],
  },
  {
    code: '330000',
    name: '浙江省',
    cities: [
      {
        code: '330100',
        name: '杭州市',
        provinceCode: '330000',
        districts: [
          { code: '330102', name: '上城区', cityCode: '330100' },
          { code: '330105', name: '拱墅区', cityCode: '330100' },
          { code: '330106', name: '西湖区', cityCode: '330100' },
          { code: '330108', name: '滨江区', cityCode: '330100' },
        ],
      },
      {
        code: '330200',
        name: '宁波市',
        provinceCode: '330000',
        districts: [
          { code: '330203', name: '海曙区', cityCode: '330200' },
          { code: '330205', name: '江北区', cityCode: '330200' },
        ],
      },
    ],
  },
  {
    code: '320000',
    name: '江苏省',
    cities: [
      {
        code: '320100',
        name: '南京市',
        provinceCode: '320000',
        districts: [
          { code: '320102', name: '玄武区', cityCode: '320100' },
          { code: '320104', name: '秦淮区', cityCode: '320100' },
          { code: '320105', name: '建邺区', cityCode: '320100' },
          { code: '320106', name: '鼓楼区', cityCode: '320100' },
        ],
      },
      {
        code: '320500',
        name: '苏州市',
        provinceCode: '320000',
        districts: [
          { code: '320505', name: '虎丘区', cityCode: '320500' },
          { code: '320506', name: '吴中区', cityCode: '320500' },
          { code: '320507', name: '相城区', cityCode: '320500' },
        ],
      },
    ],
  },
  {
    code: '510000',
    name: '四川省',
    cities: [
      {
        code: '510100',
        name: '成都市',
        provinceCode: '510000',
        districts: [
          { code: '510104', name: '锦江区', cityCode: '510100' },
          { code: '510105', name: '青羊区', cityCode: '510100' },
          { code: '510106', name: '金牛区', cityCode: '510100' },
          { code: '510107', name: '武侯区', cityCode: '510100' },
        ],
      },
    ],
  },
  {
    code: '420000',
    name: '湖北省',
    cities: [
      {
        code: '420100',
        name: '武汉市',
        provinceCode: '420000',
        districts: [
          { code: '420102', name: '江岸区', cityCode: '420100' },
          { code: '420103', name: '江汉区', cityCode: '420100' },
          { code: '420104', name: '硚口区', cityCode: '420100' },
          { code: '420106', name: '武昌区', cityCode: '420100' },
        ],
      },
    ],
  },
  {
    code: '610000',
    name: '陕西省',
    cities: [
      {
        code: '610100',
        name: '西安市',
        provinceCode: '610000',
        districts: [
          { code: '610102', name: '新城区', cityCode: '610100' },
          { code: '610103', name: '碑林区', cityCode: '610100' },
          { code: '610104', name: '莲湖区', cityCode: '610100' },
          { code: '610113', name: '雁塔区', cityCode: '610100' },
        ],
      },
    ],
  },
];

export const baseStations: BaseStation[] = (() => {
  const stations: BaseStation[] = [];
  const latLonMap: Record<string, { lat: number; lon: number }> = {
    '110105': { lat: 39.9219, lon: 116.4435 },
    '110108': { lat: 39.9593, lon: 116.2984 },
    '310115': { lat: 31.2455, lon: 121.5677 },
    '310104': { lat: 31.1880, lon: 121.4372 },
    '440305': { lat: 22.5333, lon: 113.9304 },
    '440304': { lat: 22.5214, lon: 114.0547 },
    '440106': { lat: 23.1345, lon: 113.3630 },
    '330106': { lat: 30.2741, lon: 120.1551 },
    '320106': { lat: 32.0709, lon: 118.7781 },
    '510107': { lat: 30.6473, lon: 104.0435 },
  };

  Object.entries(latLonMap).forEach(([districtCode, coords], idx) => {
    for (let i = 0; i < 8; i++) {
      const type: '4G' | '5G' = i % 3 === 0 ? '5G' : '4G';
      const statusRand = Math.random();
      const status: 'online' | 'offline' | 'maintenance' =
        statusRand > 0.95 ? 'offline' : statusRand > 0.9 ? 'maintenance' : 'online';
      stations.push({
        id: `BS-${districtCode}-${String(i).padStart(3, '0')}`,
        name: `基站${['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'][i]}${idx + 1}`,
        code: `BS${districtCode}${String(i).padStart(3, '0')}`,
        provinceCode: districtCode.slice(0, 2) + '0000',
        cityCode: districtCode.slice(0, 4) + '00',
        districtCode,
        latitude: coords.lat + (Math.random() - 0.5) * 0.05,
        longitude: coords.lon + (Math.random() - 0.5) * 0.05,
        type,
        status,
        capacity: 5000 + Math.floor(Math.random() * 15000),
        currentLoad: Math.floor(2000 + Math.random() * 12000),
        signalStrength: 75 + Math.floor(Math.random() * 25),
        createdAt: '2023-01-15',
      });
    }
  });
  return stations;
})();

export const generateMetrics = (regionCode: string, regionType: 'province' | 'city' | 'district'): NetworkMetrics[] => {
  const metrics: NetworkMetrics[] = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 3600 * 1000);
    metrics.push({
      id: `m-${regionCode}-${t.getTime()}`,
      regionCode,
      regionType,
      timestamp: t.toISOString(),
      timeSlot: `${String(t.getHours()).padStart(2, '0')}:00`,
      signalCoverage: 92 + Math.random() * 7,
      dropRate: 0.5 + Math.random() * 4.5,
      avgDownloadSpeed: 40 + Math.random() * 80,
      satisfactionScore: 78 + Math.random() * 20,
      totalUsers: Math.floor(500000 + Math.random() * 2000000),
      trafficVolume: Math.floor(10000 + Math.random() * 50000),
      complaintCount: Math.floor(5 + Math.random() * 50),
      dropCallCount: Math.floor(100 + Math.random() * 2000),
      totalCallCount: Math.floor(50000 + Math.random() * 200000),
    });
  }
  return metrics;
};

export const alerts: Alert[] = [
  {
    id: 'alert-001',
    level: 2,
    type: 'drop_rate',
    title: '朝阳区连续2小时掉线率超过5%',
    description: '北京朝阳区自08:00起掉线率持续高于阈值5%，当前达6.8%，已触发二级预警，需启动紧急扩容或参数调优方案。',
    regionCode: '110105',
    regionName: '朝阳区',
    regionType: 'district',
    triggerValue: 6.8,
    threshold: 5,
    startTime: '2026-06-06T08:00:00Z',
    duration: 120,
    status: 'acknowledged',
    approvalHistory: [
      { id: 'ap-1', alertId: 'alert-001', level: 1, role: '区域网络优化工程师', approver: '李工', status: 'approved', comment: '确认为小区切换参数异常，已提交调优方案', approvedAt: '2026-06-06T09:30:00Z' },
      { id: 'ap-2', alertId: 'alert-001', level: 2, role: '区域主管', approver: '王主管', status: 'pending' },
      { id: 'ap-3', alertId: 'alert-001', level: 3, role: '总部网络部', approver: '', status: 'pending' },
    ],
    assignedEngineer: '李工',
  },
  {
    id: 'alert-002',
    level: 1,
    type: 'complaint_surge',
    title: '南山区投诉量环比突增42%',
    description: '深圳南山区近1小时用户投诉工单45件，较上周同期环比增长42%，主要集中在地铁2号线沿线信号弱。',
    regionCode: '440305',
    regionName: '南山区',
    regionType: 'district',
    triggerValue: 42,
    threshold: 30,
    startTime: '2026-06-06T09:00:00Z',
    duration: 45,
    status: 'pending',
    approvalHistory: [],
  },
  {
    id: 'alert-003',
    level: 1,
    type: 'drop_rate',
    title: '西湖区掉线率接近阈值',
    description: '杭州西湖区近45分钟掉线率波动在4.3%-4.9%之间，需密切关注。',
    regionCode: '330106',
    regionName: '西湖区',
    regionType: 'district',
    triggerValue: 4.9,
    threshold: 5,
    startTime: '2026-06-06T09:15:00Z',
    duration: 30,
    status: 'acknowledged',
    approvalHistory: [],
    assignedEngineer: '陈工',
  },
  {
    id: 'alert-004',
    level: 2,
    type: 'complaint_surge',
    title: '浦东新区投诉量持续增长超2小时',
    description: '上海浦东新区投诉工单连续2小时环比增长超30%，当前增长58%，升级为二级预警。',
    regionCode: '310115',
    regionName: '浦东新区',
    regionType: 'district',
    triggerValue: 58,
    threshold: 30,
    startTime: '2026-06-06T07:30:00Z',
    duration: 150,
    status: 'reviewed',
    approvalHistory: [
      { id: 'ap-4', alertId: 'alert-004', level: 1, role: '区域网络优化工程师', approver: '赵工', status: 'approved', comment: '建议在陆家嘴区域临时增设3个5G微站', approvedAt: '2026-06-06T08:45:00Z' },
      { id: 'ap-5', alertId: 'alert-004', level: 2, role: '区域主管', approver: '孙主管', status: 'approved', comment: '同意方案，申请总部批准预算', approvedAt: '2026-06-06T09:50:00Z' },
      { id: 'ap-6', alertId: 'alert-004', level: 3, role: '总部网络部', approver: '', status: 'pending' },
    ],
    assignedEngineer: '赵工',
  },
  {
    id: 'alert-005',
    level: 1,
    type: 'drop_rate',
    title: '武侯区掉线率异常',
    description: '成都武侯区掉线率连续1小时达5.6%，用户反馈通话质量下降。',
    regionCode: '510107',
    regionName: '武侯区',
    regionType: 'district',
    triggerValue: 5.6,
    threshold: 5,
    startTime: '2026-06-06T10:00:00Z',
    duration: 20,
    status: 'resolved',
    approvalHistory: [],
    assignedEngineer: '周工',
    resolution: '重启核心网元后恢复正常，掉线率降至1.2%',
    resolvedAt: '2026-06-06T10:30:00Z',
  },
];

export const faultRecords: FaultRecord[] = [
  { id: 'f-001', stationId: 'BS-440305-002', stationName: '基站C1', type: 'hardware', severity: 'high', description: 'RRU单元告警，发射功率异常', startTime: '2026-06-05T14:30:00Z', resolvedTime: '2026-06-05T18:45:00Z', status: 'resolved', technician: '刘工' },
  { id: 'f-002', stationId: 'BS-110105-005', stationName: '基站F1', type: 'software', severity: 'medium', description: '基站软件版本异常，导致小区切换失败率升高', startTime: '2026-06-06T08:15:00Z', status: 'in_progress', technician: '李工' },
  { id: 'f-003', stationId: 'BS-310115-001', stationName: '基站A2', type: 'power', severity: 'critical', description: '市电中断，切换至电池供电', startTime: '2026-06-06T09:50:00Z', status: 'in_progress', technician: '王工' },
  { id: 'f-004', stationId: 'BS-330106-003', stationName: '基站C3', type: 'signal', severity: 'low', description: '天线方位角偏移，信号覆盖范围缩小', startTime: '2026-06-04T10:00:00Z', resolvedTime: '2026-06-04T15:30:00Z', status: 'resolved', technician: '陈工' },
  { id: 'f-005', stationId: 'BS-440305-007', stationName: '基站H1', type: 'hardware', severity: 'medium', description: '基带板温度过高', startTime: '2026-06-06T06:20:00Z', status: 'open', technician: '张工' },
];

export const capacityPredictions: CapacityPrediction[] = [
  {
    id: 'cp-001',
    cityCode: '440300',
    cityName: '深圳市',
    predictedMonth: '2026-07',
    currentCapacity: 850000,
    predictedDemand: 1020000,
    gap: 170000,
    gapPercentage: 20,
    recommendedStations: [
      { id: 'rs-1', location: '前海桂湾片区', latitude: 22.5266, longitude: 113.8996, estimatedUsers: 35000, priority: 1, estimatedCost: 850000, type: '5G', reason: '前海自贸区新建写字楼群，企业集中入驻' },
      { id: 'rs-2', location: '光明科学城', latitude: 22.7545, longitude: 113.9276, estimatedUsers: 28000, priority: 2, estimatedCost: 720000, type: '5G', reason: '科研园区及配套住宅交付使用' },
      { id: 'rs-3', location: '宝安沙井片区', latitude: 22.7287, longitude: 113.7889, estimatedUsers: 22000, priority: 3, estimatedCost: 580000, type: '4G', reason: '大型商业综合体开业' },
    ],
    spectrumExpansionPriority: 'high',
    scenario: ['前海自贸区写字楼群', '光明科学城', '宝安商业综合体'],
  },
  {
    id: 'cp-002',
    cityCode: '110000',
    cityName: '北京市',
    predictedMonth: '2026-07',
    currentCapacity: 1200000,
    predictedDemand: 1380000,
    gap: 180000,
    gapPercentage: 15,
    recommendedStations: [
      { id: 'rs-4', location: '朝阳区CBD东扩区', latitude: 39.9176, lon: 116.4603, estimatedUsers: 42000, priority: 1, estimatedCost: 920000, type: '5G', reason: 'CBD东扩区新增企业办公区' } as any,
      { id: 'rs-5', location: '海淀区永丰产业园', latitude: 40.0481, longitude: 116.2883, estimatedUsers: 30000, priority: 2, estimatedCost: 780000, type: '5G', reason: '科技园区二期建成入驻' },
    ],
    spectrumExpansionPriority: 'medium',
    scenario: ['CBD东扩区', '永丰产业园'],
  },
  {
    id: 'cp-003',
    cityCode: '330100',
    cityName: '杭州市',
    predictedMonth: '2026-07',
    currentCapacity: 620000,
    predictedDemand: 710000,
    gap: 90000,
    gapPercentage: 14.5,
    recommendedStations: [
      { id: 'rs-6', location: '余杭未来科技城', latitude: 30.2787, longitude: 120.0187, estimatedUsers: 25000, priority: 2, estimatedCost: 650000, type: '5G', reason: '阿里系新园区及周边住宅' },
    ],
    spectrumExpansionPriority: 'medium',
    scenario: ['未来科技城扩建'],
  },
];

export const weeklyReport: WeeklyReport = {
  id: 'wr-2026-w23',
  regionCode: 'CN',
  regionName: '全国',
  regionType: 'province',
  weekStart: '2026-06-01',
  weekEnd: '2026-06-07',
  generatedAt: '2026-06-06T10:00:00Z',
  metrics: {
    signalCoverage: { current: 96.8, lastWeek: 96.5, yearAgo: 95.2, trend: 'up' },
    dropRate: { current: 1.82, lastWeek: 1.95, yearAgo: 2.34, trend: 'down' },
    complaintRate: { current: 0.034, lastWeek: 0.038, yearAgo: 0.052, trend: 'down' },
    avgDownloadSpeed: { current: 82.5, lastWeek: 78.3, yearAgo: 56.8, trend: 'up' },
  },
  topIssues: [
    '北京朝阳区高掉线率持续存在，需重点优化参数配置',
    '深圳南山区地铁沿线信号弱覆盖，投诉量居高不下',
    '上海浦东新区陆家嘴区域容量瓶颈，高峰时段拥塞严重',
  ],
  optimizationRecommendations: [
    '调整朝阳区核心基站切换参数（A3/A5事件门限），预计可降低掉线率约30%',
    '地铁2号线新增5个泄露电缆段，增强隧道内信号覆盖',
    '陆家嘴区域实施载波聚合+Massive MIMO参数调优',
    '全国核心网元分批升级至最新软件版本V23.04',
  ],
  maintenancePlan: [
    { date: '2026-06-08', stations: ['BS-110105-002', 'BS-110105-005', 'BS-110108-001'], type: '预防性维护-天馈系统检查' },
    { date: '2026-06-09', stations: ['BS-440305-001', 'BS-440305-003', 'BS-440305-007'], type: '软件版本升级' },
    { date: '2026-06-10', stations: ['BS-310115-002', 'BS-310115-004', 'BS-310115-006'], type: '电源系统巡检' },
    { date: '2026-06-11', stations: ['BS-330106-001', 'BS-330106-002'], type: '天线方位角优化调整' },
  ],
  alertSummary: { level1: 12, level2: 3, resolved: 10, pending: 5 },
};

export const generateStationLoadData = (): StationLoadData[] => {
  const data: StationLoadData[] = [];
  const now = new Date();
  for (let d = 6; d >= 0; d--) {
    for (let h = 0; h < 24; h += 2) {
      const t = new Date(now.getTime() - d * 86400000 + h * 3600000);
      const baseLoad = h >= 9 && h <= 21 ? 70 : 35;
      data.push({
        timestamp: `${t.getMonth() + 1}/${t.getDate()} ${String(h).padStart(2, '0')}:00`,
        load: baseLoad + Math.random() * 25,
        users: Math.floor((baseLoad + Math.random() * 25) * 120),
      });
    }
  }
  return data;
};

export const generateDropCallDistribution = (): DropCallDistribution[] => {
  return Array.from({ length: 24 }, (_, i) => {
    let base = 5;
    if (i >= 8 && i <= 10) base = 35;
    else if (i >= 12 && i <= 14) base = 28;
    else if (i >= 18 && i <= 21) base = 45;
    else if (i >= 0 && i <= 6) base = 8;
    return { hour: i, count: Math.floor(base + Math.random() * 15) };
  });
};

export const provinceRanking = [
  { code: '110000', name: '北京市', coverage: 98.2, dropRate: 1.2, speed: 95.3, satisfaction: 92.5 },
  { code: '310000', name: '上海市', coverage: 97.8, dropRate: 1.4, speed: 92.1, satisfaction: 91.2 },
  { code: '440000', name: '广东省', coverage: 96.5, dropRate: 1.9, speed: 85.6, satisfaction: 88.7 },
  { code: '330000', name: '浙江省', coverage: 95.8, dropRate: 2.1, speed: 82.4, satisfaction: 87.5 },
  { code: '320000', name: '江苏省', coverage: 95.2, dropRate: 2.3, speed: 80.1, satisfaction: 86.8 },
  { code: '510000', name: '四川省', coverage: 93.4, dropRate: 2.8, speed: 72.5, satisfaction: 83.2 },
  { code: '420000', name: '湖北省', coverage: 92.8, dropRate: 3.1, speed: 70.3, satisfaction: 82.1 },
  { code: '610000', name: '陕西省', coverage: 91.5, dropRate: 3.4, speed: 68.7, satisfaction: 80.5 },
];

export const heatmapData = provinceRanking.map(p => ({
  ...p,
  x: 50 + Math.random() * 400,
  y: 50 + Math.random() * 300,
}));
