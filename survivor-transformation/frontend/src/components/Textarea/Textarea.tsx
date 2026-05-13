import { forwardRef } from 'react';
import styles from './Textarea.module.less';
import type { TextareaProps } from './Textarea.interface';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={`${styles.textarea} ${className ?? ''}`.trim()}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';
