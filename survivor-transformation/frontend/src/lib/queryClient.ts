import { QueryClient } from '@tanstack/react-query';

/** Shared React Query client — cleared on logout so user-specific data is not reused. */
export const queryClient = new QueryClient();
