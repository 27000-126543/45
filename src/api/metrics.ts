import api from './client';

export interface OverviewMetrics {
  signalCoverage: number;
  dropRate: number;
  avgDownloadSpeed: number;
  totalUsers: number;
  trafficVolume: number;
  complaintCount: number;
}

export interface TrendPoint {
  timestamp: string;
  signalCoverage: number;
  dropRate: number;
  avgDownloadSpeed: number;
}

export interface RankingItem {
  regionCode: string;
  regionName: string;
  signalCoverage: number;
  dropRate: number;
  rank: number;
}

const metricsApi = {
  async getOverview(regionCode?: string): Promise<OverviewMetrics> {
    const params = regionCode ? { regionCode } : {};
    return await api.get('/metrics/overview', { params });
  },

  async getTrend(regionCode?: string, hours: number = 24): Promise<TrendPoint[]> {
    const params: Record<string, any> = { hours };
    if (regionCode) params.regionCode = regionCode;
    return await api.get('/metrics/trend', { params });
  },

  async getRanking(): Promise<RankingItem[]> {
    return await api.get('/metrics/ranking');
  },
};

export default metricsApi;
