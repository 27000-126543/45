import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  Clock,
  Filter,
  ChevronRight,
  Check,
  X,
  User,
  MapPin,
  MessageSquare,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import clsx from 'clsx';
import Card from '../components/UI/Card';
import { useApp } from '../context/AppContext';
import alertsApi from '../api/alerts';
import type { Alert, AlertLevel, ApprovalStep } from '../types';
import {
  formatDateTime,
  getAlertTypeText,
  getStatusColor,
  getStatusText,
} from '../utils';

const normalizeAlertStatus = (status: string): Alert['status'] => {
  if (status === 'pending_ack') return 'pending';
  if (status === 'reviewing') return 'reviewed';
  return status as Alert['status'];
};

const Alerts: React.FC = () => {
  const { alerts: contextAlerts, user } = useApp();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [filterLevel, setFilterLevel] = useState<'all' | AlertLevel>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await alertsApi.getAlerts();
      const normalized: Alert[] = data.map((a: any) => ({
        ...a,
        status: normalizeAlertStatus(a.status),
        approvalHistory: (a.approvalHistory || []) as ApprovalStep[],
      }));
      setAlerts(normalized);
    } catch (e: any) {
      setError(e.message || '加载预警数据失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (contextAlerts && contextAlerts.length > 0) {
      setAlerts(contextAlerts);
      setLoading(false);
    } else {
      fetchAlerts();
    }
  }, [contextAlerts, fetchAlerts]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      if (filterLevel !== 'all' && a.level !== filterLevel) return false;
      if (filterStatus !== 'all' && a.status !== filterStatus) return false;
      return true;
    });
  }, [alerts, filterLevel, filterStatus]);

  const stats = useMemo(() => ({
    total: alerts.length,
    level1: alerts.filter(a => a.level === 1).length,
    level2: alerts.filter(a => a.level === 2).length,
    pending: alerts.filter(a => a.status === 'pending' || a.status === 'acknowledged').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
  }), [alerts]);

  const refreshSelectedAlert = useCallback(() => {
    if (selectedAlert) {
      const updated = alerts.find(a => a.id === selectedAlert.id);
      if (updated) setSelectedAlert({ ...updated });
    }
  }, [selectedAlert, alerts]);

  const handleApprove = async (alert: Alert) => {
    setActionLoading(true);
    try {
      await alertsApi.approveAlert(alert.id, comment);
      setComment('');
      await fetchAlerts();
      setSelectedAlert(null);
    } catch (e: any) {
      setError(e.message || '审批操作失败');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (alert: Alert) => {
    setActionLoading(true);
    try {
      await alertsApi.rejectAlert(alert.id, comment);
      setComment('');
      await fetchAlerts();
      setSelectedAlert(null);
    } catch (e: any) {
      setError(e.message || '驳回操作失败');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async (alert: Alert) => {
    setActionLoading(true);
    try {
      await alertsApi.resolveAlert(alert.id, comment);
      setComment('');
      await fetchAlerts();
      setSelectedAlert(null);
    } catch (e: any) {
      setError(e.message || '解决操作失败');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectAlert = (alert: Alert) => {
    setSelectedAlert(alert);
  };

  const handleRefreshAlert = () => {
    refreshSelectedAlert();
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={36} className="animate-spin text-primary-400" />
          <span className="text-sm text-slate-400">加载预警数据中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">预警管理中心</h1>
          <p className="mt-1 text-sm text-slate-400">
            实时监控网络异常预警，支持三级审批流程处理紧急事件
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAlerts}
            className="flex items-center gap-2 rounded-lg border border-telecom-border bg-slate-900 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
          >
            <RefreshCw size={14} />
            刷新数据
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {[
          { label: '预警总数', value: stats.total, color: '#3b82f6' },
          { label: '一级预警', value: stats.level1, color: '#f59e0b' },
          { label: '二级预警', value: stats.level2, color: '#ef4444' },
          { label: '待处理', value: stats.pending, color: '#8b5cf6' },
          { label: '已解决', value: stats.resolved, color: '#10b981' },
        ].map(s => (
          <div key={s.label} className="glass-card rounded-xl p-4">
            <div className="text-xs text-slate-400">{s.label}</div>
            <div className="mt-1 text-2xl font-bold" style={{ color: s.color }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card
          className="xl:col-span-2"
          title="预警列表"
          extra={
            <div className="flex items-center gap-2">
              <div className="relative">
                <Filter size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={filterLevel}
                  onChange={e => setFilterLevel(e.target.value as any)}
                  className="appearance-none rounded-md border border-telecom-border bg-slate-900 py-1 pl-7 pr-6 text-xs text-white outline-none"
                >
                  <option value="all">全部等级</option>
                  <option value="1">一级预警</option>
                  <option value="2">二级预警</option>
                </select>
              </div>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="appearance-none rounded-md border border-telecom-border bg-slate-900 py-1 px-3 text-xs text-white outline-none"
              >
                <option value="all">全部状态</option>
                <option value="pending">待处理</option>
                <option value="acknowledged">已确认</option>
                <option value="reviewed">已复核</option>
                <option value="approved">已批准</option>
                <option value="resolved">已解决</option>
              </select>
            </div>
          }
          padding={false}
        >
          <div className="overflow-x-auto">
            <table className="data-table w-full text-sm">
              <thead>
                <tr className="border-b border-telecom-border text-left text-xs text-slate-400">
                  <th className="px-4 py-3">等级</th>
                  <th className="px-4 py-3">类型</th>
                  <th className="px-4 py-3">预警标题</th>
                  <th className="px-4 py-3">区域</th>
                  <th className="px-4 py-3">触发值/阈值</th>
                  <th className="px-4 py-3">持续时间</th>
                  <th className="px-4 py-3">状态</th>
                  <th className="px-4 py-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlerts.map(alert => (
                  <tr
                    key={alert.id}
                    className="cursor-pointer border-b border-telecom-border transition hover:bg-slate-800/30"
                    onClick={() => handleSelectAlert(alert)}
                  >
                    <td className="px-4 py-3">
                      <span
                        className={clsx(
                          'inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium',
                          alert.level === 2
                            ? 'bg-red-500/15 text-red-400'
                            : 'bg-amber-500/15 text-amber-400',
                        )}
                      >
                        <AlertTriangle size={10} />
                        {alert.level === 2 ? '二级' : '一级'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{getAlertTypeText(alert.type)}</td>
                    <td className="px-4 py-3 text-white">{alert.title}</td>
                    <td className="px-4 py-3 text-slate-300">{alert.regionName}</td>
                    <td className="px-4 py-3">
                      <span className={alert.triggerValue > alert.threshold ? 'text-red-400' : 'text-slate-300'}>
                        {alert.triggerValue}
                      </span>
                      <span className="text-slate-500"> / {alert.threshold}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{alert.duration}分钟</td>
                    <td className="px-4 py-3">
                      <span
                        className={clsx(
                          'rounded border px-2 py-0.5 text-[10px]',
                          getStatusColor(alert.status),
                        )}
                      >
                        {getStatusText(alert.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleSelectAlert(alert);
                        }}
                        className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300"
                      >
                        详情
                        <ChevronRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-4">
          <Card title="预警规则说明">
            <div className="space-y-4 text-sm">
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                <div className="flex items-center gap-2 font-medium text-amber-400">
                  <AlertTriangle size={14} />
                  一级预警
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  连续1小时满足以下任一条件触发：
                  <ul className="mt-1 list-disc pl-4">
                    <li>掉线率 {'>'} 5%</li>
                    <li>投诉量环比增长 {'>'} 30%</li>
                  </ul>
                  <p className="mt-1">推送至区域网络优化工程师处理</p>
                </div>
              </div>
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                <div className="flex items-center gap-2 font-medium text-red-400">
                  <AlertTriangle size={14} />
                  二级预警
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  一级预警持续2小时未改善自动升级，触发：
                  <ul className="mt-1 list-disc pl-4">
                    <li>启动三层审批流程</li>
                  </ul>
                  <p className="mt-1">紧急扩容或参数调优方案需经：</p>
                  <ol className="mt-1 list-decimal pl-4">
                    <li>工程师确认</li>
                    <li>区域主管复核</li>
                    <li>总部网络部批准</li>
                  </ol>
                </div>
              </div>
            </div>
          </Card>

          <div className="rounded-lg border border-telecom-border bg-slate-900/50 p-4">
            <div className="text-xs font-medium text-slate-300">审批流程说明</div>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
              <div className="flex flex-1 flex-col items-center rounded bg-slate-800 px-2 py-1.5">
                <User size={12} />
                <span className="mt-0.5">工程师</span>
              </div>
              <ChevronRight size={12} />
              <div className="flex flex-1 flex-col items-center rounded bg-slate-800 px-2 py-1.5">
                <User size={12} />
                <span className="mt-0.5">主管</span>
              </div>
              <ChevronRight size={12} />
              <div className="flex flex-1 flex-col items-center rounded bg-slate-800 px-2 py-1.5">
                <User size={12} />
                <span className="mt-0.5">总部</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedAlert && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setSelectedAlert(null)}
        >
          <div
            className="glass-card max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-telecom-border p-5">
              <div className="flex items-start gap-3">
                <div
                  className={clsx(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                    selectedAlert.level === 2
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-amber-500/20 text-amber-400',
                  )}
                >
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {selectedAlert.level === 2 ? '二级预警' : '一级预警'} - {selectedAlert.title}
                  </h2>
                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {selectedAlert.regionName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatDateTime(selectedAlert.startTime)} 开始 · 已持续{selectedAlert.duration}分钟
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-telecom-border bg-slate-900/50 p-3">
                  <div className="text-xs text-slate-400">预警类型</div>
                  <div className="mt-1 text-sm font-medium text-white">
                    {getAlertTypeText(selectedAlert.type)}
                  </div>
                </div>
                <div className="rounded-lg border border-telecom-border bg-slate-900/50 p-3">
                  <div className="text-xs text-slate-400">触发值 / 阈值</div>
                  <div className="mt-1 text-sm font-medium text-white">
                    <span className="text-red-400">{selectedAlert.triggerValue}</span>
                    <span className="text-slate-500"> / {selectedAlert.threshold}</span>
                  </div>
                </div>
                <div className="rounded-lg border border-telecom-border bg-slate-900/50 p-3">
                  <div className="text-xs text-slate-400">负责人</div>
                  <div className="mt-1 text-sm font-medium text-white">
                    {selectedAlert.assignedEngineer || '未分配'}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-telecom-border bg-slate-900/50 p-4">
                <div className="text-xs font-medium text-white">预警描述</div>
                <div className="mt-1 text-sm text-slate-300">
                  {selectedAlert.description}
                </div>
              </div>

              {selectedAlert.resolution && (
                <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
                  <div className="text-xs font-medium text-green-400">处理结果</div>
                  <div className="mt-1 text-sm text-slate-300">
                    {selectedAlert.resolution}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    解决时间：{selectedAlert.resolvedAt && formatDateTime(selectedAlert.resolvedAt)}
                  </div>
                </div>
              )}

              {selectedAlert.approvalHistory.length > 0 && (
                <div>
                  <div className="mb-2 text-xs font-medium text-white">三层审批流程</div>
                  <div className="space-y-2">
                    {selectedAlert.approvalHistory.map(step => (
                      <div
                        key={step.id}
                        className={clsx(
                          'flex items-center gap-3 rounded-lg border p-3',
                          step.status === 'approved'
                            ? 'border-green-500/20 bg-green-500/5'
                            : step.status === 'rejected'
                            ? 'border-red-500/20 bg-red-500/5'
                            : 'border-telecom-border bg-slate-900/50',
                        )}
                      >
                        <div
                          className={clsx(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                            step.status === 'approved'
                              ? 'bg-green-500/20 text-green-400'
                              : step.status === 'rejected'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-slate-700 text-slate-400',
                          )}
                        >
                          {step.status === 'approved' ? (
                            <Check size={14} />
                          ) : step.status === 'rejected' ? (
                            <X size={14} />
                          ) : (
                            <Clock size={14} />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-white">
                            第{step.level}级审批 - {step.role}
                          </div>
                          <div className="text-xs text-slate-400">
                            {step.approver || '等待审批...'}
                          </div>
                          {step.comment && (
                            <div className="mt-1 text-xs text-slate-500">
                              <MessageSquare size={10} className="mr-1 inline" />
                              {step.comment}
                            </div>
                          )}
                        </div>
                        <div
                          className={clsx(
                            'rounded px-2 py-0.5 text-[10px]',
                            step.status === 'approved'
                              ? 'text-green-400'
                              : step.status === 'rejected'
                              ? 'text-red-400'
                              : 'text-slate-400',
                          )}
                        >
                          {step.status === 'approved'
                            ? '已通过'
                            : step.status === 'rejected'
                            ? '已驳回'
                            : '待处理'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedAlert.status !== 'resolved' && selectedAlert.status !== 'rejected' && (
                <div>
                  <div className="mb-2 text-xs font-medium text-white">审批操作</div>
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="请输入审批意见..."
                    className="mb-3 h-20 w-full resize-none rounded-lg border border-telecom-border bg-slate-900 p-3 text-sm text-white outline-none focus:border-primary-500"
                  />
                  <div className="flex flex-wrap gap-2">
                    {selectedAlert.status === 'pending' && (
                      <button
                        onClick={() => handleApprove(selectedAlert)}
                        disabled={actionLoading}
                        className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-600 disabled:opacity-50"
                      >
                        {actionLoading ? <Loader2 size={14} className="mr-2 inline animate-spin" /> : null}
                        确认预警
                      </button>
                    )}
                    {selectedAlert.level === 2 && (
                      <>
                        <button
                          onClick={() => handleApprove(selectedAlert)}
                          disabled={actionLoading}
                          className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-600 disabled:opacity-50"
                        >
                          {actionLoading ? <Loader2 size={14} className="mr-2 inline animate-spin" /> : null}
                          通过审批
                        </button>
                        <button
                          onClick={() => handleReject(selectedAlert)}
                          disabled={actionLoading}
                          className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-50"
                        >
                          {actionLoading ? <Loader2 size={14} className="mr-2 inline animate-spin" /> : null}
                          驳回
                        </button>
                      </>
                    )}
                    {(selectedAlert.status === 'acknowledged' || selectedAlert.status === 'reviewed' || selectedAlert.status === 'approved') && (
                      <button
                        onClick={() => handleResolve(selectedAlert)}
                        disabled={actionLoading}
                        className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:opacity-50"
                      >
                        {actionLoading ? <Loader2 size={14} className="mr-2 inline animate-spin" /> : null}
                        标记已解决
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alerts;
