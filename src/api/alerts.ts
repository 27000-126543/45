import api from './client';

export interface Alert {
  id: string;
  level: 1 | 2;
  type: 'drop_rate' | 'complaint_surge';
  title: string;
  description: string;
  regionCode: string;
  regionName: string;
  regionType: 'province' | 'city' | 'district';
  triggerValue: number;
  threshold: number;
  startTime: string;
  duration: number;
  status: 'pending_ack' | 'acknowledged' | 'reviewing' | 'approved' | 'rejected' | 'resolved';
  approvalHistory: any[];
  assignedEngineer?: string;
  resolution?: string;
  resolvedAt?: string;
  createdAt: string;
  upgradedAt?: string;
}

const alertsApi = {
  async getAlerts(status?: string): Promise<Alert[]> {
    const params = status ? { status } : {};
    return await api.get('/alerts', { params });
  },

  async getAlert(id: string): Promise<Alert> {
    return await api.get(`/alerts/${id}`);
  },

  async approveAlert(id: string, comment: string): Promise<Alert> {
    return await api.post(`/alerts/${id}/approve`, { comment });
  },

  async rejectAlert(id: string, comment: string): Promise<Alert> {
    return await api.post(`/alerts/${id}/reject`, { comment });
  },

  async resolveAlert(id: string, comment: string): Promise<Alert> {
    return await api.post(`/alerts/${id}/resolve`, { comment });
  },
};

export default alertsApi;
