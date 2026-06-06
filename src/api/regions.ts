import api from './client';

export interface Region {
  code: string;
  name: string;
  type: 'province' | 'city' | 'district';
  parentCode?: string;
}

const regionsApi = {
  async getRegions(): Promise<Region[]> {
    return await api.get('/regions');
  },

  async getRegion(code: string): Promise<Region> {
    return await api.get(`/regions/${code}`);
  },
};

export default regionsApi;
