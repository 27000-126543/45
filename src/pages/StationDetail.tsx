import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Radio,
  Wifi,
  WifiOff,
  Wrench,
  Signal,
  Eye,
  Clock,
  User,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import Card from '@/components/UI/Card';
import { useApp } from '../context/AppContext';
import {
  generateStationLoadData,
  generateDropCallDistribution,
  faultRecords,
} from '../data/mockData';
import {
  formatNumber,
  formatPercent,
  getStatusColor,
  getStatusText,
  getSeverityColor,
  formatDateTime,
} from '../utils';

const getFaultTypeText = (type: string): string => {
  const map: Record<string, string> = {
    hardware: '硬件故障',
    software: '软件异常',
    power: '电源故障',
    signal: '信号异常',
    other: '其他故障',
  };
  return map[type] || type;
};

const getSeverityText = (severity: string): string => {
  const map: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
    critical: '严重',
  };
  return map[severity] || severity;
};

const StationDetail: React.FC = () => {
  const { cityCode } = useParams<{ cityCode: string }>();
  const navigate = useNavigate();
  const { baseStations, provinces } = useApp();

  const cityInfo = useMemo(() => {
    for (const p of provinces) {
      for (const c of p.cities) {
        if (c.code === cityCode) {
          return { provinceName: p.name, cityName: c.name };
        }
      }
    }
    return { provinceName: '', cityName: '未知城市' };
  }, [provinces, cityCode]);

  const cityStations = useMemo(() => {
    return baseStations.filter(s => s.cityCode === cityCode);
  }, [baseStations, cityCode]);

  const stats = useMemo(() => {
    const total = cityStations.length;
    const online = cityStations.filter(s => s.status === 'online').length;
    const offline = cityStations.filter(s => s.status === 'offline').length;
    const maintenance = cityStations.filter(s => s.status === 'maintenance').length;
    const fiveGCount = cityStations.filter(s => s.type === '5G').length;
    const fiveGRatio = total > 0 ? (fiveGCount / total) * 100 : 0;
    const avgSignal = total > 0
      ? cityStations.reduce((sum, s) => sum + s.signalStrength, 0) / total
      : 0;
    const avgLoad = total > 0
      ? cityStations.reduce((sum, s) => sum + (s.currentLoad / s.capacity) * 100, 0) / total
      : 0;
    return { total, online, offline, maintenance, fiveGRatio, avgSignal, avgLoad };
  }, [cityStations]);

  const stationLoadData = useMemo(() => generateStationLoadData(), []);
  const dropCallData = useMemo(() => generateDropCallDistribution(), []);
  const cityFaultRecords = useMemo(() => {
    const cityStationIds = new Set(cityStations.map(s => s.id));
    return faultRecords.filter(f => cityStationIds.has(f.stationId)).concat(
      faultRecords.slice(0, 3).map(f => ({
        ...f,
        stationName: cityStations[Math.floor(Math.random() * Math.max(cityStations.length, 1))]?.name || f.stationName,
      }))
    );
  }, [faultRecords, cityStations]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-telecom-border bg-slate-900 text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">
            {cityInfo.cityName} - 基站详情
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {cityInfo.provinceName} · 共 {stats.total} 个基站
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-7">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
              <Radio size={18} />
            </div>
            <div>
              <div className="text-xs text-slate-400">基站总数</div>
              <div className="text-lg font-bold text-white">{stats.total}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/20 text-green-400">
              <Wifi size={18} />
            </div>
            <div>
              <div className="text-xs text-slate-400">在线</div>
              <div className="text-lg font-bold text-white">{stats.online}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/20 text-red-400">
              <WifiOff size={18} />
            </div>
            <div>
              <div className="text-xs text-slate-400">离线</div>
              <div className="text-lg font-bold text-white">{stats.offline}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
              <Wrench size={18} />
            </div>
            <div>
              <div className="text-xs text-slate-400">维护中</div>
              <div className="text-lg font-bold text-white">{stats.maintenance}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
              <BarChart3 size={18} />
            </div>
            <div>
              <div className="text-xs text-slate-400">5G占比</div>
              <div className="text-lg font-bold text-white">{formatPercent(stats.fiveGRatio, 1)}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
              <Signal size={18} />
            </div>
            <div>
              <div className="text-xs text-slate-400">平均信号强度</div>
              <div className="text-lg font-bold text-white">{formatNumber(stats.avgSignal, 1)} dBm</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <TrendingUp size={18} />
            </div>
            <div>
              <div className="text-xs text-slate-400">平均负载率</div>
              <div className="text-lg font-bold text-white">{formatPercent(stats.avgLoad, 1)}</div>
            </div>
          </div>
        </Card>
      </div>

      <Card title="基站列表" extra={<span className="text-xs text-slate-400">共 {cityStations.length} 条记录</span>}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-telecom-border text-left text-xs text-slate-400">
                <th className="px-3 py-3 font-medium">基站名称</th>
                <th className="px-3 py-3 font-medium">编号</th>
                <th className="px-3 py-3 font-medium">类型</th>
                <th className="px-3 py-3 font-medium">状态</th>
                <th className="px-3 py-3 font-medium">信号强度</th>
                <th className="px-3 py-3 font-medium">负载率</th>
                <th className="px-3 py-3 font-medium">容量</th>
                <th className="px-3 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {cityStations.map(station => {
                const loadRate = (station.currentLoad / station.capacity) * 100;
                return (
                  <tr
                    key={station.id}
                    className="border-b border-telecom-border/50 transition hover:bg-slate-800/30"
                  >
                    <td className="px-3 py-3 font-medium text-white">{station.name}</td>
                    <td className="px-3 py-3 text-slate-400 font-mono text-xs">{station.code}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${
                          station.type === '5G'
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {station.type}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center rounded border px-2 py-0.5 text-xs ${getStatusColor(
                          station.status,
                        )}`}
                      >
                        {getStatusText(station.status)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-white">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-700">
                          <div
                            className="h-full rounded-full bg-cyan-500"
                            style={{ width: `${station.signalStrength}%` }}
                          />
                        </div>
                        <span className="text-xs">{station.signalStrength} dBm</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-white">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-700">
                          <div
                            className={`h-full rounded-full ${
                              loadRate > 80
                                ? 'bg-red-500'
                                : loadRate > 60
                                ? 'bg-amber-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${loadRate}%` }}
                          />
                        </div>
                        <span className="text-xs">{formatPercent(loadRate, 1)}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-slate-300 text-xs">
                      {formatNumber(station.currentLoad, 0)} / {formatNumber(station.capacity, 0)} 用户
                    </td>
                    <td className="px-3 py-3">
                      <button className="inline-flex items-center gap-1 rounded-md border border-telecom-border px-2.5 py-1 text-xs text-primary-400 transition hover:border-primary-500 hover:text-primary-300">
                        <Eye size={12} />
                        查看详情
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card title="近7天基站负载曲线">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stationLoadData}>
                <defs>
                  <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis
                  dataKey="timestamp"
                  stroke="#475569"
                  fontSize={11}
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis yAxisId="left" stroke="#475569" fontSize={11} />
                <YAxis yAxisId="right" orientation="right" stroke="#475569" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: '#111827',
                    border: '1px solid #1f2937',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#e5e7eb',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="load"
                  name="负载率(%)"
                  stroke="#3b82f6"
                  fill="url(#colorLoad)"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="users"
                  name="在线用户数"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="掉话时段分布">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dropCallData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis
                  dataKey="hour"
                  stroke="#475569"
                  fontSize={11}
                  tickFormatter={(val: number) => `${String(val).padStart(2, '0')}:00`}
                />
                <YAxis stroke="#475569" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: '#111827',
                    border: '1px solid #1f2937',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#e5e7eb',
                  }}
                  formatter={(value: number) => [`${value} 次`, '掉话次数']}
                  labelFormatter={(label: number) => `${String(label).padStart(2, '0')}:00 - ${String(label + 1).padStart(2, '0')}:00`}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar
                  dataKey="count"
                  name="掉话次数"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title="故障维修时间线">
        <div className="relative">
          <div className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-blue-500 via-cyan-500 to-transparent" />
          <div className="space-y-5">
            {cityFaultRecords.map(record => (
              <div key={record.id} className="relative flex gap-4 pl-9">
                <div
                  className={`absolute left-2.5 top-1.5 flex h-3 w-3 items-center justify-center rounded-full ring-4 ring-slate-900 ${
                    record.status === 'resolved'
                      ? 'bg-slate-500'
                      : record.status === 'in_progress'
                      ? 'bg-blue-500'
                      : 'bg-amber-500'
                  }`}
                />
                <div className="flex-1 rounded-lg border border-telecom-border bg-slate-900/40 p-4 transition hover:bg-slate-800/40">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded border px-2 py-0.5 text-xs ${getStatusColor(
                          record.status,
                        )}`}
                      >
                        {getStatusText(record.status)}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${getSeverityColor(
                          record.severity,
                        )}`}
                      >
                        <AlertTriangle size={10} className="mr-1 inline" />
                        {getSeverityText(record.severity)}
                      </span>
                      <span className="rounded bg-slate-700/50 px-2 py-0.5 text-xs text-slate-300">
                        {getFaultTypeText(record.type)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock size={12} />
                      {formatDateTime(record.startTime)}
                    </div>
                  </div>
                  <div className="mt-2.5">
                    <div className="text-sm font-medium text-white">{record.description}</div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <span>
                        <Radio size={11} className="mr-1 inline text-cyan-400" />
                        {record.stationName}
                      </span>
                      <span>
                        <User size={11} className="mr-1 inline text-cyan-400" />
                        处理人：{record.technician}
                      </span>
                      {record.resolvedTime && (
                        <span className="text-slate-500">
                          解决时间：{formatDateTime(record.resolvedTime)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StationDetail;
