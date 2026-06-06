import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const breadcrumbMap: Record<string, string> = {
  '/dashboard': '核心看板',
  '/alerts': '预警管理',
  '/station': '基站详情',
  '/capacity': '容量预测',
  '/report': '运营周报',
};

const Breadcrumb: React.FC<{ currentPath: string }> = ({ currentPath }) => {
  const { getRegionName } = useApp();
  const baseKey = '/' + currentPath.split('/').filter(Boolean)[0];
  const label = breadcrumbMap[baseKey] || '未知页面';

  return (
    <div className="flex h-11 items-center gap-2 border-b border-telecom-border bg-[#0d1321]/40 px-6 text-sm">
      <Home size={14} className="text-slate-500" />
      <ChevronRight size={14} className="text-slate-600" />
      <span className="text-slate-400">{getRegionName()}</span>
      <ChevronRight size={14} className="text-slate-600" />
      <span className="text-white">{label}</span>
      <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
        <span>数据更新时间:</span>
        <span className="text-slate-300">{new Date().toLocaleString('zh-CN')}</span>
      </div>
    </div>
  );
};

export default Breadcrumb;
