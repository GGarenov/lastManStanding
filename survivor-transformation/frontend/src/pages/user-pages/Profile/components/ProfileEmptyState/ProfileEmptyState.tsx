import { Link } from 'react-router-dom';
import { Card, CardContent } from '~/components/Card/Card';
import styles from './ProfileEmptyState.module.less';

export function ProfileEmptyState() {
  return (
    <Card className={styles.card}>
      <CardContent className={styles.emptyCard}>
        <p className={styles.emptyCardText}>Join a pool to see your stats and pick history.</p>
        <Link to="/my-pool" className={styles.myPoolBtn}>
          My Pool
        </Link>
      </CardContent>
    </Card>
  );
}
