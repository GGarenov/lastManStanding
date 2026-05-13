import { forwardRef } from 'react';
import styles from './Button.module.less';
import type { ButtonProps } from './Button.interface';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, ...props }, ref) => (
    <button
      ref={ref}
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${className ?? ''}`.trim()}
      {...props}
    />
  )
);
Button.displayName = 'Button';
