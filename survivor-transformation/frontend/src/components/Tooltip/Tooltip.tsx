import { forwardRef } from 'react';
import styles from './Tooltip.module.less';
import type { TooltipProviderProps, TooltipProps, TooltipTriggerProps, TooltipContentProps } from './Tooltip.interface';

/** Wrapper for app-level tooltip config. No-op for CSS-based tooltips. */
export function TooltipProvider({ children }: TooltipProviderProps) {
  return <>{children}</>;
}

export function Tooltip({ children }: TooltipProps) {
  return <div className={styles.root}>{children}</div>;
}

export const TooltipTrigger = forwardRef<HTMLDivElement, TooltipTriggerProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={`${styles.trigger} ${className ?? ''}`.trim()} {...props} />
  )
);
TooltipTrigger.displayName = 'TooltipTrigger';

export const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, sideOffset = 4, style, ...props }, ref) => (
    <div
      ref={ref}
      role="tooltip"
      className={`${styles.content} ${className ?? ''}`.trim()}
      style={{ marginBottom: sideOffset, ...style }}
      {...props}
    />
  )
);
TooltipContent.displayName = 'TooltipContent';
