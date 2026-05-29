import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/Card/Card';
import { Button } from '~/components/Button/Button';
import { Input } from '~/components/Input/Input';
import { Label } from '~/components/Label/Label';
import type { AppLocale } from '~/i18n/constants';
import { buildLocalizedPath, useAppLocale, useLocalizedPath } from '~/i18n/routing';
import { useLabels } from '~/hooks/useLabels';
import { buildAuthLabels } from '~/locales/labels/auth.labels';
import { useAuthStore, isAdminUser } from '~/store/authStore';
import style from './Register.module.less';

function getRedirectPath(
  user: { role?: string } | null,
  locale: AppLocale,
): string {
  return isAdminUser(user) ? '/admin' : buildLocalizedPath(locale, '/');
}

export default function Register() {
  const navigate = useNavigate();
  const appLocale = useAppLocale();
  const localizedPath = useLocalizedPath();
  const { t } = useLabels('auth');
  const labels = useMemo(() => buildAuthLabels(t), [t]);
  const register = useAuthStore((s) => s.register);
  const user = useAuthStore((s) => s.user);
  const isChecked = useAuthStore((s) => s.isChecked);
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (hasRedirected.current) return;
    if (isChecked && user) {
      hasRedirected.current = true;
      navigate(getRedirectPath(user, appLocale), { replace: true });
    }
  }, [isChecked, user, navigate, appLocale]);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim()) {
      setError(labels.register.errors.firstNameRequired);
      return;
    }
    if (!lastName.trim()) {
      setError(labels.register.errors.lastNameRequired);
      return;
    }

    const usernameError = labels.register.validateUsername(username);
    if (usernameError) {
      setError(usernameError);
      return;
    }

    if (!email.trim() || !password) {
      setError(labels.register.errors.required);
      return;
    }
    if (password !== confirmPassword) {
      setError(labels.register.errors.passwordMismatch);
      return;
    }
    if (password.length < 6) {
      setError(labels.register.errors.passwordMin);
      return;
    }
    setIsLoading(true);
    try {
      await register(
        email.trim(),
        firstName.trim(),
        lastName.trim(),
        username.trim(),
        password,
      );
      const u = useAuthStore.getState().user;
      navigate(getRedirectPath(u, appLocale), { replace: true });
    } catch (err: unknown) {
      const apiMessage =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data &&
        typeof err.response.data === 'object' &&
        'message' in err.response.data &&
        typeof err.response.data.message === 'string'
          ? err.response.data.message
          : err instanceof Error
            ? err.message
            : null;
      setError(apiMessage ?? labels.register.errors.failed);
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecked && user) {
    return (
      <div className={style.fullscreenCenter}>
        <p className={style.redirectText}>{labels.register.redirecting}</p>
      </div>
    );
  }

  return (
    <div className={style.page}>
      <div className={style.content}>
        <h1 className={style.pageHeading}>{labels.register.heading}</h1>
        <Card className={style.card}>
          <CardHeader>
            <CardTitle>{labels.register.title}</CardTitle>
            <CardDescription>{labels.register.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className={style.form}>
              {error && <p className={style.errorText}>{error}</p>}
              <div className={style.nameRow}>
                <div className={style.field}>
                  <Label htmlFor="firstName">{labels.register.firstNameLabel}</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={labels.register.firstNamePlaceholder}
                    autoComplete="given-name"
                    disabled={isLoading}
                    maxLength={50}
                    className={style.input}
                  />
                </div>
                <div className={style.field}>
                  <Label htmlFor="lastName">{labels.register.lastNameLabel}</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={labels.register.lastNamePlaceholder}
                    autoComplete="family-name"
                    disabled={isLoading}
                    maxLength={50}
                    className={style.input}
                  />
                </div>
              </div>
              <div className={style.field}>
                <Label htmlFor="email">{labels.register.emailLabel}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={labels.register.emailPlaceholder}
                  autoComplete="email"
                  disabled={isLoading}
                  className={style.input}
                />
              </div>
              <div className={style.field}>
                <Label htmlFor="username">{labels.register.usernameLabel}</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={labels.register.usernamePlaceholder}
                  autoComplete="username"
                  disabled={isLoading}
                  minLength={3}
                  maxLength={30}
                  pattern="[a-zA-Z0-9_-]+"
                  className={style.input}
                />
                <p className={style.hintText}>{labels.register.usernameHint}</p>
              </div>
              <div className={style.field}>
                <Label htmlFor="password">{labels.register.passwordLabel}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={isLoading}
                  className={style.input}
                />
              </div>
              <div className={style.field}>
                <Label htmlFor="confirmPassword">
                  {labels.register.confirmPasswordLabel}
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={isLoading}
                  className={style.input}
                />
              </div>
              <Button type="submit" className={style.submitButton} disabled={isLoading}>
                {isLoading ? labels.register.submitting : labels.register.submit}
              </Button>
              <p className={style.footerText}>
                {labels.register.hasAccount}{' '}
                <Link to={localizedPath('/login')} className={style.loginLink}>
                  {labels.register.loginLink}
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
