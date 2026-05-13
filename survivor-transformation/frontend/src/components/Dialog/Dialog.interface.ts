import type { HTMLAttributes, ButtonHTMLAttributes } from 'react';

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export interface DialogTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {}
export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {}
export interface DialogHeaderProps extends HTMLAttributes<HTMLDivElement> {}
export interface DialogFooterProps extends HTMLAttributes<HTMLDivElement> {}
export interface DialogTitleProps extends HTMLAttributes<HTMLHeadingElement> {}
export interface DialogDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}
export interface DialogCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {}
