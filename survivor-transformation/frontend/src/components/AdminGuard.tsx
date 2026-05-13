import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, isAdminUser } from '~/store/authStore';
import { AuthGuard } from './AuthGuard';

interface AdminGuardProps {
  children: ReactNode;
}

/**
 * Protects admin routes: requires authentication (AuthGuard) and role === 'admin'.
 * Non-admin users are redirected to /.
 */
export function AdminGuard({ children }: AdminGuardProps) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isChecked = useAuthStore((s) => s.isChecked);

  useEffect(() => {
    if (!isChecked) return;
    if (user && !isAdminUser(user)) {
      navigate('/', { replace: true });
    }
  }, [user, isChecked, navigate]);

  if (isChecked && user && !isAdminUser(user)) {
    return null;
  }

  return <AuthGuard>{children}</AuthGuard>;
}
