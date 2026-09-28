import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

interface Props {
  id?: string;
  title: string;
  value: number | string;
  suffix?: string;
  prefix?: string;
  change?: number;
  changePeriod?: string;
  icon: LucideIcon;
  color?: 'indigo' | 'saffron' | 'emerald' | 'sky' | 'rose' | 'purple';
  subtext?: string;
  highlight?: boolean;
}

export const KpiCard: React.FC<Props> = ({
  id,
  title,
  value,
  suffix = '',
  prefix = '',
  change,
  changePeriod = 'vs prior year',
  icon: Icon,
  color = 'indigo',
  subtext,
  highlight = false
}) => {
  const [displayValue, setDisplayValue] = useState<number | string>(
    typeof value === 'number' ? 0 : value
  );

  useEffect(() => {
    if (typeof value !== 'number') {
      setDisplayValue(value);
      return;
    }

    const duration = 600;
    const start = 0;
    const end = value;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      const current = Math.round(start + (end - start) * eased);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(end);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <div
      id={id}
      title={`${title}: ${prefix}${typeof displayValue === 'number' ? displayValue.toLocaleString('en-IN') : displayValue}${suffix}`}
      className={`rounded-[20px] border p-3.5 sm:p-4 transition-all duration-200 w-full min-w-0 max-w-full overflow-hidden flex flex-col justify-between ${
        highlight
          ? 'bg-[#FFF9E9] border-[#F8D84A] shadow-[0_3px_14px_rgba(35,38,45,0.06)]'
          : 'bg-white border-[#E2E2DE] shadow-[0_3px_14px_rgba(35,38,45,0.04)]'
      }`}
    >
      {/* Top row: Label & Icon */}
      <div className="flex items-center justify-between gap-1.5 w-full min-w-0">
        <span
          className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-[#74767D] truncate min-w-0 flex-1"
          title={title}
        >
          {title}
        </span>
        <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full bg-[#F1F1EE] border border-[#E2E2DE] text-[#303030] flex items-center justify-center shrink-0">
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Metric Value: light font, large but fully responsive and contained */}
      <div className="my-2 sm:my-2.5 min-w-0 w-full">
        <div className="text-xl sm:text-2xl font-normal text-[#303030] tracking-tight truncate leading-none">
          {prefix}
          {typeof displayValue === 'number'
            ? displayValue.toLocaleString('en-IN')
            : displayValue}
          {suffix}
        </div>
      </div>

      {/* Footer metadata: trend or subtext, strictly non-overflowing */}
      <div className="pt-2 border-t border-[#E2E2DE] flex items-center justify-between text-[10px] text-[#74767D] min-w-0 w-full gap-1">
        {change !== undefined ? (
          <div className="flex items-center gap-1 min-w-0 truncate w-full">
            {change >= 0 ? (
              <span className="inline-flex items-center text-[#305B35] bg-[#BFE7C2]/50 px-1.5 py-0.5 rounded-full font-medium shrink-0">
                <TrendingUp className="w-3 h-3 mr-0.5" />+{change}%
              </span>
            ) : (
              <span className="inline-flex items-center text-[#8A3030] bg-[#FCE8E8] px-1.5 py-0.5 rounded-full font-medium shrink-0">
                <TrendingDown className="w-3 h-3 mr-0.5" />
                {change}%
              </span>
            )}
            <span className="text-[#9A9A9A] truncate min-w-0" title={changePeriod}>
              {changePeriod}
            </span>
          </div>
        ) : (
          <span className="text-[#74767D] truncate w-full" title={subtext || 'Verified government metric'}>
            {subtext || 'Verified metric'}
          </span>
        )}
      </div>
    </div>
  );
};
