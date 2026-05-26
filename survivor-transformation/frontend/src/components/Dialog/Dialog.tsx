import React, { createContext, useContext, useEffect, useRef, forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Dialog.module.less';
import type {
  DialogProps,
  DialogTriggerProps,
  DialogContentProps,
  DialogHeaderProps,
  DialogFooterProps,
  DialogTitleProps,
  DialogDescriptionProps,
  DialogCloseProps,
} from './Dialog.interface';

type DialogContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dialogRef: React.RefObject<HTMLDialogElement | null>;
};

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('Dialog components must be used within Dialog');
  return ctx;
}

export function Dialog({ open = false, onOpenChange, children }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const value: DialogContextValue = { open, onOpenChange: onOpenChange ?? (() => {}), dialogRef };
  return (
    <DialogContext.Provider value={value}>
      {children}
    </DialogContext.Provider>
  );
}

export const DialogTrigger = forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ className, onClick, ...props }, ref) => {
    const { onOpenChange } = useDialog();
    return (
      <button
        ref={ref}
        type="button"
        className={className ?? ''}
        onClick={(e) => {
          onOpenChange(true);
          onClick?.(e);
        }}
        {...props}
      />
    );
  }
);
DialogTrigger.displayName = 'DialogTrigger';

export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, ...props }, ref) => {
    const { open, onOpenChange, dialogRef } = useDialog();

    useEffect(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;
      if (open) {
        dialog.showModal();
      } else {
        dialog.close();
      }
    }, [open, dialogRef]);

    const handleCancel = (e: React.SyntheticEvent<HTMLDialogElement>) => {
      e.preventDefault();
      onOpenChange(false);
    };

    return (
      <dialog
        ref={dialogRef}
        onCancel={handleCancel}
        className={`${styles.content} ${className ?? ''}`.trim()}
        aria-modal
      >
        <div ref={ref} {...props}>
          {children}
        </div>
      </dialog>
    );
  }
);
DialogContent.displayName = 'DialogContent';

export const DialogHeader = forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={`${styles.header} ${className ?? ''}`.trim()} {...props} />
  )
);
DialogHeader.displayName = 'DialogHeader';

export const DialogFooter = forwardRef<HTMLDivElement, DialogFooterProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={`${styles.footer} ${className ?? ''}`.trim()} {...props} />
  )
);
DialogFooter.displayName = 'DialogFooter';

export const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={`${styles.title} ${className ?? ''}`.trim()} {...props} />
  )
);
DialogTitle.displayName = 'DialogTitle';

export const DialogDescription = forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={`${styles.description} ${className ?? ''}`.trim()} {...props} />
  )
);
DialogDescription.displayName = 'DialogDescription';

export const DialogClose = forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ className, children, onClick, 'aria-label': ariaLabel, ...props }, ref) => {
    const { onOpenChange } = useDialog();
    const { t } = useTranslation('common');
    return (
      <button
        ref={ref}
        type="button"
        className={`${styles.close} ${className ?? ''}`.trim()}
        onClick={(e) => {
          onOpenChange(false);
          onClick?.(e);
        }}
        aria-label={ariaLabel ?? t('a11y.close')}
        {...props}
      >
        {children ?? '\u00D7'}
      </button>
    );
  }
);
DialogClose.displayName = 'DialogClose';
