import React from 'react';

interface OverviewCardProps {
  id?: string;
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  badges?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const OverviewCard: React.FC<OverviewCardProps> = ({
  id,
  eyebrow,
  title,
  badges,
  children,
  footer,
  className = '',
  hoverEffect = false
}) => {
  return (
    <div
      id={id}
      className={`bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] rounded-none p-6 sm:p-8 select-text ${
        hoverEffect ? 'hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0px_0px_#111111] transition-all' : ''
      } ${className}`}
    >
      {/* Card Header */}
      {(eyebrow || title || badges) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-[2px] border-[#111111] pb-4 mb-6 gap-3">
          <div>
            {eyebrow && (
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500 block mb-0.5">
                {eyebrow}
              </span>
            )}
            <h3 className="text-xl font-black text-[#111111] tracking-tight">
              {title}
            </h3>
          </div>
          {badges && (
            <div className="flex items-center gap-2 flex-wrap">
              {badges}
            </div>
          )}
        </div>
      )}

      {/* Main Body */}
      <div className="space-y-4">
        {children}
      </div>

      {/* Optional Card Footer */}
      {footer && (
        <div className="mt-6 pt-5 border-t-[2px] border-[#111111] flex flex-wrap items-center justify-between gap-3">
          {footer}
        </div>
      )}
    </div>
  );
};
