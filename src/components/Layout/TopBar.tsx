import React, { useState } from 'react';
import { Bell, ChevronDown, Search, Globe, Shield } from 'lucide-react';
import { useApp, switchUserRole } from '../../context/AppContext';
import type { UserRole } from '../../types';

const TopBar: React.FC = () => {
  const { user, setUser, alerts } = useApp();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const pendingAlerts = alerts.filter(a => a.status === 'pending' || a.status === 'acknowledged').length;

  const roleLabels: Record<UserRole, string> = {
    headquarters: '总部管理员',
    province: '省级运营',
    city: '市级工程师',
  };

  const handleRoleSwitch = (role: UserRole) => {
    setUser(switchUserRole(role));
    setShowRoleMenu(false);
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-telecom-border bg-[#0d1321]/80 backdrop-blur px-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="搜索基站编号、城市、片区..."
            className="h-9 w-80 rounded-lg border border-telecom-border bg-slate-900/50 pl-9 pr-4 text-sm text-slate-200 placeholder-slate-500 outline-none transition focus:border-primary-500/50 focus:bg-slate-900"
          />
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-telecom-border bg-slate-900/50 px-3 py-1.5">
          <Globe size={14} className="text-slate-400" />
          <span className="text-sm text-slate-300">当前辖区:</span>
          <span className="text-sm font-medium text-white">{user.region}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-telecom-border bg-slate-900/50 text-slate-400 transition hover:bg-slate-800 hover:text-white">
          <Bell size={18} />
          {pendingAlerts > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {pendingAlerts}
            </span>
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 rounded-lg border border-telecom-border bg-slate-900/50 py-1.5 pl-1.5 pr-3 transition hover:bg-slate-800"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-primary-500 to-cyan-500 text-xs font-bold text-white">
              {user.name.charAt(0)}
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-white">{user.name}</div>
              <div className="text-[10px] text-slate-400">
                <Shield size={10} className="mr-1 inline" />
                {roleLabels[user.role]}
              </div>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-telecom-border bg-slate-900 py-1 shadow-2xl">
              <div className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                切换权限角色
              </div>
              {(Object.keys(roleLabels) as UserRole[]).map(role => (
                <button
                  key={role}
                  onClick={() => handleRoleSwitch(role)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition ${
                    user.role === role
                      ? 'bg-primary-500/10 text-primary-400'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Shield size={14} />
                  {roleLabels[role]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
