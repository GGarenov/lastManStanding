import type { ComponentProps } from 'react';
import type { Toaster } from 'sonner';

export interface SonnerToasterProps extends Omit<ComponentProps<typeof Toaster>, 'toastOptions'> {}
