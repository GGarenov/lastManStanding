import React, { createContext, useContext, forwardRef } from 'react';
import styles from './Sheet.module.less';
import type { SheetProps, SheetTriggerProps, SheetContentProps, SheetHeaderProps, SheetTitleProps } from './Sheet.interface';

const SheetContext = createContext<{ open: boolean; onOpenChange: (open: boolean) => void } | null>(null);

function useSheet() {
  const ctx = useContext(SheetContext);
  if (!ctx) throw new Error('Sheet components must be used within Sheet');
  return ctx;
}

export function Sheet({ open = false, onOpenChange, children }: SheetProps) {
  return (
    <SheetContext.Provider value={{ open, onOpenChange: onOpenChange ?? (() => {}) }}>
      {children}
    </SheetContext.Provider>
  );
}

export const SheetTrigger = forwardRef<HTMLButtonElement, SheetTriggerProps>(
  ({ children, onClick, ...props }, ref) => {
    const { onOpenChange } = useSheet();
    return (
      <button
        ref={ref}
        type="button"
        onClick={(e) => {
          onOpenChange(true);
          onClick?.(e);
        }}
        {...props}
      >
        {children}
      </button>
    );
  }
);
SheetTrigger.displayName = 'SheetTrigger';

export const SheetContent = forwardRef<HTMLDivElement, SheetContentProps>(
  ({ side = 'right', className, children, ...props }, ref) => {
    const { open, onOpenChange } = useSheet();
    if (!open) return null;
    return (
      <>
        <div
          className={styles.overlay}
          role="presentation"
          onClick={() => onOpenChange(false)}
          onKeyDown={(e) => e.key === 'Escape' && onOpenChange(false)}
        />
        <div
          ref={ref}
          className={`${styles.panel} ${styles[side]} ${className ?? ''}`.trim()}
          role="dialog"
          aria-modal
          {...props}
        >
          {children}
        </div>
      </>
    );
  }
);
SheetContent.displayName = 'SheetContent';

export const SheetHeader = forwardRef<HTMLDivElement, SheetHeaderProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={`${styles.header} ${className ?? ''}`.trim()} {...props} />
  )
);
SheetHeader.displayName = 'SheetHeader';

export const SheetTitle = forwardRef<HTMLHeadingElement, SheetTitleProps>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={`${styles.title} ${className ?? ''}`.trim()} {...props} />
  )
);
SheetTitle.displayName = 'SheetTitle';
