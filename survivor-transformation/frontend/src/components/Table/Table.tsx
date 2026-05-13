import { forwardRef } from 'react';
import styles from './Table.module.less';
import type {
  TableProps,
  TableHeaderProps,
  TableBodyProps,
  TableFooterProps,
  TableRowProps,
  TableHeadProps,
  TableCellProps,
  TableCaptionProps,
} from './Table.interface';

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className, ...props }, ref) => (
    <div className={styles.wrapper}>
      <table ref={ref} className={`${styles.table} ${className ?? ''}`.trim()} {...props} />
    </div>
  )
);
Table.displayName = 'Table';

export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={`${styles.header} ${className ?? ''}`.trim()} {...props} />
  )
);
TableHeader.displayName = 'TableHeader';

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={`${styles.body} ${className ?? ''}`.trim()} {...props} />
  )
);
TableBody.displayName = 'TableBody';

export const TableFooter = forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ className, ...props }, ref) => (
    <tfoot ref={ref} className={`${styles.footer} ${className ?? ''}`.trim()} {...props} />
  )
);
TableFooter.displayName = 'TableFooter';

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, ...props }, ref) => (
    <tr ref={ref} className={`${styles.row} ${className ?? ''}`.trim()} {...props} />
  )
);
TableRow.displayName = 'TableRow';

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, ...props }, ref) => (
    <th ref={ref} className={`${styles.head} ${className ?? ''}`.trim()} {...props} />
  )
);
TableHead.displayName = 'TableHead';

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, ...props }, ref) => (
    <td ref={ref} className={`${styles.cell} ${className ?? ''}`.trim()} {...props} />
  )
);
TableCell.displayName = 'TableCell';

export const TableCaption = forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  ({ className, ...props }, ref) => (
    <caption ref={ref} className={`${styles.caption} ${className ?? ''}`.trim()} {...props} />
  )
);
TableCaption.displayName = 'TableCaption';
