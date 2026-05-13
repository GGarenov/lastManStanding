import React, { createContext, useContext, useEffect, useRef, forwardRef } from 'react';
import styles from './AlertDialog.module.less';
import type {
  AlertDialogProps,
  AlertDialogTriggerProps,
  AlertDialogContentProps,
  AlertDialogHeaderProps,
  AlertDialogFooterProps,
  AlertDialogTitleProps,
  AlertDialogDescriptionProps,
  AlertDialogActionProps,
  AlertDialogCancelProps,
} from './AlertDialog.interface';

type AlertDialogContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dialogRef: React.RefObject<HTMLDialogElement | null>;
};

const AlertDialogContext = createContext<AlertDialogContextValue | null>(null);

function useAlertDialog() {
  const ctx = useContext(AlertDialogContext);
  if (!ctx) throw new Error('AlertDialog components must be used within AlertDialog');
  return ctx;
}

export function AlertDialog({ open = false, onOpenChange, children }: AlertDialogProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const value: AlertDialogContextValue = { open, onOpenChange: onOpenChange ?? (() => {}), dialogRef };
  return (
    <AlertDialogContext.Provider value={value}>
      {children}
    </AlertDialogContext.Provider>
  );
}

export const AlertDialogTrigger = forwardRef<HTMLButtonElement, AlertDialogTriggerProps>(
  ({ className, onClick, ...props }, ref) => {
    const { onOpenChange } = useAlertDialog();
    return (
      <button
        ref={ref}
        type="button"
        className={`${className ?? ''}`.trim()}
        onClick={(e) => {
          onOpenChange(true);
          onClick?.(e);
        }}
        {...props}
      />
    );
  }
);
AlertDialogTrigger.displayName = 'AlertDialogTrigger';

export const AlertDialogContent = forwardRef<HTMLDivElement, AlertDialogContentProps>(
  ({ className, children, ...props }, ref) => {
    const { open, onOpenChange, dialogRef } = useAlertDialog();

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
        <div ref={ref}>
          {children}
        </div>
      </dialog>
    );
  }
);
AlertDialogContent.displayName = 'AlertDialogContent';

export const AlertDialogHeader = forwardRef<HTMLDivElement, AlertDialogHeaderProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={`${styles.header} ${className ?? ''}`.trim()} {...props} />
  )
);
AlertDialogHeader.displayName = 'AlertDialogHeader';

export const AlertDialogFooter = forwardRef<HTMLDivElement, AlertDialogFooterProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={`${styles.footer} ${className ?? ''}`.trim()} {...props} />
  )
);
AlertDialogFooter.displayName = 'AlertDialogFooter';

export const AlertDialogTitle = forwardRef<HTMLHeadingElement, AlertDialogTitleProps>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={`${styles.title} ${className ?? ''}`.trim()} {...props} />
  )
);
AlertDialogTitle.displayName = 'AlertDialogTitle';

export const AlertDialogDescription = forwardRef<HTMLParagraphElement, AlertDialogDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={`${styles.description} ${className ?? ''}`.trim()} {...props} />
  )
);
AlertDialogDescription.displayName = 'AlertDialogDescription';

export const AlertDialogAction = forwardRef<HTMLButtonElement, AlertDialogActionProps>(
  ({ className, onClick, ...props }, ref) => {
    const { onOpenChange } = useAlertDialog();
    return (
      <button
        ref={ref}
        type="button"
        className={`${styles.action} ${className ?? ''}`.trim()}
        onClick={(e) => {
          onOpenChange(false);
          onClick?.(e);
        }}
        {...props}
      />
    );
  }
);
AlertDialogAction.displayName = 'AlertDialogAction';

export const AlertDialogCancel = forwardRef<HTMLButtonElement, AlertDialogCancelProps>(
  ({ className, onClick, ...props }, ref) => {
    const { onOpenChange } = useAlertDialog();
    return (
      <button
        ref={ref}
        type="button"
        className={`${styles.cancel} ${className ?? ''}`.trim()}
        onClick={(e) => {
          onOpenChange(false);
          onClick?.(e);
        }}
        {...props}
      />
    );
  }
);
AlertDialogCancel.displayName = 'AlertDialogCancel';
