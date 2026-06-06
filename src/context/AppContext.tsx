import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { User, UserRole, Province, Alert, BaseStation, NetworkMetrics } from '../types';
import { mockUser, provinces, alerts as mockAlerts, baseStations, generateMetrics } from '../data/mockData';

interface AppState {
  user: User;
  setUser: (user: User) => void;
  viewLevel: 'country' | 'province' | 'city' | 'district';
  setViewLevel: (level: 'country' | 'province' | 'city' | 'district') => void;
  selectedProvinceCode: string | null;
  setSelectedProvinceCode: (code: string | null) => void;
  selectedCityCode: string | null;
  setSelectedCityCode: (code: string | null) => void;
  selectedDistrictCode: string | null;
  setSelectedDistrictCode: (code: string | null) => void;
  provinces: Province[];
  alerts: Alert[];
  updateAlert: (alertId: string, updates: Partial<Alert>) => void;
  approveAlert: (alertId: string, approvalLevel: 1 | 2 | 3, approver: string, comment?: string) => void;
  baseStations: BaseStation[];
  getMetrics: (regionCode: string, regionType: 'province' | 'city' | 'district') => NetworkMetrics[];
  getRegionName: () => string;
  canAccessRegion: (regionCode: string) => boolean;
}

const AppContext = createContext<AppState | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(mockUser);
  const [viewLevel, setViewLevel] = useState<'country' | 'province' | 'city' | 'district'>('country');
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string | null>(null);
  const [selectedCityCode, setSelectedCityCode] = useState<string | null>(null);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);

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

  const getMetrics = useCallback((regionCode: string, regionType: 'province' | 'city' | 'district') => {
    return generateMetrics(regionCode, regionType);
  }, []);

  const getRegionName = useCallback((): string => {
    if (user.role === 'headquarters') return '全国';
    if (selectedDistrictCode) {
      for (const p of provinces) {
        for (const c of p.cities) {
          const d = c.districts.find(d => d.code === selectedDistrictCode);
          if (d) return d.name;
        }
      }
    }
    if (selectedCityCode) {
      for (const p of provinces) {
        const c = p.cities.find(c => c.code === selectedCityCode);
        if (c) return c.name;
      }
    }
    if (selectedProvinceCode) {
      const p = provinces.find(p => p.code === selectedProvinceCode);
      if (p) return p.name;
    }
    return user.region;
  }, [user, selectedProvinceCode, selectedCityCode, selectedDistrictCode]);

  const canAccessRegion = useCallback((regionCode: string): boolean => {
    if (user.role === 'headquarters') return true;
    if (user.role === 'province') return regionCode.startsWith(user.regionCode.slice(0, 2));
    if (user.role === 'city') return regionCode.startsWith(user.regionCode.slice(0, 4));
    return false;
  }, [user]);

  const value = useMemo<AppState>(() => ({
    user,
    setUser,
    viewLevel,
    setViewLevel,
    selectedProvinceCode,
    setSelectedProvinceCode,
    selectedCityCode,
    setSelectedCityCode,
    selectedDistrictCode,
    setSelectedDistrictCode,
    provinces,
    alerts,
    updateAlert,
    approveAlert,
    baseStations,
    getMetrics,
    getRegionName,
    canAccessRegion,
  }), [user, viewLevel, selectedProvinceCode, selectedCityCode, selectedDistrictCode, alerts, updateAlert, approveAlert, getMetrics, getRegionName, canAccessRegion]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};

export const switchUserRole = (role: UserRole): User => {
  const users: Record<UserRole, User> = {
    headquarters: mockUser,
    province: { id: 'u002', name: '王省经理', role: 'province', region: '广东省', regionCode: '440000' },
    city: { id: 'u003', name: '李市工程师', role: 'city', region: '深圳市', regionCode: '440300' },
  };
  return users[role];
};
