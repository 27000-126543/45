import { format, formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export const formatNumber = (num: number, digits = 2): string => {
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
};

export const formatPercent = (num: number, digits = 2): string => {
  return `${formatNumber(num, digits)}%`;
};

export const formatSpeed = (mbps: number): string => {
  return `${formatNumber(mbps, 1)} Mbps`;
};

export const formatDateTime = (iso: string): string => {
  try {
    return format(new Date(iso), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN });
  } catch {
    return iso;
  }
};

export const formatTimeAgo = (iso: string): string => {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: zhCN });
  } catch {
    return iso;
  }
};

export const formatTraffic = (gb: number): string => {
  if (gb >= 1000) return `${formatNumber(gb / 1000, 2)} PB`;
  return `${formatNumber(gb, 0)} GB`;
};

export const formatCurrency = (amount: number): string => {
  return `¥${amount.toLocaleString('zh-CN')}`;
};

export const getCoverageColor = (coverage: number): string => {
  if (coverage >= 97) return '#10b981';
  if (coverage >= 95) return '#3b82f6';
  if (coverage >= 90) return '#f59e0b';
  return '#ef4444';
};

export const getDropRateColor = (rate: number): string => {
  if (rate <= 1) return '#10b981';
  if (rate <= 2) return '#3b82f6';
  if (rate <= 4) return '#f59e0b';
  return '#ef4444';
};

export const getStatusText = (status: string): string => {
  const map: Record<string, string> = {
    pending: '待处理',
    acknowledged: '工程师已确认',
    reviewed: '主管已复核',
    approved: '已批准',
    rejected: '已驳回',
    resolved: '已解决',
    open: '待处理',
    in_progress: '处理中',
    online: '在线',
    offline: '离线',
    maintenance: '维护中',
  };
  return map[status] || status;
};

export const getStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    acknowledged: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    reviewed: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    approved: 'bg-green-500/20 text-green-400 border-green-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
    resolved: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    open: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    online: 'bg-green-500/20 text-green-400',
    offline: 'bg-red-500/20 text-red-400',
    maintenance: 'bg-amber-500/20 text-amber-400',
  };
  return map[status] || 'bg-slate-500/20 text-slate-400';
};

export const getAlertTypeText = (type: string): string => {
  return type === 'drop_rate' ? '掉线率异常' : '投诉量突增';
};

export const getSeverityColor = (severity: string): string => {
  const map: Record<string, string> = {
    low: 'bg-slate-500/20 text-slate-400',
    medium: 'bg-amber-500/20 text-amber-400',
    high: 'bg-orange-500/20 text-orange-400',
    critical: 'bg-red-500/20 text-red-400',
  };
  return map[severity] || 'bg-slate-500/20 text-slate-400';
};

export const getPriorityColor = (priority: number): string => {
  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#f97316', '#ef4444'];
  return colors[priority - 1] || colors[2];
};

export const getTrendIcon = (trend: 'up' | 'down' | 'stable'): string => {
  if (trend === 'up') return '↑';
  if (trend === 'down') return '↓';
  return '→';
};

export const getTrendColor = (trend: 'up' | 'down' | 'stable', isGoodWhenDown = false): string => {
  if (trend === 'stable') return 'text-slate-400';
  if (isGoodWhenDown) return trend === 'down' ? 'text-green-400' : 'text-red-400';
  return trend === 'up' ? 'text-green-400' : 'text-red-400';
};
