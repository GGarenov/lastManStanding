import type { HTMLAttributes, ButtonHTMLAttributes } from 'react';

export interface TabsProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {}
export interface TabsTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}
export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}
