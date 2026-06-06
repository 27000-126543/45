import React from 'react';
import {
  LayoutDashboard,
  AlertTriangle,
  Radio,
  BarChart3,
  FileText,
  Signal,
} from 'lucide-react';
import clsx from 'clsx';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: '核心看板', icon: <LayoutDashboard size={20} /> },
  { path: '/alerts', label: '预警管理', icon: <AlertTriangle size={20} /> },
  { path: '/station/440300', label: '基站详情', icon: <Radio size={20} /> },
  { path: '/capacity', label: '容量预测', icon: <BarChart3 size={20} /> },
  { path: '/report', label: '运营周报', icon: <FileText size={20} /> },
];

const Sidebar: React.FC<{ currentPath: string; navigate: (p: string) => void }> = ({ currentPath, navigate }) => {
  return (
    <aside className="flex h-full w-60 flex-col border-r border-telecom-border bg-[#0d1321]">
      <div className="flex h-16 items-center gap-3 border-b border-telecom-border px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-cyan-500">
          <Signal size={20} className="text-white" />
        </div>
        <div>
          <div className="text-sm font-bold text-white">电信网络智能分析</div>
          <div className="text-[10px] text-slate-400">Telecom Analytics</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-4 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          功能导航
        </div>
        {navItems.map(item => {
          const active = currentPath.startsWith(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={clsx(
                'mx-3 mb-1 flex w-[calc(100%-24px)] items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all',
                active
                  ? 'bg-primary-500/15 text-primary-400 shadow-[0_0_0_1px_rgba(59,130,246,0.25)]'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200',
              )}
            >
              <span className={active ? 'text-primary-400' : 'text-slate-500'}>{item.icon}</span>
              <span>{item.label}</span>
              {item.path === '/alerts' && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500/20 px-1.5 text-[10px] font-semibold text-red-400">
                  5
                </span>
              )}
            </button>
          );
        })}

        <div className="mt-6 px-4 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          系统状态
        </div>
        <div className="mx-3 rounded-lg border border-telecom-border bg-slate-900/40 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-slate-400">实时数据接入</span>
            <span className="relative flex h-2 w-2">
              <span className="pulse-dot absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </span>
          </div>
          <div className="text-[11px] text-slate-500">基站数据: 23,847</div>
          <div className="text-[11px] text-slate-500">指标采样率: 60s</div>
          <div className="mt-2 text-[11px] text-green-400">延迟: 120ms</div>
        </div>
      </nav>

      <div className="border-t border-telecom-border p-4">
        <div className="text-[10px] text-slate-500">版本 v1.0.0</div>
        <div className="text-[10px] text-slate-600">© 2026 电信网络运营部</div>
      </div>
    </aside>
  );
};

export default Sidebar;
