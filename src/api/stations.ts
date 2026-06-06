import api from './client';

export interface Station {
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

export interface StationLoadData {
  timestamp: string;
  load: number;
  users: number;
}

export interface DropCallDistribution {
  hour: number;
  count: number;
}

export interface CityStationDetail {
  cityCode: string;
  cityName: string;
  totalStations: number;
  onlineCount: number;
  avgLoad: number;
  avgSignalStrength: number;
  stations: Station[];
}

const stationsApi = {
  async getStations(cityCode?: string): Promise<Station[]> {
    const params = cityCode ? { cityCode } : {};
    return await api.get('/stations', { params });
  },

  async getStation(id: string): Promise<Station> {
    return await api.get(`/stations/${id}`);
  },

  async getStationLoad7d(id: string): Promise<StationLoadData[]> {
    return await api.get(`/stations/${id}/load-7d`);
  },

  async getStationDropDistribution(id: string): Promise<DropCallDistribution[]> {
    return await api.get(`/stations/${id}/drop-distribution`);
  },

  async getCityStationDetail(cityCode: string): Promise<CityStationDetail> {
    return await api.get(`/stations/city/${cityCode}`);
  },
};

export default stationsApi;
