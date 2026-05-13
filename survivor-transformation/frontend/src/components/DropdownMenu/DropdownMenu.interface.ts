import type { HTMLAttributes, ButtonHTMLAttributes } from 'react';

export interface DropdownMenuProps {
  children: React.ReactNode;
}

export interface DropdownMenuTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export interface DropdownMenuContentProps extends HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end';
}

export interface DropdownMenuItemProps extends HTMLAttributes<HTMLDivElement> {
  onSelect?: () => void;
}
