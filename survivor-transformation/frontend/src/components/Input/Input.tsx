import { forwardRef } from 'react';
import styles from './Input.module.less';
import type { InputProps } from './Input.interface';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={`${styles.input} ${className ?? ''}`.trim()}
      {...props}
    />
  )
);
Input.displayName = 'Input';
