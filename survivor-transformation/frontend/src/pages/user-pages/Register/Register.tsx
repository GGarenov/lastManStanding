import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/Card/Card';
import { Button } from '~/components/Button/Button';
import { Input } from '~/components/Input/Input';
import { Label } from '~/components/Label/Label';
import { useAuthStore, isAdminUser } from '~/store/authStore';
import style from './Register.module.less';

function getRedirectPath(user: { role?: string } | null): string {
  return isAdminUser(user) ? '/admin' : '/';
}

export default function Register() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const user = useAuthStore((s) => s.user);
  const isChecked = useAuthStore((s) => s.isChecked);
  const hasRedirected = useRef(false);

  // Redirect if already logged in (once per mount)
  useEffect(() => {
    if (hasRedirected.current) return;
    if (isChecked && user) {
      hasRedirected.current = true;
      navigate(getRedirectPath(user), { replace: true });
    }
  }, [isChecked, user, navigate]);

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateUsername = (value: string): string | null => {
    if (!value.trim()) {
      return 'Username is required';
    }
    if (value.length < 3) {
      return 'Username must be at least 3 characters';
    }
    if (value.length > 30) {
      return 'Username must be at most 30 characters';
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      return 'Username can only contain letters, numbers, underscores, and hyphens';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate username
    const usernameError = validateUsername(username);
    if (usernameError) {
      setError(usernameError);
      return;
    }
    
    if (!email.trim() || !password) {
      setError('Email and password are required');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setIsLoading(true);
    try {
      await register(email.trim(), username.trim(), password);
      const u = useAuthStore.getState().user;
      navigate(getRedirectPath(u), { replace: true });
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Registration failed. Email or username may already be in use.';
      setError(errorMessage);
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
          <CardTitle>Create account</CardTitle>
          <CardDescription>
            Register to play survivor pools
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
                placeholder="you@example.com"
                autoComplete="email"
                disabled={isLoading}
                className={style.input}
              />
            </div>
            <div className={style.field}>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                autoComplete="username"
                disabled={isLoading}
                minLength={3}
                maxLength={30}
                pattern="[a-zA-Z0-9_-]+"
                className={style.input}
              />
              <p className={style.hintText}>
                3-30 characters, letters, numbers, underscores, and hyphens only
              </p>
            </div>
            <div className={style.field}>
              <Label htmlFor="password">Password</Label>
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
              <Label htmlFor="confirmPassword">Confirm password</Label>
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
              {isLoading ? 'Creating account...' : 'Register'}
            </Button>
            <p className={style.footerText}>
              Already have an account?{' '}
              <Link to="/login" className={style.loginLink}>
                Log in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
