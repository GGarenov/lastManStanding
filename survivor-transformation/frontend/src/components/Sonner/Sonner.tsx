import { Toaster as SonnerToaster, toast } from 'sonner';
import styles from './Sonner.module.less';

/**
 * Survivor app toast container. Styled with design tokens via Sonner.module.less.
 * Use `toast` from 'sonner' (or from this file) for showing toasts.
 */
export function Sonner() {
  return (
    <SonnerToaster
      theme="dark"
      toastOptions={{
        classNames: {
          toast: styles.toast,
          title: styles.title,
          description: styles.description,
          actionButton: styles.actionButton,
          cancelButton: styles.cancelButton,
          closeButton: styles.closeButton,
        },
      }}
    />
  );
}

export { toast };
