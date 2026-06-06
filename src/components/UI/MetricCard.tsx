import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import clsx from 'clsx';

interface MetricCardProps {
  title: string;
  value: string;
  unit?: string;
  change?: number;
  changeLabel?: string;
  isGoodWhenDown?: boolean;
  icon?: React.ReactNode;
  color?: string;
  subtext?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  change,
  changeLabel = '环比',
  isGoodWhenDown = false,
  icon,
  color = '#3b82f6',
  subtext,
}) => {
  const isPositive = isGoodWhenDown ? (change ?? 0) < 0 : (change ?? 0) > 0;
  const isNeutral = change === 0;

  return (
    <div className="glass-card relative overflow-hidden rounded-xl p-5 transition-transform hover:scale-[1.02]">
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-10" style={{ background: color }} />
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-slate-400">{title}</div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">{value}</span>
            {unit && <span className="text-xs text-slate-400">{unit}</span>}
          </div>
          {change !== undefined && (
            <div
              className={clsx(
                'mt-2 flex items-center gap-1 text-xs',
                isNeutral
                  ? 'text-slate-400'
                  : isPositive
                  ? 'text-green-400'
                  : 'text-red-400',
              )}
            >
              {isNeutral ? (
                <Minus size={12} />
              ) : isPositive ? (
                <TrendingUp size={12} />
              ) : (
                <TrendingDown size={12} />
              )}
              <span>
                {changeLabel}: {Math.abs(change).toFixed(2)}%
              </span>
            </div>
          )}
          {subtext && <div className="mt-1 text-[11px] text-slate-500">{subtext}</div>}
        </div>
        {icon && (
          <div
            className="flex h-11 w-11 items-center justify-center rounded-lg"
            style={{ background: `${color}20`, color }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
