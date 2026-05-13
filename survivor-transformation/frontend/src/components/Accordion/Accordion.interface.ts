import type { HTMLAttributes } from 'react';

export interface AccordionProps {
  type?: 'single' | 'multiple';
  collapsible?: boolean;
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  children: React.ReactNode;
  className?: string;
}

export interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}
export interface AccordionTriggerProps extends HTMLAttributes<HTMLButtonElement> {}
export interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {}
