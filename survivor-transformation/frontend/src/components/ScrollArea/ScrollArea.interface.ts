import type { HTMLAttributes } from 'react';

export interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  /** Optional fixed height (e.g. '200px', '50vh') */
  height?: string;
}
