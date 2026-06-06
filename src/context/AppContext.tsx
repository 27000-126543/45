import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import type {
  User,
  UserRole,
  Province,
  City,
  District,
  Alert,
  BaseStation,
  NetworkMetrics,
  Region,
  RegionTreeNode,
  OverviewMetrics,
  TrendPoint,
  RankingItem,
  ViewLevel,
  ApprovalStep,
} from '../types';
import authApi from '../api/auth';
import metricsApi from '../api/metrics';
import alertsApi from '../api/alerts';
import regionsApi from '../api/regions';
import stationsApi from '../api/stations';
import useWebSocket, { WSMessage } from '../hooks/useWebSocket';

const ROLE_CREDENTIALS: Record<UserRole, { username: string; password: string }> = {
  headquarters: { username: 'zhangwei', password: 'zhangwei123' },
  province: { username: 'wangqiang', password: 'wangqiang123' },
  city: { username: 'chenming', password: 'chenming123' },
};

interface AppState {
  user: User | null;
  loading: boolean;
  overviewMetrics: OverviewMetrics | null;
  trendData: TrendPoint[];
  ranking: RankingItem[];
  alerts: Alert[];
  regions: Region[];
  selectedRegionCode: string | null;
  viewLevel: ViewLevel;

  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  switchUserRole: (role: UserRole) => Promise<void>;
  setSelectedRegionCode: (code: string | null) => void;
  setViewLevel: (level: ViewLevel) => void;

  provinces: Province[];
  setUser: (user: User) => void;
  selectedProvinceCode: string | null;
  setSelectedProvinceCode: (code: string | null) => void;
  selectedCityCode: string | null;
  setSelectedCityCode: (code: string | null) => void;
  selectedDistrictCode: string | null;
  setSelectedDistrictCode: (code: string | null) => void;
  updateAlert: (alertId: string, updates: Partial<Alert>) => void;
  approveAlert: (alertId: string, approvalLevel: 1 | 2 | 3, approver: string, comment?: string) => void;
  baseStations: BaseStation[];
  getMetrics: (regionCode: string, regionType: 'province' | 'city' | 'district') => NetworkMetrics[];
  getRegionName: () => string;
  canAccessRegion: (regionCode: string) => boolean;
  refreshAllData: () => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);

const buildRegionTree = (flatRegions: Region[]): RegionTreeNode[] => {
  const map = new Map<string, RegionTreeNode>();
  const roots: RegionTreeNode[] = [];

  flatRegions.forEach(r => {
    map.set(r.code, { ...r, children: [] });
  });

  flatRegions.forEach(r => {
    const node = map.get(r.code)!;
    if (r.parentCode && map.has(r.parentCode)) {
      map.get(r.parentCode)!.children!.push(node);
    } else if (r.type === 'province') {
      roots.push(node);
    }
  });

  return roots;
};

const convertToProvinces = (regions: Region[]): Province[] => {
  const tree = buildRegionTree(regions);
  return tree.map(p => ({
    code: p.code,
    name: p.name,
    cities: (p.children || []).map(c => ({
      code: c.code,
      name: c.name,
      provinceCode: p.code,
      districts: (c.children || []).map(d => ({
        code: d.code,
        name: d.name,
        cityCode: c.code,
      })),
    })),
  }));
};

const findRegionName = (regions: Region[], code: string | null): string => {
  if (!code) return '';
  const r = regions.find(x => x.code === code);
  return r?.name || '';
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [overviewMetrics, setOverviewMetrics] = useState<OverviewMetrics | null>(null);
  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegionCode, setSelectedRegionCode] = useState<string | null>(null);
  const [viewLevel, setViewLevel] = useState<ViewLevel>('country');
  const [baseStations, setBaseStations] = useState<BaseStation[]>([]);

  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string | null>(null);
  const [selectedCityCode, setSelectedCityCode] = useState<string | null>(null);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<string | null>(null);

  const { lastMessage } = useWebSocket();

  const provinces = useMemo(() => convertToProvinces(regions), [regions]);

  const loadAllData = useCallback(async (regionCode?: string) => {
    try {
      const [metrics, trend, rank, alertList, regionList, stations] = await Promise.all([
        metricsApi.getOverview(regionCode || undefined).catch(() => null),
        metricsApi.getTrend(regionCode || undefined).catch(() => []),
        metricsApi.getRanking().catch(() => []),
        alertsApi.getAlerts().catch(() => []),
        regionsApi.getRegions().catch(() => []),
        stationsApi.getStations().catch(() => []),
      ]);

      if (metrics) setOverviewMetrics(metrics);
      if (trend && trend.length > 0) {
        const enriched: TrendPoint[] = trend.map((t: any, idx) => ({
          timestamp: t.timestamp,
          signalCoverage: t.signalCoverage,
          dropRate: t.dropRate,
          avgDownloadSpeed: t.avgDownloadSpeed,
          timeSlot: t.timeSlot || `${String(idx).padStart(2, '0')}:00`,
          satisfactionScore: t.satisfactionScore ?? 80 + Math.random() * 18,
          totalUsers: t.totalUsers ?? Math.floor(500000 + Math.random() * 2000000),
          trafficVolume: t.trafficVolume ?? Math.floor(10000 + Math.random() * 50000),
          complaintCount: t.complaintCount ?? Math.floor(5 + Math.random() * 50),
          dropCallCount: t.dropCallCount ?? Math.floor(100 + Math.random() * 2000),
          totalCallCount: t.totalCallCount ?? Math.floor(50000 + Math.random() * 200000),
        }));
        setTrendData(enriched);
      }
      if (rank) setRanking(rank);
      if (alertList) {
        const normalized: Alert[] = alertList.map(a => ({
          ...a,
          status: (a.status === 'pending_ack' ? 'pending' : a.status === 'reviewing' ? 'reviewed' : a.status) as Alert['status'],
          approvalHistory: (a.approvalHistory || []) as ApprovalStep[],
        }));
        setAlerts(normalized);
      }
      if (regionList) setRegions(regionList);
      if (stations) setBaseStations(stations as unknown as BaseStation[]);
    } catch (e) {
      console.error('[AppContext] Failed to load data:', e);
    }
  }, []);

  const refreshAllData = useCallback(async () => {
    const activeCode = selectedDistrictCode || selectedCityCode || selectedProvinceCode || selectedRegionCode || undefined;
    await loadAllData(activeCode);
  }, [loadAllData, selectedDistrictCode, selectedCityCode, selectedProvinceCode, selectedRegionCode]);

  const initAuth = useCallback(async () => {
    setLoading(true);
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      const { username, password } = ROLE_CREDENTIALS.headquarters;
      const resp = await authApi.login(username, password);
      const loggedInUser: User = {
        id: resp.user.id,
        username: resp.user.username,
        name: resp.user.name,
        role: resp.user.role as UserRole,
        region: resp.user.region || (resp.user.role === 'headquarters' ? '全国' : ''),
        regionCode: resp.user.regionCode,
      };
      setUser(loggedInUser);
      await loadAllData();
    } catch (e) {
      console.error('[AppContext] Auth init failed:', e);
    } finally {
      setLoading(false);
    }
  }, [loadAllData]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!lastMessage) return;

    const msg = lastMessage as WSMessage;
    switch (msg.type) {
      case 'new_alert':
      case 'alert_updated': {
        const updatedAlert = msg.data as Alert;
        setAlerts(prev => {
          const exists = prev.find(a => a.id === updatedAlert.id);
          if (exists) {
            return prev.map(a => a.id === updatedAlert.id ? { ...a, ...updatedAlert } : a);
          }
          return [{ ...updatedAlert, approvalHistory: (updatedAlert as any).approvalHistory || [] }, ...prev];
        });
        break;
      }
      case 'alerts': {
        const list = msg.data as Alert[];
        setAlerts(list.map(a => ({ ...a, approvalHistory: (a as any).approvalHistory || [] })));
        break;
      }
      case 'new_metrics': {
        const data = msg.data;
        if (data.overview) setOverviewMetrics(data.overview);
        if (data.trend && Array.isArray(data.trend)) {
          setTrendData(prev => {
            const next = [...prev, ...data.trend];
            return next.slice(-48);
          });
        }
        if (data.ranking && Array.isArray(data.ranking)) {
          setRanking(data.ranking);
        }
        break;
      }
    }
  }, [lastMessage]);

  const login = useCallback(async (username: string, password: string) => {
    setLoading(true);
    try {
      const resp = await authApi.login(username, password);
      const loggedInUser: User = {
        id: resp.user.id,
        username: resp.user.username,
        name: resp.user.name,
        role: resp.user.role as UserRole,
        region: resp.user.region || (resp.user.role === 'headquarters' ? '全国' : ''),
        regionCode: resp.user.regionCode,
      };
      setUser(loggedInUser);
      setViewLevel(loggedInUser.role === 'headquarters' ? 'country' : (loggedInUser.role === 'province' ? 'province' : 'city'));
      setSelectedRegionCode(null);
      setSelectedProvinceCode(null);
      setSelectedCityCode(null);
      setSelectedDistrictCode(null);
      await loadAllData();
    } finally {
      setLoading(false);
    }
  }, [loadAllData]);

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
    setOverviewMetrics(null);
    setTrendData([]);
    setRanking([]);
    setAlerts([]);
    setSelectedRegionCode(null);
    setSelectedProvinceCode(null);
    setSelectedCityCode(null);
    setSelectedDistrictCode(null);
    setViewLevel('country');
  }, []);

  const switchUserRole = useCallback(async (role: UserRole) => {
    const creds = ROLE_CREDENTIALS[role];
    if (!creds) return;
    await login(creds.username, creds.password);
  }, [login]);

  const updateAlert = useCallback((alertId: string, updates: Partial<Alert>) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, ...updates } : a));
  }, []);

  const approveAlert = useCallback((alertId: string, approvalLevel: 1 | 2 | 3, approver: string, comment?: string) => {
    setAlerts(prev => prev.map(alert => {
      if (alert.id !== alertId) return alert;
      const newApprovalHistory = alert.approvalHistory.map(step => {
        if (step.level === approvalLevel) {
          return { ...step, status: 'approved' as const, approver, comment, approvedAt: new Date().toISOString() };
        }
        return step;
      });
      let newStatus = alert.status;
      if (approvalLevel === 1) newStatus = 'acknowledged';
      if (approvalLevel === 2) newStatus = 'reviewed';
      if (approvalLevel === 3) newStatus = 'approved';
      return { ...alert, approvalHistory: newApprovalHistory, status: newStatus };
    }));
  }, []);

  const getMetrics = useCallback((regionCode: string, regionType: 'province' | 'city' | 'district'): NetworkMetrics[] => {
    return trendData.map((t, idx) => ({
      id: `m-${regionCode}-${idx}`,
      regionCode,
      regionType,
      timestamp: t.timestamp,
      timeSlot: t.timeSlot || `${String(idx).padStart(2, '0')}:00`,
      signalCoverage: t.signalCoverage,
      dropRate: t.dropRate,
      avgDownloadSpeed: t.avgDownloadSpeed,
      satisfactionScore: t.satisfactionScore ?? 85,
      totalUsers: t.totalUsers ?? 1000000,
      trafficVolume: t.trafficVolume ?? 30000,
      complaintCount: t.complaintCount ?? 20,
      dropCallCount: t.dropCallCount ?? 500,
      totalCallCount: t.totalCallCount ?? 100000,
    }));
  }, [trendData]);

  const getRegionName = useCallback((): string => {
    if (!user) return '';
    if (user.role === 'headquarters') return '全国';
    if (selectedDistrictCode) return findRegionName(regions, selectedDistrictCode);
    if (selectedCityCode) return findRegionName(regions, selectedCityCode);
    if (selectedProvinceCode) return findRegionName(regions, selectedProvinceCode);
    return user.region || findRegionName(regions, user.regionCode);
  }, [user, regions, selectedProvinceCode, selectedCityCode, selectedDistrictCode]);

  const canAccessRegion = useCallback((regionCode: string): boolean => {
    if (!user) return false;
    if (user.role === 'headquarters') return true;
    if (user.role === 'province') return regionCode.startsWith(user.regionCode.slice(0, 2));
    if (user.role === 'city') return regionCode.startsWith(user.regionCode.slice(0, 4));
    return false;
  }, [user]);

  const handleSetSelectedRegionCode = useCallback((code: string | null) => {
    setSelectedRegionCode(code);
    if (code) {
      const r = regions.find(x => x.code === code);
      if (r) {
        if (r.type === 'province') {
          setSelectedProvinceCode(code);
          setSelectedCityCode(null);
          setSelectedDistrictCode(null);
          setViewLevel('province');
        } else if (r.type === 'city') {
          setSelectedCityCode(code);
          setSelectedDistrictCode(null);
          setViewLevel('city');
          const parent = regions.find(x => x.code === r.parentCode);
          if (parent) setSelectedProvinceCode(parent.code);
        } else if (r.type === 'district') {
          setSelectedDistrictCode(code);
          setViewLevel('district');
          const city = regions.find(x => x.code === r.parentCode);
          if (city) {
            setSelectedCityCode(city.code);
            const province = regions.find(x => x.code === city.parentCode);
            if (province) setSelectedProvinceCode(province.code);
          }
        }
      }
    } else {
      setSelectedProvinceCode(null);
      setSelectedCityCode(null);
      setSelectedDistrictCode(null);
    }
    loadAllData(code || undefined);
  }, [regions, loadAllData]);

  const value = useMemo<AppState>(() => ({
    user,
    loading,
    overviewMetrics,
    trendData,
    ranking,
    alerts,
    regions,
    selectedRegionCode,
    viewLevel,
    login,
    logout,
    switchUserRole,
    setSelectedRegionCode: handleSetSelectedRegionCode,
    setViewLevel,

    provinces,
    setUser,
    selectedProvinceCode,
    setSelectedProvinceCode,
    selectedCityCode,
    setSelectedCityCode,
    selectedDistrictCode,
    setSelectedDistrictCode,
    updateAlert,
    approveAlert,
    baseStations,
    getMetrics,
    getRegionName,
    canAccessRegion,
    refreshAllData,
  }), [
    user, loading, overviewMetrics, trendData, ranking, alerts, regions,
    selectedRegionCode, viewLevel, login, logout, switchUserRole,
    handleSetSelectedRegionCode, setViewLevel, provinces,
    selectedProvinceCode, selectedCityCode, selectedDistrictCode,
    updateAlert, approveAlert, baseStations, getMetrics, getRegionName,
    canAccessRegion, refreshAllData,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};
