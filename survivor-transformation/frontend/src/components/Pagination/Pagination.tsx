import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Pagination.module.less';
import type {
  PaginationProps,
  PaginationContentProps,
  PaginationItemProps,
  PaginationLinkProps,
  PaginationEllipsisProps,
} from './Pagination.interface';

export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  ({ className, 'aria-label': ariaLabel, ...props }, ref) => {
    const { t } = useTranslation('common');
    return (
      <nav
        ref={ref}
        role="navigation"
        aria-label={ariaLabel ?? t('a11y.pagination')}
        className={`${styles.root} ${className ?? ''}`.trim()}
        {...props}
      />
    );
  },
);
Pagination.displayName = 'Pagination';

export const PaginationContent = forwardRef<HTMLUListElement, PaginationContentProps>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={`${styles.list} ${className ?? ''}`.trim()} {...props} />
  )
);
PaginationContent.displayName = 'PaginationContent';

export const PaginationItem = forwardRef<HTMLLIElement, PaginationItemProps>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={`${styles.item} ${className ?? ''}`.trim()} {...props} />
  )
);
PaginationItem.displayName = 'PaginationItem';

export const PaginationLink = forwardRef<HTMLAnchorElement, PaginationLinkProps>(
  ({ className, isActive, ...props }, ref) => (
    <a
      ref={ref}
      className={`${styles.link} ${isActive ? styles.active : ''} ${className ?? ''}`.trim()}
      aria-current={isActive ? 'page' : undefined}
      {...props}
    />
  )
);
PaginationLink.displayName = 'PaginationLink';

export const PaginationPrevious = forwardRef<HTMLAnchorElement, PaginationLinkProps>(
  (props, ref) => <PaginationLink ref={ref} {...props} />
);
PaginationPrevious.displayName = 'PaginationPrevious';

export const PaginationNext = forwardRef<HTMLAnchorElement, PaginationLinkProps>(
  (props, ref) => <PaginationLink ref={ref} {...props} />
);
PaginationNext.displayName = 'PaginationNext';

export const PaginationEllipsis = forwardRef<HTMLSpanElement, PaginationEllipsisProps>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className={`${styles.ellipsis} ${className ?? ''}`.trim()} {...props}>
      &#8230;
    </span>
  )
);
PaginationEllipsis.displayName = 'PaginationEllipsis';
