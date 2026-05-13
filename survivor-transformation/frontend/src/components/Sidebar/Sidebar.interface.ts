import type { HTMLAttributes, ButtonHTMLAttributes } from 'react';

export interface SidebarProviderProps {
  children: React.ReactNode;
}

export interface SidebarProps extends HTMLAttributes<HTMLDivElement> {}
export interface SidebarInsetProps extends HTMLAttributes<HTMLDivElement> {}
export interface SidebarTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {}
export interface SidebarHeaderProps extends HTMLAttributes<HTMLDivElement> {}
export interface SidebarContentProps extends HTMLAttributes<HTMLDivElement> {}
export interface SidebarGroupProps extends HTMLAttributes<HTMLDivElement> {}
export interface SidebarGroupLabelProps extends HTMLAttributes<HTMLDivElement> {}
export interface SidebarGroupContentProps extends HTMLAttributes<HTMLDivElement> {}
export interface SidebarMenuProps extends HTMLAttributes<HTMLUListElement> {}
export interface SidebarMenuItemProps extends HTMLAttributes<HTMLLIElement> {}
export interface SidebarMenuButtonProps extends HTMLAttributes<HTMLAnchorElement & HTMLButtonElement> {
  asChild?: boolean;
  isActive?: boolean;
}
export interface SidebarFooterProps extends HTMLAttributes<HTMLDivElement> {}
