import type { HTMLAttributes, AnchorHTMLAttributes } from 'react';

export interface PaginationProps extends HTMLAttributes<HTMLElement> {}
export interface PaginationContentProps extends HTMLAttributes<HTMLUListElement> {}
export interface PaginationItemProps extends HTMLAttributes<HTMLLIElement> {}
export interface PaginationLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  isActive?: boolean;
}
export interface PaginationEllipsisProps extends HTMLAttributes<HTMLSpanElement> {}
