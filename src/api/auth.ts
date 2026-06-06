import api from './client';

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    name: string;
    role: string;
    regionCode: string;
    region?: string;
  };
}

const authApi = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const data = (await api.post('/auth/login', { username, password })) as unknown as LoginResponse;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  async getMe(): Promise<LoginResponse['user']> {
    return await api.get('/auth/me');
  },
};

export default authApi;
