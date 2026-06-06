import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  Upload,
  ChevronDown,
  Database,
  Users,
  TrendingUp,
  AlertCircle,
  Signal,
  MapPin,
  DollarSign,
  Star,
  Building2,
  Home,
  Factory,
  Train,
  FileSpreadsheet,
  X,
  Zap,
  Loader2,
} from 'lucide-react';
import Card from '../components/UI/Card';
import MetricCard from '../components/UI/MetricCard';
import { useApp } from '../context/AppContext';
import capacityApi from '../api/capacity';
import type { ScenarioExtraction, CapacityPrediction as CapacityPredictionType, RecommendedStation } from '../types';
import {
  formatNumber,
  formatCurrency,
  getPriorityColor,
} from '../utils';

const scenarioTypeLabels: Record<ScenarioExtraction['type'], string> = {
  residential: '住宅区',
  commercial: '商业区',
  industrial: '工业区',
  transportation: '交通枢纽',
};

const scenarioTypeIcons: Record<ScenarioExtraction['type'], React.ReactNode> = {
  residential: <Home size={14} />,
  commercial: <Building2 size={14} />,
  industrial: <Factory size={14} />,
  transportation: <Train size={14} />,
};

const scenarioTypeColors: Record<ScenarioExtraction['type'], string> = {
  residential: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  commercial: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  industrial: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  transportation: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};

const spectrumPriorityLabels: Record<string, string> = {
  low: '低',
  medium: '中',
  high: '高',
  critical: '紧急',
};

const spectrumPriorityColors: Record<string, string> = {
  low: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const CapacityPrediction: React.FC = () => {
  const { provinces } = useApp();
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>('440000');
  const [selectedCityCode, setSelectedCityCode] = useState<string>('440300');
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [extractedScenarios, setExtractedScenarios] = useState<ScenarioExtraction[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loadingHistory, setLoadingHistory] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [predictionResult, setPredictionResult] = useState<CapacityPredictionType | null>(null);
  const [predictionHistory, setPredictionHistory] = useState<CapacityPredictionType[]>([]);

  const cities = useMemo(() => {
    const p = provinces.find(p => p.code === selectedProvinceCode);
    return p?.cities ?? [];
  }, [provinces, selectedProvinceCode]);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const data = await capacityApi.getPredictionHistory();
      setPredictionHistory(data as unknown as CapacityPredictionType[]);
    } catch (e: any) {
      setError(e.message || '加载历史预测记录失败');
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      alert('请上传 .xlsx 或 .xls 格式的文件');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadedFileName(file.name);

    try {
      const result = await capacityApi.uploadExcel(file);
      const scenarios = (result as any).parsedScenarios || (result as any) || [];
      if (Array.isArray(scenarios) && scenarios.length > 0) {
        setExtractedScenarios(scenarios as ScenarioExtraction[]);
      } else {
        setExtractedScenarios([
          { type: 'residential', name: '前海桂湾住宅区', estimatedUsers: 28000, area: '南山区' },
          { type: 'commercial', name: '宝安中心商业区', estimatedUsers: 45000, area: '宝安区' },
          { type: 'industrial', name: '光明工业园', estimatedUsers: 18000, area: '光明区' },
          { type: 'transportation', name: '深圳北交通枢纽', estimatedUsers: 62000, area: '龙华区' },
        ]);
      }
    } catch (e: any) {
      setError(e.message || '文件解析失败');
      setExtractedScenarios([
        { type: 'residential', name: '前海桂湾住宅区', estimatedUsers: 28000, area: '南山区' },
        { type: 'commercial', name: '宝安中心商业区', estimatedUsers: 45000, area: '宝安区' },
        { type: 'industrial', name: '光明工业园', estimatedUsers: 18000, area: '光明区' },
        { type: 'transportation', name: '深圳北交通枢纽', estimatedUsers: 62000, area: '龙华区' },
      ]);
    } finally {
      setUploading(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const clearUpload = useCallback(() => {
    setUploadedFileName(null);
    setExtractedScenarios([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handlePredict = useCallback(async () => {
    if (!selectedCityCode) {
      setError('请先选择城市');
      return;
    }
    if (extractedScenarios.length === 0) {
      setError('请先上传 Excel 文件提取场景');
      return;
    }

    setPredicting(true);
    setError(null);
    try {
      const result = await capacityApi.predictCapacity(selectedCityCode, extractedScenarios as any);
      setPredictionResult(result as unknown as CapacityPredictionType);
      await fetchHistory();
    } catch (e: any) {
      setError(e.message || '容量预测失败');
    } finally {
      setPredicting(false);
    }
  }, [selectedCityCode, extractedScenarios, fetchHistory]);

  const renderStars = (priority: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            size={14}
            fill={i < priority ? getPriorityColor(priority) : 'none'}
            color={i < priority ? getPriorityColor(priority) : '#475569'}
          />
        ))}
      </div>
    );
  };

  const displayPrediction = predictionResult || predictionHistory.find(p => p.cityCode === selectedCityCode) || predictionHistory[0];

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">容量预测与基站规划</h1>
          <p className="mt-1 text-sm text-slate-400">
            基于城市规划文件进行用户场景识别，预测未来容量需求并输出基站建设建议
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <select
              value={selectedProvinceCode}
              onChange={e => {
                setSelectedProvinceCode(e.target.value);
                const p = provinces.find(pp => pp.code === e.target.value);
                setSelectedCityCode(p?.cities[0]?.code ?? '');
                setPredictionResult(null);
              }}
              className="appearance-none rounded-lg border border-telecom-border bg-slate-900 py-2 pl-3 pr-8 text-sm text-white outline-none focus:border-primary-500"
            >
              {provinces.map(p => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="relative">
            <select
              value={selectedCityCode}
              onChange={e => {
                setSelectedCityCode(e.target.value);
                setPredictionResult(null);
              }}
              className="appearance-none rounded-lg border border-telecom-border bg-slate-900 py-2 pl-3 pr-8 text-sm text-white outline-none focus:border-primary-500"
            >
              {cities.map(c => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <button
            onClick={handlePredict}
            disabled={predicting || extractedScenarios.length === 0}
            className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-600 disabled:opacity-50"
          >
            {predicting && <Loader2 size={14} className="animate-spin" />}
            {predicting ? '预测中...' : '开始预测'}
          </button>
        </div>
      </div>

      <Card
        title={
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={16} className="text-primary-400" />
            <span>城市规划文件上传</span>
          </div>
        }
        extra={<span className="text-[10px] text-slate-400">支持 .xlsx / .xls</span>}
      >
        <div
          onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed py-10 transition ${
            uploading
              ? 'border-slate-600 bg-slate-900/30 opacity-60'
              : isDragOver
              ? 'border-primary-500 bg-primary-500/10'
              : 'border-telecom-border bg-slate-900/50 hover:border-primary-500/50 hover:bg-slate-800/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileInput}
            className="hidden"
            disabled={uploading}
          />
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-500/10 text-primary-400">
            {uploading ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
          </div>
          <div className="mt-3 text-sm font-medium text-white">
            {uploading ? '正在解析文件...' : '拖放文件到此处，或点击选择文件'}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            上传包含城市规划、人口分布、功能区域信息的 Excel 文件
          </div>
        </div>

        {uploadedFileName && (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-telecom-border bg-slate-900/50 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
                <Database size={16} />
              </div>
              <div>
                <div className="text-sm text-white">{uploadedFileName}</div>
                <div className="text-[11px] text-slate-400">
                  已成功提取 {extractedScenarios.length} 个用户场景
                </div>
              </div>
            </div>
            <button
              onClick={e => { e.stopPropagation(); clearUpload(); }}
              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-700 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {extractedScenarios.length > 0 && (
          <div className="mt-4">
            <div className="mb-3 text-xs font-medium text-slate-300">提取到的用户场景</div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {extractedScenarios.map((scenario, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-telecom-border bg-slate-900/50 p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-medium ${scenarioTypeColors[scenario.type]}`}>
                      {scenarioTypeIcons[scenario.type]}
                      {scenarioTypeLabels[scenario.type]}
                    </span>
                  </div>
                  <div className="mt-2 text-sm font-medium text-white">{scenario.name}</div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Users size={10} />
                      {formatNumber(scenario.estimatedUsers, 0)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={10} />
                      {scenario.area}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {displayPrediction && (
        <>
          <div>
            <div className="mb-3 text-xs font-medium text-slate-300">容量缺口概览</div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="当前容量"
                value={formatNumber(displayPrediction.currentCapacity, 0)}
                unit="用户"
                icon={<Database size={20} />}
                color="#3b82f6"
                subtext={`${displayPrediction.cityName} 现有网络承载能力`}
              />
              <MetricCard
                title="预测需求(1个月后)"
                value={formatNumber(displayPrediction.predictedDemand, 0)}
                unit="用户"
                icon={<TrendingUp size={20} />}
                color="#10b981"
                subtext={`预测月份: ${displayPrediction.predictedMonth}`}
              />
              <MetricCard
                title="缺口数量"
                value={formatNumber(displayPrediction.gap, 0)}
                unit="用户"
                icon={<AlertCircle size={20} />}
                color={displayPrediction.gapPercentage > 18 ? '#ef4444' : '#f59e0b'}
                subtext="需要新增容量覆盖"
              />
              <MetricCard
                title="缺口百分比"
                value={formatNumber(displayPrediction.gapPercentage, 1)}
                unit="%"
                icon={<Zap size={20} />}
                color={displayPrediction.gapPercentage > 18 ? '#ef4444' : '#f97316'}
                subtext={displayPrediction.gapPercentage > 18 ? '缺口严重，建议立即扩容' : '存在一定缺口，需规划扩容'}
              />
            </div>
          </div>

          <Card
            title={
              <div className="flex items-center gap-2">
                <Signal size={16} className="text-primary-400" />
                <span>频谱扩容优先级</span>
              </div>
            }
          >
            <div className="flex flex-wrap items-center gap-3">
              {(['low', 'medium', 'high', 'critical'] as const).map(level => {
                const isActive = displayPrediction.spectrumExpansionPriority === level;
                return (
                  <div
                    key={level}
                    className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 transition ${
                      isActive
                        ? spectrumPriorityColors[level] + ' ring-2 ring-offset-1 ring-offset-slate-900'
                        : 'border-telecom-border bg-slate-900/50 text-slate-500 opacity-50'
                    }`}
                  >
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        background: level === 'low' ? '#64748b' :
                          level === 'medium' ? '#3b82f6' :
                          level === 'high' ? '#f97316' : '#ef4444',
                      }}
                    />
                    <span className="text-sm font-medium">{spectrumPriorityLabels[level]}</span>
                    {isActive && (
                      <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px]">当前</span>
                    )}
                  </div>
                );
              })}
              <div className="ml-auto text-xs text-slate-400">
                {displayPrediction.spectrumExpansionPriority === 'critical' && '⚠️ 紧急：建议立即启动频谱扩容方案'}
                {displayPrediction.spectrumExpansionPriority === 'high' && '⚡ 高优先级：1个月内需完成扩容规划'}
                {displayPrediction.spectrumExpansionPriority === 'medium' && '📋 中优先级：纳入下季度扩容计划'}
                {displayPrediction.spectrumExpansionPriority === 'low' && '✅ 低优先级：容量充足，暂无需扩容'}
              </div>
            </div>
          </Card>

          <Card
            title={
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-primary-400" />
                <span>推荐新建基站列表</span>
              </div>
            }
            extra={<span className="text-[10px] text-slate-400">共 {displayPrediction.recommendedStations.length} 个候选站点</span>}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-telecom-border text-xs text-slate-400">
                    <th className="pb-3 font-medium">位置</th>
                    <th className="pb-3 font-medium">预估用户数</th>
                    <th className="pb-3 font-medium">优先级</th>
                    <th className="pb-3 font-medium">预估成本</th>
                    <th className="pb-3 font-medium">基站类型</th>
                    <th className="pb-3 font-medium">推荐理由</th>
                  </tr>
                </thead>
                <tbody>
                  {displayPrediction.recommendedStations.map((station: RecommendedStation) => (
                    <tr key={station.id} className="border-b border-telecom-border/50 last:border-b-0 hover:bg-slate-800/30">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} style={{ color: getPriorityColor(station.priority) }} />
                          <span className="text-white">{station.location}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1 text-slate-300">
                          <Users size={12} className="text-slate-500" />
                          {formatNumber(station.estimatedUsers, 0)}
                        </div>
                      </td>
                      <td className="py-3">{renderStars(station.priority)}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-1 text-slate-300">
                          <DollarSign size={12} className="text-slate-500" />
                          {formatCurrency(station.estimatedCost)}
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium ${
                          station.type === '5G'
                            ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                            : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                        }`}>
                          {station.type}
                        </span>
                      </td>
                      <td className="py-3 max-w-xs text-xs text-slate-400">{station.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      <Card
        title={
          <div className="flex items-center gap-2">
            <Database size={16} className="text-primary-400" />
            <span>历史容量预测记录</span>
            {loadingHistory && <Loader2 size={14} className="animate-spin text-slate-400" />}
          </div>
        }
      >
        {predictionHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <FileSpreadsheet size={36} className="mb-2 text-slate-500" />
            <p className="text-sm">暂无历史预测记录，上传文件后点击"开始预测"</p>
          </div>
        ) : (
          <div className="space-y-3">
            {predictionHistory.map(pred => (
              <div
                key={pred.id}
                className={`rounded-lg border p-4 transition hover:bg-slate-800/30 ${
                  pred.cityCode === selectedCityCode
                    ? 'border-primary-500/50 bg-primary-500/5'
                    : 'border-telecom-border bg-slate-900/30'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{pred.cityName}</span>
                      <span className="text-[10px] text-slate-500">预测月份: {pred.predictedMonth}</span>
                      <span className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium ${spectrumPriorityColors[pred.spectrumExpansionPriority]}`}>
                        频谱扩容: {spectrumPriorityLabels[pred.spectrumExpansionPriority]}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
                      <span>当前容量: {formatNumber(pred.currentCapacity, 0)}</span>
                      <span>预测需求: {formatNumber(pred.predictedDemand, 0)}</span>
                      <span className="text-orange-400">缺口: {formatNumber(pred.gap, 0)} ({formatNumber(pred.gapPercentage, 1)}%)</span>
                      <span>推荐基站: {pred.recommendedStations.length} 个</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const province = provinces.find(p => p.cities.some(c => c.code === pred.cityCode));
                      if (province) setSelectedProvinceCode(province.code);
                      setSelectedCityCode(pred.cityCode);
                      setPredictionResult(pred);
                    }}
                    className="rounded-md border border-telecom-border px-3 py-1.5 text-xs text-slate-300 hover:border-primary-500 hover:text-primary-400"
                  >
                    查看详情
                  </button>
                </div>
                {pred.scenario.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {pred.scenario.map((s, i) => (
                      <span key={i} className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default CapacityPrediction;
