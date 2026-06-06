import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import {
  Signal,
  PhoneOff,
  Gauge,
  Users,
  ArrowRight,
  MapPin,
  AlertTriangle,
  X,
} from 'lucide-react';
import {
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
import metricsApi from '../api/metrics';
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
import type { ViewLevel, Province, City } from '../types';

interface ProvinceMapPoint {
  code: string;
  name: string;
  longitude: number;
  latitude: number;
  coverage: number;
}

const PROVINCE_COORDS: ProvinceMapPoint[] = [
  { code: '110000', name: '北京', longitude: 116.4, latitude: 39.9, coverage: 98.2 },
  { code: '310000', name: '上海', longitude: 121.5, latitude: 31.2, coverage: 97.8 },
  { code: '440000', name: '广东', longitude: 113.3, latitude: 23.1, coverage: 96.5 },
  { code: '320000', name: '江苏', longitude: 118.8, latitude: 32.1, coverage: 95.2 },
  { code: '330000', name: '浙江', longitude: 120.2, latitude: 30.3, coverage: 95.8 },
  { code: '510000', name: '四川', longitude: 104.1, latitude: 30.7, coverage: 93.4 },
  { code: '420000', name: '湖北', longitude: 114.3, latitude: 30.6, coverage: 92.8 },
  { code: '370000', name: '山东', longitude: 117.0, latitude: 36.7, coverage: 94.5 },
];

const levelLabels: Record<ViewLevel, string> = {
  country: '全国',
  province: '省级',
  city: '市级',
  district: '片区',
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    user,
    overviewMetrics,
    ranking,
    alerts,
    trendData,
    regions,
    selectedRegionCode,
    viewLevel,
    setViewLevel,
    setSelectedRegionCode,
    provinces,
    refreshAllData,
  } = useApp();

  const [activeViewLevel, setActiveViewLevel] = useState<ViewLevel>(viewLevel);
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [showCityModal, setShowCityModal] = useState(false);
  const [localOverview, setLocalOverview] = useState(overviewMetrics);
  const [localTrend, setLocalTrend] = useState(trendData);
  const [localRanking, setLocalRanking] = useState(ranking);
  const [localAlerts, setLocalAlerts] = useState(alerts);

  useEffect(() => {
    const fetchData = async () => {
      if (!overviewMetrics) {
        try {
          const data = await metricsApi.getOverview();
          setLocalOverview(data);
        } catch (e) {
          console.error('Failed to fetch overview metrics:', e);
        }
      }
      if (trendData.length === 0) {
        try {
          const data = await metricsApi.getTrend();
          setLocalTrend(data);
        } catch (e) {
          console.error('Failed to fetch trend data:', e);
        }
      }
      if (ranking.length === 0) {
        try {
          const data = await metricsApi.getRanking();
          setLocalRanking(data);
        } catch (e) {
          console.error('Failed to fetch ranking:', e);
        }
      }
    };
    fetchData();
  }, [overviewMetrics, trendData, ranking]);

  useEffect(() => {
    if (overviewMetrics) setLocalOverview(overviewMetrics);
  }, [overviewMetrics]);

  useEffect(() => {
    if (trendData.length > 0) setLocalTrend(trendData);
  }, [trendData]);

  useEffect(() => {
    if (ranking.length > 0) setLocalRanking(ranking);
  }, [ranking]);

  useEffect(() => {
    if (alerts.length > 0) setLocalAlerts(alerts);
  }, [alerts]);

  const currentCoverage = localOverview?.signalCoverage ?? 96.8;
  const currentDropRate = localOverview?.dropRate ?? 1.82;
  const currentSpeed = localOverview?.avgDownloadSpeed ?? 82.5;
  const currentSatisfaction = localTrend[localTrend.length - 1]?.satisfactionScore ?? 88.5;

  const provinceMapData = useMemo(() => {
    return PROVINCE_COORDS.map(p => {
      const rankItem = localRanking.find(r => r.regionCode === p.code);
      return {
        ...p,
        coverage: rankItem?.signalCoverage ?? p.coverage,
        value: [p.longitude, p.latitude, rankItem?.signalCoverage ?? p.coverage],
      };
    });
  }, [localRanking]);

  const chartOption = useMemo(() => {
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        textStyle: { color: '#e5e7eb', fontSize: 12 },
        formatter: (params: any) => {
          if (params.seriesType === 'effectScatter' || params.seriesType === 'scatter') {
            const data = params.data;
            const coverage = data.value[2]?.toFixed(1) ?? data.coverage?.toFixed(1) ?? '-';
            return `<div style="padding:4px;">
              <div style="font-weight:600;margin-bottom:4px;">${data.name}</div>
              <div>覆盖率: <span style="color:${getCoverageColor(coverage)}">${coverage}%</span></div>
              <div style="font-size:11px;color:#94a3b8;margin-top:4px;">点击查看城市列表</div>
            </div>`;
          }
          return '';
        },
      },
      grid: {
        left: 40,
        right: 40,
        top: 30,
        bottom: 40,
        containLabel: false,
      },
      xAxis: {
        type: 'value',
        min: 95,
        max: 130,
        show: false,
      },
      yAxis: {
        type: 'value',
        min: 18,
        max: 50,
        show: false,
      },
      visualMap: {
        show: true,
        min: 50,
        max: 100,
        left: 10,
        bottom: 10,
        text: ['高', '低'],
        textStyle: { color: '#94a3b8', fontSize: 11 },
        calculable: false,
        itemWidth: 10,
        itemHeight: 80,
        inRange: {
          color: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'],
        },
      },
      series: [
        {
          name: '省份覆盖',
          type: 'effectScatter',
          coordinateSystem: 'cartesian2d',
          data: provinceMapData.map((p) => ({
            name: p.name,
            code: p.code,
            value: [p.longitude, p.latitude, p.coverage],
            coverage: p.coverage,
          })),
          symbolSize: (val: number[]) => {
            const coverage = val[2] ?? 70;
            return 18 + (coverage - 50) * 0.6;
          },
          showEffectOn: 'render',
          rippleEffect: {
            brushType: 'stroke',
            scale: 3,
            period: 4,
          },
          label: {
            show: true,
            position: 'top',
            formatter: '{b}',
            color: '#e5e7eb',
            fontSize: 12,
            fontWeight: 500,
            distance: 8,
          },
          itemStyle: {
            color: (params: any) => {
              const coverage = params.data.value[2] ?? params.data.coverage ?? 70;
              return getCoverageColor(coverage);
            },
            shadowBlur: 15,
            shadowColor: 'rgba(59, 130, 246, 0.5)',
          },
          zlevel: 1,
        },
      ],
    };
  }, [provinceMapData]);

  const handleProvinceClick = (params: any) => {
    if (!params || !params.data || !params.data.code) return;
    const code = params.data.code as string;
    const province = provinces.find(p => p.code === code);
    if (province) {
      setSelectedProvince(province);
      setShowCityModal(true);
    }
  };

  const handleCityClick = (city: City) => {
    setShowCityModal(false);
    navigate(`/station/${city.code}`);
  };

  const onChartEvents = useMemo(() => ({
    click: (params: any) => {
      if (params.seriesType === 'effectScatter' || params.seriesType === 'scatter') {
        handleProvinceClick(params);
      }
    },
  }), [provinces, navigate]);

  const canAccessLevel = (level: ViewLevel): boolean => {
    if (!user) return false;
    if (user.role === 'headquarters') return true;
    if (user.role === 'province') return level !== 'country';
    if (user.role === 'city') return level === 'city' || level === 'district';
    return false;
  };

  const handleLevelChange = (level: ViewLevel) => {
    setActiveViewLevel(level);
    setViewLevel(level);
    if (level === 'country') {
      setSelectedRegionCode(null);
    }
    refreshAllData();
  };

  const rankingData = useMemo(() => {
    if (localRanking.length > 0) {
      return localRanking.slice(0, 8).map((r, idx) => ({
        ...r,
        displayRank: idx + 1,
      }));
    }
    return PROVINCE_COORDS.slice(0, 8).map((p, idx) => ({
      regionCode: p.code,
      regionName: p.name,
      signalCoverage: p.coverage,
      dropRate: 1 + Math.random() * 2,
      rank: idx + 1,
      displayRank: idx + 1,
    }));
  }, [localRanking]);

  const displayTrendData = useMemo(() => {
    if (localTrend.length > 0) return localTrend;
    return Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
      timeSlot: `${String(i).padStart(2, '0')}:00`,
      signalCoverage: 95 + Math.random() * 3,
      dropRate: 1 + Math.random() * 1.5,
      avgDownloadSpeed: 75 + Math.random() * 20,
      satisfactionScore: 85 + Math.random() * 10,
      complaintCount: Math.floor(10 + Math.random() * 40),
    }));
  }, [localTrend]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">网络质量核心看板</h1>
          <p className="mt-1 text-sm text-slate-400">
            实时监控区域网络运行状态，自动计算各项KPI指标
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 p-1">
            {(['country', 'province', 'city', 'district'] as const).map(level => {
              if (!canAccessLevel(level)) return null;
              return (
                <button
                  key={level}
                  onClick={() => handleLevelChange(level)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                    activeViewLevel === level
                      ? 'bg-blue-500 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {levelLabels[level]}
                </button>
              );
            })}
          </div>
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
          <div style={{ height: '400px', width: '100%' }}>
            <ReactECharts
              option={chartOption}
              style={{ height: '100%', width: '100%' }}
              onEvents={onChartEvents}
              opts={{ renderer: 'canvas' }}
            />
          </div>
          <div className="mt-2 rounded bg-black/40 px-2 py-1 text-[10px] text-slate-400 w-fit">
            💡 点击省份散点可查看该省城市列表
          </div>
        </Card>

        <Card
          title="实时预警推送"
          extra={
            <button
              onClick={() => navigate('/alerts')}
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
            >
              查看全部 <ArrowRight size={12} />
            </button>
          }
        >
          <div className="space-y-3">
            {localAlerts.slice(0, 4).map(alert => (
              <div
                key={alert.id}
                onClick={() => navigate('/alerts')}
                className={`cursor-pointer rounded-lg border p-3 transition hover:bg-slate-800/50 ${
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
            {localAlerts.length === 0 && (
              <div className="py-8 text-center text-sm text-slate-500">
                暂无预警数据
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card title="近24小时核心指标趋势">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayTrendData}>
              <defs>
                <linearGradient id="colorCoverage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDrop" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
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
                dataKey="dropRate"
                name="掉线率(%)"
                stroke="#ef4444"
                fill="url(#colorDrop)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card title="网络质量排名（省级TOP8）" extra={<span className="text-[10px] text-slate-400">综合评分</span>}>
          <div className="space-y-2.5">
            {rankingData.map((p, idx) => (
              <div
                key={p.regionCode}
                className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition hover:bg-slate-800/50"
                onClick={() => {
                  const province = provinces.find(pp => pp.code === p.regionCode);
                  if (province && province.cities.length > 0) {
                    navigate(`/station/${province.cities[0].code}`);
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
                    <span className="text-sm text-white">{p.regionName}</span>
                    <span className="text-xs text-slate-400">点击下钻</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-[10px]">
                    <span style={{ color: getCoverageColor(p.signalCoverage) }}>
                      覆盖率 {p.signalCoverage.toFixed(1)}%
                    </span>
                    <span style={{ color: getDropRateColor(p.dropRate) }}>
                      掉线 {p.dropRate.toFixed(2)}%
                    </span>
                  </div>
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                      style={{ width: `${p.signalCoverage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="近24小时掉线率与投诉量对比">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayTrendData}>
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

      {showCityModal && selectedProvince && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md rounded-xl shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700 px-5 py-3">
              <h3 className="text-sm font-semibold text-white">
                {selectedProvince.name} - 城市列表
              </h3>
              <button
                onClick={() => setShowCityModal(false)}
                className="rounded p-1 text-slate-400 transition hover:bg-slate-700 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto p-4">
              {selectedProvince.cities.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-500">
                  暂无城市数据
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedProvince.cities.map(city => (
                    <div
                      key={city.code}
                      onClick={() => handleCityClick(city)}
                      className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 transition hover:border-blue-500/50 hover:bg-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-blue-400" />
                        <span className="text-sm text-white">{city.name}</span>
                      </div>
                      <ArrowRight size={14} className="text-slate-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
