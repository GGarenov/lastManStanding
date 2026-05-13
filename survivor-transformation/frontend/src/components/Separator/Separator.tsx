import { forwardRef } from 'react';
import styles from './Separator.module.less';
import type { SeparatorProps } from './Separator.interface';

export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(
  ({ orientation = 'horizontal', decorative = true, className, role, ...props }, ref) => (
    <div
      ref={ref}
      role={decorative ? 'none' : 'separator'}
      aria-orientation={decorative ? undefined : orientation}
      className={`${styles.separator} ${styles[orientation]} ${className ?? ''}`.trim()}
      {...props}
    />
  )
);
Separator.displayName = 'Separator';
