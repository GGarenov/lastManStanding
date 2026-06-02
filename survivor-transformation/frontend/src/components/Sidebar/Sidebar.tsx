import React, { createContext, useContext, useEffect, useState, forwardRef } from 'react';
import styles from './Sidebar.module.less';
import type {
  SidebarProviderProps,
  SidebarProps,
  SidebarInsetProps,
  SidebarTriggerProps,
  SidebarHeaderProps,
  SidebarContentProps,
  SidebarGroupProps,
  SidebarGroupLabelProps,
  SidebarGroupContentProps,
  SidebarMenuProps,
  SidebarMenuItemProps,
  SidebarMenuButtonProps,
  SidebarFooterProps,
} from './Sidebar.interface';

const SidebarContext = createContext<{ open: boolean; setOpen: (v: boolean) => void } | null>(null);

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [open, setOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= 768;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const onChange = (event: MediaQueryListEvent) => {
      setOpen(event.matches);
    };

    setOpen(mediaQuery.matches);
    mediaQuery.addEventListener('change', onChange);

    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      <div className={styles.provider}>
        {children}
        <button
          type="button"
          className={`${styles.mobileOverlay} ${open ? styles.overlayVisible : ''}`.trim()}
          onClick={() => setOpen(false)}
          aria-label="Close sidebar"
        />
      </div>
    </SidebarContext.Provider>
  );
}

export const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, ...props }, ref) => {
    const ctx = useContext(SidebarContext);
    return (
      <aside
        ref={ref}
        className={`${styles.sidebar} ${ctx?.open ? styles.open : styles.closed} ${className ?? ''}`.trim()}
        {...props}
      />
    );
  }
);
Sidebar.displayName = 'Sidebar';

export const SidebarInset = forwardRef<HTMLDivElement, SidebarInsetProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={`${styles.inset} ${className ?? ''}`.trim()} {...props} />
  )
);
SidebarInset.displayName = 'SidebarInset';

export const SidebarTrigger = forwardRef<HTMLButtonElement, SidebarTriggerProps>(
  ({ className, children, onClick, ...props }, ref) => {
    const ctx = useContext(SidebarContext);
    return (
      <button
        ref={ref}
        type="button"
        className={`${styles.trigger} ${className ?? ''}`.trim()}
        onClick={(e) => {
          ctx?.setOpen((o) => !o);
          onClick?.(e);
        }}
        aria-label="Toggle sidebar"
        {...props}
      >
        {children ?? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        )}
      </button>
    );
  }
);
SidebarTrigger.displayName = 'SidebarTrigger';

export const SidebarHeader = forwardRef<HTMLDivElement, SidebarHeaderProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={`${styles.header} ${className ?? ''}`.trim()} {...props} />
  )
);
SidebarHeader.displayName = 'SidebarHeader';

export const SidebarContent = forwardRef<HTMLDivElement, SidebarContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={`${styles.content} ${className ?? ''}`.trim()} {...props} />
  )
);
SidebarContent.displayName = 'SidebarContent';

export const SidebarGroup = forwardRef<HTMLDivElement, SidebarGroupProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={`${styles.group} ${className ?? ''}`.trim()} {...props} />
  )
);
SidebarGroup.displayName = 'SidebarGroup';

export const SidebarGroupLabel = forwardRef<HTMLDivElement, SidebarGroupLabelProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={`${styles.groupLabel} ${className ?? ''}`.trim()} {...props} />
  )
);
SidebarGroupLabel.displayName = 'SidebarGroupLabel';

export const SidebarGroupContent = forwardRef<HTMLDivElement, SidebarGroupContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={`${styles.groupContent} ${className ?? ''}`.trim()} {...props} />
  )
);
SidebarGroupContent.displayName = 'SidebarGroupContent';

export const SidebarMenu = forwardRef<HTMLUListElement, SidebarMenuProps>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={`${styles.menu} ${className ?? ''}`.trim()} role="list" {...props} />
  )
);
SidebarMenu.displayName = 'SidebarMenu';

export const SidebarMenuItem = forwardRef<HTMLLIElement, SidebarMenuItemProps>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={`${styles.menuItem} ${className ?? ''}`.trim()} {...props} />
  )
);
SidebarMenuItem.displayName = 'SidebarMenuItem';

export const SidebarMenuButton = forwardRef<HTMLButtonElement & HTMLAnchorElement, SidebarMenuButtonProps>(
  ({ asChild, isActive, className, children, ...props }, ref) => {
    const classes = `${styles.menuButton} ${isActive ? styles.active : ''} ${className ?? ''}`.trim();
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<{ className?: string }>, {
        className: `${(children as React.ReactElement<{ className?: string }>).props.className ?? ''} ${classes}`.trim(),
      });
    }
    return (
      <button ref={ref as React.Ref<HTMLButtonElement>} type="button" className={classes} {...props}>
        {children}
      </button>
    );
  }
);
SidebarMenuButton.displayName = 'SidebarMenuButton';

export const SidebarFooter = forwardRef<HTMLDivElement, SidebarFooterProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={`${styles.footer} ${className ?? ''}`.trim()} {...props} />
  )
);
SidebarFooter.displayName = 'SidebarFooter';
