import { forwardRef } from 'react';
import styles from './Label.module.less';
import type { LabelProps } from './Label.interface';

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label ref={ref} className={`${styles.label} ${className ?? ''}`.trim()} {...props} />
  )
);
Label.displayName = 'Label';
