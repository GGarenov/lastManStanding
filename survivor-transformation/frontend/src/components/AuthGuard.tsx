import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLocalizedPath } from '~/i18n/routing';
import { useAuthStore } from '~/store/authStore';
import styles from './AuthGuard/AuthGuard.module.less';

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * Protects routes that require authentication. Redirects to /login when not logged in.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const localizedPath = useLocalizedPath();
  const user = useAuthStore((s) => s.user);
  const isChecked = useAuthStore((s) => s.isChecked);

  useEffect(() => {
    if (!isChecked) return;
    if (!user) {
      navigate(localizedPath('/login'), {
        state: { from: location.pathname },
        replace: true,
      });
    }
  }, [user, isChecked, navigate, location.pathname, localizedPath]);

  if (!isChecked) {
    return (
      <div className={styles.wrapper}>
        <p className={styles.text}>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
