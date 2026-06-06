import React from 'react';
import { Printer, Download, AlertTriangle, CheckCircle, Clock, AlertCircle, Signal, PhoneOff, MessageSquare, Gauge } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Card from '../components/UI/Card';
import { weeklyReport } from '../data/mockData';
import {
  getTrendIcon,
  getTrendColor,
  formatPercent,
  formatSpeed,
  formatDateTime,
} from '../utils';

const WeeklyReportPage: React.FC = () => {
  const report = weeklyReport;

  const trendData = [
    {
      name: '信号覆盖率(%)',
      本周: report.metrics.signalCoverage.current,
      上周: report.metrics.signalCoverage.lastWeek,
      去年同期: report.metrics.signalCoverage.yearAgo,
    },
    {
      name: '掉线率(%)',
      本周: report.metrics.dropRate.current,
      上周: report.metrics.dropRate.lastWeek,
      去年同期: report.metrics.dropRate.yearAgo,
    },
    {
      name: '投诉率(%)',
      本周: report.metrics.complaintRate.current * 100,
      上周: report.metrics.complaintRate.lastWeek * 100,
      去年同期: report.metrics.complaintRate.yearAgo * 100,
    },
    {
      name: '下载速率(Mbps)',
      本周: report.metrics.avgDownloadSpeed.current,
      上周: report.metrics.avgDownloadSpeed.lastWeek,
      去年同期: report.metrics.avgDownloadSpeed.yearAgo,
    },
  ];

  const calcChange = (current: number, last: number) => {
    if (last === 0) return 0;
    return ((current - last) / last) * 100;
  };

  const metrics = [
    {
      key: 'signalCoverage',
      title: '信号覆盖率',
      icon: <Signal size={20} />,
      color: '#10b981',
      value: formatPercent(report.metrics.signalCoverage.current, 1),
      lastWeek: formatPercent(report.metrics.signalCoverage.lastWeek, 1),
      yearAgo: formatPercent(report.metrics.signalCoverage.yearAgo, 1),
      trend: report.metrics.signalCoverage.trend,
      woW: calcChange(report.metrics.signalCoverage.current, report.metrics.signalCoverage.lastWeek),
      yoY: calcChange(report.metrics.signalCoverage.current, report.metrics.signalCoverage.yearAgo),
      isGoodWhenDown: false,
    },
    {
      key: 'dropRate',
      title: '掉线率',
      icon: <PhoneOff size={20} />,
      color: '#ef4444',
      value: formatPercent(report.metrics.dropRate.current, 2),
      lastWeek: formatPercent(report.metrics.dropRate.lastWeek, 2),
      yearAgo: formatPercent(report.metrics.dropRate.yearAgo, 2),
      trend: report.metrics.dropRate.trend,
      woW: calcChange(report.metrics.dropRate.current, report.metrics.dropRate.lastWeek),
      yoY: calcChange(report.metrics.dropRate.current, report.metrics.dropRate.yearAgo),
      isGoodWhenDown: true,
    },
    {
      key: 'complaintRate',
      title: '投诉率',
      icon: <MessageSquare size={20} />,
      color: '#f59e0b',
      value: formatPercent(report.metrics.complaintRate.current * 100, 2),
      lastWeek: formatPercent(report.metrics.complaintRate.lastWeek * 100, 2),
      yearAgo: formatPercent(report.metrics.complaintRate.yearAgo * 100, 2),
      trend: report.metrics.complaintRate.trend,
      woW: calcChange(report.metrics.complaintRate.current, report.metrics.complaintRate.lastWeek),
      yoY: calcChange(report.metrics.complaintRate.current, report.metrics.complaintRate.yearAgo),
      isGoodWhenDown: true,
    },
    {
      key: 'avgDownloadSpeed',
      title: '平均下载速率',
      icon: <Gauge size={20} />,
      color: '#3b82f6',
      value: formatSpeed(report.metrics.avgDownloadSpeed.current),
      lastWeek: formatSpeed(report.metrics.avgDownloadSpeed.lastWeek),
      yearAgo: formatSpeed(report.metrics.avgDownloadSpeed.yearAgo),
      trend: report.metrics.avgDownloadSpeed.trend,
      woW: calcChange(report.metrics.avgDownloadSpeed.current, report.metrics.avgDownloadSpeed.lastWeek),
      yoY: calcChange(report.metrics.avgDownloadSpeed.current, report.metrics.avgDownloadSpeed.yearAgo),
      isGoodWhenDown: false,
    },
  ];

  const alertSummaryCards = [
    {
      title: '一级预警',
      value: report.alertSummary.level1,
      icon: <AlertTriangle size={22} />,
      color: '#f59e0b',
    },
    {
      title: '二级预警',
      value: report.alertSummary.level2,
      icon: <AlertCircle size={22} />,
      color: '#ef4444',
    },
    {
      title: '已解决',
      value: report.alertSummary.resolved,
      icon: <CheckCircle size={22} />,
      color: '#10b981',
    },
    {
      title: '待处理',
      value: report.alertSummary.pending,
      icon: <Clock size={22} />,
      color: '#3b82f6',
    },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const content = JSON.stringify(report, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weekly-report-${report.weekStart}-${report.weekEnd}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">网络运营健康周报</h1>
          <p className="mt-1 text-sm text-slate-400">
            报告范围：{report.regionName} · 报告周期：{report.weekStart} 至 {report.weekEnd}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-lg border border-telecom-border bg-slate-900 px-3 py-2 text-xs text-slate-400">
            生成时间：{formatDateTime(report.generatedAt)}
          </div>
          <div className="rounded-lg border border-telecom-border bg-slate-900 px-3 py-2 text-xs text-slate-400">
            报告范围：{report.regionName}
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg border border-telecom-border bg-slate-900 px-3 py-2 text-xs text-white transition hover:bg-slate-800"
          >
            <Printer size={14} />
            打印
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-lg bg-primary-500 px-3 py-2 text-xs text-white transition hover:bg-primary-600"
          >
            <Download size={14} />
            导出
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map(m => (
          <div
            key={m.key}
            className="glass-card relative overflow-hidden rounded-xl p-5 transition-transform hover:scale-[1.02]"
          >
            <div
              className="absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-10"
              style={{ background: m.color }}
            />
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-slate-400">{m.title}</div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-2xl font-bold text-white">{m.value}</span>
                  <span
                    className={`text-lg font-bold ${getTrendColor(m.trend, m.isGoodWhenDown)}`}
                  >
                    {getTrendIcon(m.trend)}
                  </span>
                </div>
                <div className="mt-3 space-y-1 text-[11px] text-slate-400">
                  <div className="flex justify-between">
                    <span>上周</span>
                    <span className="text-slate-300">{m.lastWeek}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>去年同期</span>
                    <span className="text-slate-300">{m.yearAgo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>环比</span>
                    <span
                      className={getTrendColor(
                        m.woW > 0 ? 'up' : m.woW < 0 ? 'down' : 'stable',
                        m.isGoodWhenDown,
                      )}
                    >
                      {m.woW >= 0 ? '+' : ''}
                      {m.woW.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>同比</span>
                    <span
                      className={getTrendColor(
                        m.yoY > 0 ? 'up' : m.yoY < 0 ? 'down' : 'stable',
                        m.isGoodWhenDown,
                      )}
                    >
                      {m.yoY >= 0 ? '+' : ''}
                      {m.yoY.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
              <div
                className="flex h-11 w-11 items-center justify-center rounded-lg"
                style={{ background: `${m.color}20`, color: m.color }}
              >
                {m.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {alertSummaryCards.map(card => (
          <div
            key={card.title}
            className="glass-card relative overflow-hidden rounded-xl p-5 transition-transform hover:scale-[1.02]"
          >
            <div
              className="absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-10"
              style={{ background: card.color }}
            />
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-slate-400">{card.title}</div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">{card.value}</span>
                  <span className="text-xs text-slate-400">件</span>
                </div>
              </div>
              <div
                className="flex h-11 w-11 items-center justify-center rounded-lg"
                style={{ background: `${card.color}20`, color: card.color }}
              >
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card title="三大主要问题">
          <div className="space-y-3">
            {report.topIssues.map((issue, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-lg border border-slate-700/50 bg-slate-800/30 p-3"
              >
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-red-500/20 text-sm font-bold text-red-400">
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <p className="pt-0.5 text-sm text-slate-200">{issue}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="优化参数建议">
          <div className="space-y-3">
            {report.optimizationRecommendations.map((rec, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-lg border border-slate-700/50 bg-slate-800/30 p-3"
              >
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-sm font-bold text-blue-400">
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <p className="pt-0.5 text-sm text-slate-200">{rec}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="基站维护计划表">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-telecom-border text-xs text-slate-400">
                <th className="pb-3 pr-4 font-medium">日期</th>
                <th className="pb-3 pr-4 font-medium">基站编号</th>
                <th className="pb-3 font-medium">维护类型</th>
              </tr>
            </thead>
            <tbody>
              {report.maintenancePlan.map((plan, idx) => (
                <tr
                  key={idx}
                  className="border-b border-slate-800 last:border-0 hover:bg-slate-800/30"
                >
                  <td className="py-3 pr-4 text-white">{plan.date}</td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap gap-1">
                      {plan.stations.map(station => (
                        <span
                          key={station}
                          className="rounded border border-telecom-border bg-slate-800 px-2 py-0.5 text-xs text-slate-300"
                        >
                          {station}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 text-slate-300">{plan.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="指标趋势对比图（本周 vs 上周 vs 去年同期）">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="name" stroke="#475569" fontSize={11} />
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
              <Bar dataKey="本周" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="上周" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="去年同期" fill="#64748b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default WeeklyReportPage;
