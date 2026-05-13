import { forwardRef } from 'react';
import styles from './Skeleton.module.less';
import type { SkeletonProps } from './Skeleton.interface';

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={`${styles.skeleton} ${className ?? ''}`.trim()} {...props} />
  )
);
Skeleton.displayName = 'Skeleton';
