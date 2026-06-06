import type { User } from '../types/index.js';

export const users: User[] = [
  {
    id: 'U001',
    username: 'zhangwei',
    name: '张伟',
    role: 'headquarters',
    regionCode: 'HQ',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangwei',
  },
  {
    id: 'U002',
    username: 'lina',
    name: '李娜',
    role: 'headquarters',
    regionCode: 'HQ',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lina',
  },
  {
    id: 'U003',
    username: 'wangqiang',
    name: '王强',
    role: 'province',
    regionCode: '440000',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangqiang',
  },
  {
    id: 'U004',
    username: 'liufang',
    name: '刘芳',
    role: 'province',
    regionCode: '320000',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=liufang',
  },
  {
    id: 'U005',
    username: 'chenming',
    name: '陈明',
    role: 'city',
    regionCode: '440100',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chenming',
  },
  {
    id: 'U006',
    username: 'zhaolei',
    name: '赵磊',
    role: 'city',
    regionCode: '320500',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhaolei',
  },
];

export function getUserById(id: string): User | undefined {
  return users.find(u => u.id === id);
}

export function getUserByUsername(username: string): User | undefined {
  return users.find(u => u.username === username);
}

export function getUsersByRole(role: User['role']): User[] {
  return users.filter(u => u.role === role);
}

export function getUsersByRegion(regionCode: string): User[] {
  return users.filter(u => u.regionCode === regionCode);
}
