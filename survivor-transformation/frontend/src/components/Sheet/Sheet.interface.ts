import type { HTMLAttributes, ButtonHTMLAttributes } from 'react';

export interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export interface SheetTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {}
export interface SheetContentProps extends HTMLAttributes<HTMLDivElement> {
  side?: 'top' | 'right' | 'bottom' | 'left';
}
export interface SheetHeaderProps extends HTMLAttributes<HTMLDivElement> {}
export interface SheetTitleProps extends HTMLAttributes<HTMLHeadingElement> {}
