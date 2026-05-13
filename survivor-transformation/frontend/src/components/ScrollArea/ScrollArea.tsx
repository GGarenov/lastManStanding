import { forwardRef } from 'react';
import styles from './ScrollArea.module.less';
import type { ScrollAreaProps } from './ScrollArea.interface';

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, height, style, ...props }, ref) => (
    <div
      ref={ref}
      className={`${styles.root} ${className ?? ''}`.trim()}
      style={height ? { height, ...style } : style}
      {...props}
    >
      <div className={styles.viewport}>
        {children}
      </div>
    </div>
  )
);
ScrollArea.displayName = 'ScrollArea';
