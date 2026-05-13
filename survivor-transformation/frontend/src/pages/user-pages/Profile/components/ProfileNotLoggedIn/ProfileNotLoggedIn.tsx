import { Link } from 'react-router-dom';
import { Card, CardContent } from '~/components/Card/Card';
import styles from './ProfileNotLoggedIn.module.less';

export function ProfileNotLoggedIn() {
  return (
    <Card className={`${styles.card} ${styles.cardMaxW}`}>
      <CardContent className={`${styles.cardContentCentered} ${styles.cardContentCenteredText}`}>
        <p>Log in to view and manage your profile.</p>
        <Link to="/login" className={styles.btnPrimary}>
          Log in
        </Link>
        <Link to="/register" className={styles.btnOutline}>
          Register
        </Link>
      </CardContent>
    </Card>
  );
}
