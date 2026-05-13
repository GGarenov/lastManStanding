import { forwardRef } from 'react';
import styles from './Badge.module.less';
import type { BadgeProps } from './Badge.interface';

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', className, ...props }, ref) => (
    <span
      ref={ref}
      className={`${styles.badge} ${styles[variant]} ${className ?? ''}`.trim()}
      {...props}
    />
  )
);
Badge.displayName = 'Badge';
