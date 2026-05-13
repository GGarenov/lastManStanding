import type { HTMLAttributes, ButtonHTMLAttributes } from 'react';

export interface AlertDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export interface AlertDialogTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {}
export interface AlertDialogContentProps extends HTMLAttributes<HTMLDivElement> {}
export interface AlertDialogHeaderProps extends HTMLAttributes<HTMLDivElement> {}
export interface AlertDialogFooterProps extends HTMLAttributes<HTMLDivElement> {}
export interface AlertDialogTitleProps extends HTMLAttributes<HTMLHeadingElement> {}
export interface AlertDialogDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}
export interface AlertDialogActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {}
export interface AlertDialogCancelProps extends ButtonHTMLAttributes<HTMLButtonElement> {}
