export type UserRole = 'headquarters' | 'province' | 'city';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  region: string;
  regionCode: string;
  avatar?: string;
}

export interface Province {
  code: string;
  name: string;
  cities: City[];
}

export interface City {
  code: string;
  name: string;
  provinceCode: string;
  districts: District[];
}

export interface District {
  code: string;
  name: string;
  cityCode: string;
}

export interface BaseStation {
  id: string;
  name: string;
  code: string;
  provinceCode: string;
  cityCode: string;
  districtCode: string;
  latitude: number;
  longitude: number;
  type: '4G' | '5G';
  status: 'online' | 'offline' | 'maintenance';
  capacity: number;
  currentLoad: number;
  signalStrength: number;
  createdAt: string;
}

export interface NetworkMetrics {
  id: string;
  regionCode: string;
  regionType: 'province' | 'city' | 'district';
  timestamp: string;
  timeSlot: string;
  signalCoverage: number;
  dropRate: number;
  avgDownloadSpeed: number;
  satisfactionScore: number;
  totalUsers: number;
  trafficVolume: number;
  complaintCount: number;
  dropCallCount: number;
  totalCallCount: number;
}

export type AlertLevel = 1 | 2;
export type AlertStatus = 'pending' | 'acknowledged' | 'reviewed' | 'approved' | 'rejected' | 'resolved';
export type AlertType = 'drop_rate' | 'complaint_surge';

export interface Alert {
  id: string;
  level: AlertLevel;
  type: AlertType;
  title: string;
  description: string;
  regionCode: string;
  regionName: string;
  regionType: 'province' | 'city' | 'district';
  triggerValue: number;
  threshold: number;
  startTime: string;
  duration: number;
  status: AlertStatus;
  approvalHistory: ApprovalStep[];
  assignedEngineer?: string;
  resolution?: string;
  resolvedAt?: string;
}

export interface ApprovalStep {
  id: string;
  alertId: string;
  level: 1 | 2 | 3;
  role: string;
  approver: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  approvedAt?: string;
}

export interface FaultRecord {
  id: string;
  stationId: string;
  stationName: string;
  type: 'hardware' | 'software' | 'power' | 'signal' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  startTime: string;
  resolvedTime?: string;
  status: 'open' | 'in_progress' | 'resolved';
  technician: string;
}

export interface CapacityPrediction {
  id: string;
  cityCode: string;
  cityName: string;
  predictedMonth: string;
  currentCapacity: number;
  predictedDemand: number;
  gap: number;
  gapPercentage: number;
  recommendedStations: RecommendedStation[];
  spectrumExpansionPriority: 'low' | 'medium' | 'high' | 'critical';
  scenario: string[];
}

export interface RecommendedStation {
  id: string;
  location: string;
  latitude: number;
  longitude: number;
  estimatedUsers: number;
  priority: 1 | 2 | 3 | 4 | 5;
  estimatedCost: number;
  type: '4G' | '5G';
  reason: string;
}

export interface WeeklyReport {
  id: string;
  regionCode: string;
  regionName: string;
  regionType: 'province' | 'city' | 'district';
  weekStart: string;
  weekEnd: string;
  generatedAt: string;
  metrics: {
    signalCoverage: { current: number; lastWeek: number; yearAgo: number; trend: 'up' | 'down' | 'stable' };
    dropRate: { current: number; lastWeek: number; yearAgo: number; trend: 'up' | 'down' | 'stable' };
    complaintRate: { current: number; lastWeek: number; yearAgo: number; trend: 'up' | 'down' | 'stable' };
    avgDownloadSpeed: { current: number; lastWeek: number; yearAgo: number; trend: 'up' | 'down' | 'stable' };
  };
  topIssues: string[];
  optimizationRecommendations: string[];
  maintenancePlan: { date: string; stations: string[]; type: string }[];
  alertSummary: { level1: number; level2: number; resolved: number; pending: number };
}

export interface StationLoadData {
  timestamp: string;
  load: number;
  users: number;
}

export interface DropCallDistribution {
  hour: number;
  count: number;
}

export interface ScenarioExtraction {
  type: 'residential' | 'commercial' | 'industrial' | 'transportation';
  name: string;
  estimatedUsers: number;
  area: string;
}
