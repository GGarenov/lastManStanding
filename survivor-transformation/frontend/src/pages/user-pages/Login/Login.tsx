import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/Card/Card';
import { Button } from '~/components/Button/Button';
import { Input } from '~/components/Input/Input';
import { Label } from '~/components/Label/Label';
import { useAuthStore, isAdminUser } from '~/store/authStore';
import style from './Login.module.less';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const user = useAuthStore((s) => s.user);
  const isChecked = useAuthStore((s) => s.isChecked);
  const hasRedirected = useRef(false);

  // Redirect if already logged in: admin -> /admin, else -> / (once per mount)
  useEffect(() => {
    if (hasRedirected.current) return;
    if (isChecked && user) {
      hasRedirected.current = true;
      navigate(isAdminUser(user) ? '/admin' : '/', { replace: true });
    }
  }, [isChecked, user, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Email and password are required');
      return;
    }
    setIsLoading(true);
    try {
      await login(email.trim(), password);
      const u = useAuthStore.getState().user;
      navigate(u && isAdminUser(u) ? '/admin' : '/', { replace: true });
    } catch {
      setError('Login failed. Check your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecked && user) {
    return (
      <div className={style.fullscreenCenter}>
        <p className={style.redirectText}>Redirecting...</p>
      </div>
    );
  }

  return (
    <div className={style.page}>
      <Card className={style.card}>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Sign in to play or manage survivor pools
          </CardDescription>
        </CardHeader>
          <CardContent>
          <form onSubmit={handleSubmit} className={style.form}>
            {error && <p className={style.errorText}>{error}</p>}
            <div className={style.field}>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                autoComplete="email"
                disabled={isLoading}
                className={style.input}
              />
            </div>
            <div className={style.field}>
              <Label htmlFor="password">Password</Label>
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
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
            <p className={style.registerText}>
              No account?{' '}
              <Link to="/register" className={style.registerLink}>
                Register
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
