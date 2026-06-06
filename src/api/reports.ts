import api from './client';

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

const reportsApi = {
  async getLatestReport(): Promise<WeeklyReport> {
    return await api.get('/reports/latest');
  },

  async getReports(regionCode?: string): Promise<WeeklyReport[]> {
    const params = regionCode ? { regionCode } : {};
    return await api.get('/reports', { params });
  },

  async generateReport(regionCode: string): Promise<WeeklyReport> {
    return await api.post('/reports/generate', { regionCode });
  },
};

export default reportsApi;
