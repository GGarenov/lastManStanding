import React, { createContext, useContext, useState, useRef, useEffect, useLayoutEffect, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './DropdownMenu.module.less';
import type {
  DropdownMenuProps,
  DropdownMenuTriggerProps,
  DropdownMenuContentProps,
  DropdownMenuItemProps,
} from './DropdownMenu.interface';

const DropdownMenuContext = createContext<{
  open: boolean;
  setOpen: (v: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
} | null>(null);

function useDropdownMenu() {
  const ctx = useContext(DropdownMenuContext);
  if (!ctx) throw new Error('DropdownMenu components must be used within DropdownMenu');
  return ctx;
}

const GAP = 4;

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, triggerRef }}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

export const DropdownMenuTrigger = forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ asChild, children, onClick, ...props }, ref) => {
    const { setOpen, triggerRef } = useDropdownMenu();
    const setRefs = (el: HTMLButtonElement | null) => {
      (triggerRef as React.MutableRefObject<HTMLButtonElement | null>).current = el;
      if (typeof ref === 'function') ref(el);
      else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = el;
    };
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<{ ref?: React.Ref<HTMLButtonElement>; onClick?: (e: React.MouseEvent) => void }>, {
        ref: setRefs,
        onClick: (e: React.MouseEvent) => {
          setOpen((o) => !o);
          (children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>).props?.onClick?.(e);
        },
      });
    }
    return (
      <button
        ref={setRefs}
        type="button"
        className={styles.trigger}
        onClick={(e) => {
          setOpen((o) => !o);
          onClick?.(e);
        }}
        aria-haspopup="menu"
        aria-expanded={undefined}
        {...props}
      >
        {children}
      </button>
    );
  }
);
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

type ContentPosition = { top: number; left: number } | { bottom: number; left: number };

export const DropdownMenuContent = forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ align = 'end', className, children, ...props }, ref) => {
    const { open, setOpen, triggerRef } = useDropdownMenu();
    const contentRef = useRef<HTMLDivElement | null>(null);
    const [position, setPosition] = useState<ContentPosition | null>(null);

    useEffect(() => {
      if (!open) return;
      const onDocClick = (e: MouseEvent) => {
        if (
          contentRef.current?.contains(e.target as Node) ||
          triggerRef.current?.contains(e.target as Node)
        ) return;
        setOpen(false);
      };
      const onEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setOpen(false);
      };
      document.addEventListener('mousedown', onDocClick);
      document.addEventListener('keydown', onEscape);
      return () => {
        document.removeEventListener('mousedown', onDocClick);
        document.removeEventListener('keydown', onEscape);
      };
    }, [open, setOpen, triggerRef]);

    useLayoutEffect(() => {
      if (!open || !triggerRef.current) {
        setPosition(null);
        return;
      }
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const contentEl = contentRef.current;
      if (!contentEl) return;

      const contentRect = contentEl.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const viewportW = window.innerWidth;

      let left = triggerRect.left;
      if (align === 'end') left = triggerRect.right - contentRect.width;
      else if (align === 'center') left = triggerRect.left + (triggerRect.width - contentRect.width) / 2;
      left = Math.max(8, Math.min(viewportW - contentRect.width - 8, left));

      const spaceBelow = viewportH - triggerRect.bottom - GAP;
      const openUp = spaceBelow < contentRect.height && triggerRect.top > contentRect.height + GAP;

      if (openUp) {
        setPosition({ bottom: viewportH - triggerRect.top + GAP, left });
      } else {
        setPosition({ top: triggerRect.bottom + GAP, left });
      }
    }, [open, align, triggerRef]);

    useEffect(() => {
      if (!open) {
        setPosition(null);
        return;
      }
      const updatePosition = () => {
        if (!triggerRef.current || !contentRef.current) return;
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const contentRect = contentRef.current.getBoundingClientRect();
        const viewportH = window.innerHeight;
        const viewportW = window.innerWidth;
        let left = triggerRect.left;
        if (align === 'end') left = triggerRect.right - contentRect.width;
        else if (align === 'center') left = triggerRect.left + (triggerRect.width - contentRect.width) / 2;
        left = Math.max(8, Math.min(viewportW - contentRect.width - 8, left));
        const spaceBelow = viewportH - triggerRect.bottom - GAP;
        const openUp = spaceBelow < contentRect.height && triggerRect.top > contentRect.height + GAP;
        setPosition(openUp ? { bottom: viewportH - triggerRect.top + GAP, left } : { top: triggerRect.bottom + GAP, left });
      };
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }, [open, align, triggerRef]);

    if (!open) return null;

    const alignClass = align === 'start' ? styles.alignStart : align === 'center' ? styles.alignCenter : styles.alignEnd;
    const style: React.CSSProperties = position
      ? {
          position: 'fixed',
          ...('top' in position ? { top: position.top } : { bottom: position.bottom }),
          left: position.left,
          margin: 0,
        }
      : {
          position: 'fixed',
          left: -9999,
          top: 0,
          visibility: 'hidden',
          margin: 0,
        };

    const content = (
      <div
        ref={(el) => {
          contentRef.current = el;
          if (typeof ref === 'function') ref(el);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
        }}
        className={`${styles.content} ${styles.contentPortal} ${alignClass} ${className ?? ''}`.trim()}
        role="menu"
        style={style}
        {...props}
      >
        {children}
      </div>
    );

    return createPortal(content, document.body);
  }
);
DropdownMenuContent.displayName = 'DropdownMenuContent';

export const DropdownMenuItem = forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ className, onSelect, onClick, ...props }, ref) => {
    const { setOpen } = useDropdownMenu();
    return (
      <div
        ref={ref}
        role="menuitem"
        className={`${styles.item} ${className ?? ''}`.trim()}
        onClick={(e) => {
          onSelect?.();
          onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
          setOpen(false);
        }}
        {...props}
      />
    );
  }
);
DropdownMenuItem.displayName = 'DropdownMenuItem';
