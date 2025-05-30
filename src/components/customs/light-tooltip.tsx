import { memo, forwardRef } from 'react';
import { cn } from '@/libraries/utils';

interface LightTooltipProps {
  tip: string;
  children: React.ReactNode;
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  offset?: number;
}

const LightTooltip = memo(forwardRef<HTMLDivElement, LightTooltipProps>(({
  tip,
  children,
  className,
  position = 'top',
  delay = 100,
  offset = 4,
}, ref) => {
  if (!tip) return <>{children}</>;

  return (
    <div 
      ref={ref}
      className={cn(
        'group/tooltip inline-block relative z-[25]',
        className
      )}
      style={{ 
        '--tooltip-delay': `${delay}ms`,
        '--tooltip-offset': `${offset}px`
      } as React.CSSProperties}
    >
      {children}
      <div
        role="tooltip"
        className={cn(
          'pointer-events-none absolute z-[1000] whitespace-nowrap rounded-sm bg-[#2B2B3B] px-2 py-1 text-xs text-fontColorPrimary opacity-0',
          'group-hover/tooltip:opacity-100', 
          {
            'left-1/2 -translate-x-1/2 -translate-y-full top-0 -mt-[var(--tooltip-offset)]': position === 'top',
            'left-1/2 -translate-x-1/2 translate-y-full bottom-0 -mb-[var(--tooltip-offset)]': position === 'bottom',
            'top-1/2 -translate-y-1/2 -translate-x-full left-0 -ml-[var(--tooltip-offset)]': position === 'left',
            'top-1/2 -translate-y-1/2 translate-x-full right-0 -mr-[var(--tooltip-offset)]': position === 'right',
          }
        )} 
      >
        {tip}
        <div 
          className={cn(
            'absolute h-0 w-0 border-[5px] border-transparent',
            {
              'left-1/2 -ml-1 -bottom-2 border-t-[#2B2B3B]': position === 'top',
              'left-1/2 -ml-1 -top-2 border-b-[#2B2B3B]': position === 'bottom',
              'top-1/2 -mt-1 -right-2 border-l-[#2B2B3B]': position === 'left',
              'top-1/2 -mt-1 -left-2 border-r-[#2B2B3B]': position === 'right',
            }
          )}
        />
      </div>
    </div>
  );
}));

LightTooltip.displayName = 'LightTooltip';

export default LightTooltip;