import api from './client';

export interface CapacityPrediction {
  id: string;
  cityCode: string;
  cityName: string;
  predictedMonth: string;
  currentCapacity: number;
  predictedDemand: number;
  gap: number;
  gapPercentage: number;
  recommendedStations: any[];
  spectrumExpansionPriority: 'low' | 'medium' | 'high' | 'critical';
  scenario: string[];
}

export interface UploadResult {
  success: boolean;
  fileName: string;
  parsedScenarios: any[];
}

const capacityApi = {
  async uploadExcel(file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    return await api.post('/capacity/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async predictCapacity(cityCode: string, scenarios: string[]): Promise<CapacityPrediction> {
    return await api.post('/capacity/predict', { cityCode, scenarios });
  },

  async getPredictionHistory(): Promise<CapacityPrediction[]> {
    return await api.get('/capacity/history');
  },
};

export default capacityApi;
