import { Link } from 'react-router-dom';
import { useLocalizedPath } from '~/i18n/routing';
import { Card, CardContent } from '~/components/Card/Card';
import styles from './ProfileEmptyState.module.less';

export function ProfileEmptyState() {
  const localizedPath = useLocalizedPath();

  return (
    <Card className={styles.card}>
      <CardContent className={styles.emptyCard}>
        <p className={styles.emptyCardText}>Join a pool to see your stats and pick history.</p>
        <Link to={localizedPath("/my-pool")} className={styles.myPoolBtn}>
          My Pool
        </Link>
      </CardContent>
    </Card>
  );
}
