import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Signal,
  PhoneOff,
  Gauge,
  Users,
  ChevronDown,
  ArrowRight,
  MapPin,
  AlertTriangle,
  Eye,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import Card from '../components/UI/Card';
import MetricCard from '../components/UI/MetricCard';
import { useApp } from '../context/AppContext';
import { provinceRanking } from '../data/mockData';
import {
  formatPercent,
  formatSpeed,
  formatNumber,
  formatTimeAgo,
  getCoverageColor,
  getDropRateColor,
  getStatusColor,
  getStatusText,
  getAlertTypeText,
} from '../utils';

type ViewLevel = 'country' | 'province' | 'city' | 'district';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    provinces,
    alerts,
    getRegionName,
    user,
    viewLevel,
    selectedProvinceCode,
    selectedCityCode,
    selectedDistrictCode,
    setViewLevel,
    setSelectedProvinceCode,
    setSelectedCityCode,
    setSelectedDistrictCode,
    getMetrics,
  } = useApp();

  const [activeMetricType, setActiveMetricType] = useState<ViewLevel>(viewLevel);

  const regionCode = selectedDistrictCode || selectedCityCode || selectedProvinceCode || 'CN';
  const regionType: 'province' | 'city' | 'district' = selectedDistrictCode
    ? 'district'
    : selectedCityCode
    ? 'city'
    : 'province';

  const metrics = useMemo(() => {
    return regionCode === 'CN' ? getMetrics('CN', 'province') : getMetrics(regionCode, regionType);
  }, [regionCode, regionType, getMetrics]);

  const latestMetrics = metrics[metrics.length - 1];

  const currentCoverage = latestMetrics?.signalCoverage ?? 96.8;
  const currentDropRate = latestMetrics?.dropRate ?? 1.82;
  const currentSpeed = latestMetrics?.avgDownloadSpeed ?? 82.5;
  const currentSatisfaction = latestMetrics?.satisfactionScore ?? 88.5;

  const cities = useMemo(() => {
    const p = provinces.find(p => p.code === selectedProvinceCode);
    return p?.cities ?? [];
  }, [provinces, selectedProvinceCode]);

  const districts = useMemo(() => {
    const c = cities.find(c => c.code === selectedCityCode);
    return c?.districts ?? [];
  }, [cities, selectedCityCode]);

  const levelLabels: Record<ViewLevel, string> = {
    country: '全国',
    province: '省级',
    city: '市级',
    district: '片区',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">网络质量核心看板</h1>
          <p className="mt-1 text-sm text-slate-400">
            实时监控 {getRegionName()} 区域网络运行状态，自动计算各项KPI指标
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-telecom-border bg-slate-900 p-1">
            {(['country', 'province', 'city', 'district'] as const).map(level => {
              const canAccess =
                user.role === 'headquarters' ||
                (user.role === 'province' && level !== 'country') ||
                (user.role === 'city' && (level === 'city' || level === 'district'));

              if (!canAccess) return null;

              return (
                <button
                  key={level}
                  onClick={() => {
                    setActiveMetricType(level);
                    setViewLevel(level);
                    if (level === 'country') {
                      setSelectedProvinceCode(null);
                      setSelectedCityCode(null);
                      setSelectedDistrictCode(null);
                    } else if (level === 'province') {
                      setSelectedCityCode(null);
                      setSelectedDistrictCode(null);
                    } else if (level === 'city') {
                      setSelectedDistrictCode(null);
                    }
                  }}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                    activeMetricType === level
                      ? 'bg-primary-500 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {levelLabels[level]}
                </button>
              );
            })}
          </div>

          {activeMetricType === 'province' && (
            <div className="relative">
              <select
                value={selectedProvinceCode || ''}
                onChange={e => {
                  setSelectedProvinceCode(e.target.value || null);
                  setSelectedCityCode(null);
                  setSelectedDistrictCode(null);
                }}
                className="appearance-none rounded-lg border border-telecom-border bg-slate-900 py-2 pl-3 pr-8 text-sm text-white outline-none focus:border-primary-500"
              >
                <option value="">选择省份</option>
                {provinces.map(p => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          )}

          {activeMetricType === 'city' && (
            <div className="relative">
              <select
                value={selectedCityCode || ''}
                onChange={e => {
                  setSelectedCityCode(e.target.value || null);
                  setSelectedDistrictCode(null);
                }}
                className="appearance-none rounded-lg border border-telecom-border bg-slate-900 py-2 pl-3 pr-8 text-sm text-white outline-none focus:border-primary-500"
              >
                <option value="">选择城市</option>
                {cities.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          )}

          {activeMetricType === 'district' && (
            <div className="relative">
              <select
                value={selectedDistrictCode || ''}
                onChange={e => setSelectedDistrictCode(e.target.value || null)}
                className="appearance-none rounded-lg border border-telecom-border bg-slate-900 py-2 pl-3 pr-8 text-sm text-white outline-none focus:border-primary-500"
              >
                <option value="">选择片区</option>
                {districts.map(d => (
                  <option key={d.code} value={d.code}>
                    {d.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="信号覆盖率"
          value={formatPercent(currentCoverage, 1)}
          change={0.31}
          icon={<Signal size={20} />}
          color="#10b981"
          subtext="目标值 ≥ 95%"
        />
        <MetricCard
          title="通话掉线率"
          value={formatPercent(currentDropRate, 2)}
          change={-0.13}
          isGoodWhenDown
          icon={<PhoneOff size={20} />}
          color="#ef4444"
          subtext="阈值 ≤ 5%"
        />
        <MetricCard
          title="平均下载速率"
          value={formatSpeed(currentSpeed)}
          change={5.36}
          icon={<Gauge size={20} />}
          color="#3b82f6"
          subtext="5G基站平均"
        />
        <MetricCard
          title="用户满意度"
          value={formatNumber(currentSatisfaction, 1)}
          unit="分"
          change={1.2}
          icon={<Users size={20} />}
          color="#8b5cf6"
          subtext="基于投诉工单评分"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card
          title="全国信号覆盖热力图"
          className="xl:col-span-2"
          extra={
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <span className="h-2 w-4 rounded" style={{ background: getCoverageColor(98) }}></span>
                <span className="text-slate-400">优 ≥97%</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2 w-4 rounded" style={{ background: getCoverageColor(95) }}></span>
                <span className="text-slate-400">良 95%</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2 w-4 rounded" style={{ background: getCoverageColor(92) }}></span>
                <span className="text-slate-400">中 90%</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2 w-4 rounded" style={{ background: getCoverageColor(88) }}></span>
                <span className="text-slate-400">差 {'<'}90%</span>
              </div>
            </div>
          }
        >
          <div className="relative h-80 w-full overflow-hidden rounded-lg bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 500 350">
              <defs>
                <radialGradient id="glow">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </radialGradient>
              </defs>
              {provinceRanking.map((p, i) => (
                <g key={p.code}>
                  <circle
                    cx={80 + (i % 4) * 110}
                    cy={80 + Math.floor(i / 4) * 110}
                    r="50"
                    fill="url(#glow)"
                    opacity="0.6"
                  />
                  <circle
                    cx={80 + (i % 4) * 110}
                    cy={80 + Math.floor(i / 4) * 110}
                    r="28"
                    fill={getCoverageColor(p.coverage)}
                    className="cursor-pointer opacity-85 transition hover:r-[34px]"
                    onClick={() => {
                      if (user.role === 'headquarters') {
                        setActiveMetricType('province');
                        setViewLevel('province');
                        setSelectedProvinceCode(p.code);
                      }
                    }}
                  />
                  <text
                    x={80 + (i % 4) * 110}
                    y={80 + Math.floor(i / 4) * 110}
                    textAnchor="middle"
                    className="fill-white text-[11px] font-medium"
                    pointerEvents="none"
                  >
                    {p.name.slice(0, 2)}
                  </text>
                  <text
                    x={80 + (i % 4) * 110}
                    y={80 + Math.floor(i / 4) * 110 + 14}
                    textAnchor="middle"
                    className="fill-white/80 text-[9px]"
                    pointerEvents="none"
                  >
                    {p.coverage.toFixed(1)}%
                  </text>
                </g>
              ))}
            </svg>
            <div className="absolute bottom-3 left-3 rounded bg-black/40 px-2 py-1 text-[10px] text-slate-400">
              💡 点击省份可下钻查看详情
            </div>
          </div>
        </Card>

        <Card
          title="实时预警推送"
          extra={
            <button
              onClick={() => navigate('/alerts')}
              className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300"
            >
              查看全部 <ArrowRight size={12} />
            </button>
          }
        >
          <div className="space-y-3">
            {alerts.slice(0, 4).map(alert => (
              <div
                key={alert.id}
                className={`rounded-lg border p-3 transition hover:bg-slate-800/50 ${
                  alert.level === 2
                    ? 'border-red-500/30 bg-red-500/5'
                    : 'border-amber-500/30 bg-amber-500/5'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle
                      size={14}
                      className={alert.level === 2 ? 'text-red-400' : 'text-amber-400'}
                    />
                    <span
                      className={`text-xs font-medium ${
                        alert.level === 2 ? 'text-red-400' : 'text-amber-400'
                      }`}
                    >
                      {alert.level === 2 ? '二级预警' : '一级预警'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {getAlertTypeText(alert.type)}
                    </span>
                  </div>
                  <span
                    className={`rounded border px-1.5 py-0.5 text-[10px] ${getStatusColor(
                      alert.status,
                    )}`}
                  >
                    {getStatusText(alert.status)}
                  </span>
                </div>
                <div className="mt-1.5 text-sm text-white">{alert.title}</div>
                <div className="mt-0.5 text-[11px] text-slate-400">
                  <MapPin size={10} className="mr-1 inline" />
                  {alert.regionName} · {formatTimeAgo(alert.startTime)} · 持续
                  {alert.duration}分钟
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card title="近24小时核心指标趋势" className="xl:col-span-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics}>
                <defs>
                  <linearGradient id="colorCoverage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="timeSlot" stroke="#475569" fontSize={11} />
                <YAxis stroke="#475569" fontSize={11} />
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
                  type="monotone"
                  dataKey="signalCoverage"
                  name="信号覆盖率(%)"
                  stroke="#10b981"
                  fill="url(#colorCoverage)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="avgDownloadSpeed"
                  name="下载速率(Mbps)"
                  stroke="#3b82f6"
                  fill="url(#colorSpeed)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="satisfactionScore"
                  name="满意度(分)"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="网络质量排名（省级TOP8）" extra={<span className="text-[10px] text-slate-400">综合评分</span>}>
          <div className="space-y-2.5">
            {provinceRanking.map((p, idx) => (
              <div
                key={p.code}
                className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition hover:bg-slate-800/50"
                onClick={() => {
                  if (user.role === 'headquarters') {
                    const province = provinces.find(pp => pp.code === p.code);
                    if (province && province.cities.length > 0) {
                      navigate(`/station/${province.cities[0].code}`);
                    }
                  }
                }}
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold ${
                    idx === 0
                      ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white'
                      : idx === 1
                      ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-slate-900'
                      : idx === 2
                      ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white">{p.name}</span>
                    <span className="text-xs text-slate-400">
                      <Eye size={11} className="mr-1 inline" />
                      点击下钻
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-[10px]">
                    <span style={{ color: getCoverageColor(p.coverage) }}>
                      覆盖率 {p.coverage}%
                    </span>
                    <span style={{ color: getDropRateColor(p.dropRate) }}>
                      掉线 {p.dropRate}%
                    </span>
                    <span className="text-slate-500">速率 {p.speed.toFixed(1)}Mbps</span>
                  </div>
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary-500 to-cyan-500"
                      style={{ width: `${p.coverage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="近24小时掉线率与投诉量对比">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="timeSlot" stroke="#475569" fontSize={11} />
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
              <Bar yAxisId="left" dataKey="dropRate" name="掉线率(%)" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="complaintCount" name="投诉量(件)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
