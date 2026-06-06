import React from 'react';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  extra?: React.ReactNode;
  padding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, title, extra, padding = true }) => {
  return (
    <div className={clsx('glass-card rounded-xl overflow-hidden', className)}>
      {(title || extra) && (
        <div className="flex items-center justify-between border-b border-telecom-border px-5 py-3">
          {typeof title === 'string' ? <h3 className="text-sm font-semibold text-white">{title}</h3> : title}
          {extra}
        </div>
      )}
      <div className={padding ? 'p-5' : ''}>{children}</div>
    </div>
  );
};

export default Card;
