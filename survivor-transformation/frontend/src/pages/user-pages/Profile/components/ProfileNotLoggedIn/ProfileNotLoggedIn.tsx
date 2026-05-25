import { Link } from 'react-router-dom';
import { useLocalizedPath } from '~/i18n/routing';
import { Card, CardContent } from '~/components/Card/Card';
import styles from './ProfileNotLoggedIn.module.less';

export function ProfileNotLoggedIn() {
  const localizedPath = useLocalizedPath();

  return (
    <Card className={`${styles.card} ${styles.cardMaxW}`}>
      <CardContent className={`${styles.cardContentCentered} ${styles.cardContentCenteredText}`}>
        <p>Log in to view and manage your profile.</p>
        <Link to={localizedPath("/login")} className={styles.btnPrimary}>
          Log in
        </Link>
        <Link to={localizedPath("/register")} className={styles.btnOutline}>
          Register
        </Link>
      </CardContent>
    </Card>
  );
}
