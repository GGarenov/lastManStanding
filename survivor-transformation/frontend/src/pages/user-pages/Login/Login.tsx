import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/Card/Card';
import { Button } from '~/components/Button/Button';
import { Input } from '~/components/Input/Input';
import { Label } from '~/components/Label/Label';
import { useLabels } from '~/hooks/useLabels';
import { buildLocalizedPath, useAppLocale, useLocalizedPath } from '~/i18n/routing';
import { buildAuthLabels } from '~/locales/labels/auth.labels';
import { useAuthStore, isAdminUser } from '~/store/authStore';
import style from './Login.module.less';

export default function Login() {
  const navigate = useNavigate();
  const appLocale = useAppLocale();
  const localizedPath = useLocalizedPath();
  const { t } = useLabels('auth');
  const labels = useMemo(() => buildAuthLabels(t), [t]);
  const login = useAuthStore((s) => s.login);
  const user = useAuthStore((s) => s.user);
  const isChecked = useAuthStore((s) => s.isChecked);
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (hasRedirected.current) return;
    if (isChecked && user) {
      hasRedirected.current = true;
      navigate(isAdminUser(user) ? '/admin' : buildLocalizedPath(appLocale, '/'), {
        replace: true,
      });
    }
  }, [isChecked, user, navigate, appLocale]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError(labels.login.errors.required);
      return;
    }
    setIsLoading(true);
    try {
      await login(email.trim(), password);
      const u = useAuthStore.getState().user;
      navigate(u && isAdminUser(u) ? '/admin' : buildLocalizedPath(appLocale, '/'), {
        replace: true,
      });
    } catch {
      setError(labels.login.errors.failed);
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecked && user) {
    return (
      <div className={style.fullscreenCenter}>
        <p className={style.redirectText}>{labels.login.redirecting}</p>
      </div>
    );
  }

  return (
    <div className={style.page}>
      <Card className={style.card}>
        <CardHeader>
          <CardTitle>{labels.login.title}</CardTitle>
          <CardDescription>{labels.login.description}</CardDescription>
        </CardHeader>
          <CardContent>
          <form onSubmit={handleSubmit} className={style.form}>
            {error && <p className={style.errorText}>{error}</p>}
            <div className={style.field}>
              <Label htmlFor="email">{labels.login.emailLabel}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={labels.login.emailPlaceholder}
                autoComplete="email"
                disabled={isLoading}
                className={style.input}
              />
            </div>
            <div className={style.field}>
              <Label htmlFor="password">{labels.login.passwordLabel}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={isLoading}
                className={style.input}
              />
            </div>
            <Button type="submit" className={style.submitButton} disabled={isLoading}>
              {isLoading ? labels.login.submitting : labels.login.submit}
            </Button>
            <p className={style.registerText}>
              {labels.login.noAccount}{' '}
              <Link to={localizedPath('/register')} className={style.registerLink}>
                {labels.login.registerLink}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
