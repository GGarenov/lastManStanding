import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import styles from './ProfileFooter.module.less';

export interface ProfileFooterProps {
  isAdmin: boolean;
  onLogout: () => void;
}

export function ProfileFooter({ isAdmin, onLogout }: ProfileFooterProps) {
  return (
    <div className={styles.footer}>
      {isAdmin && (
        <Link to="/admin" className={styles.footerBtn}>
          Admin panel
        </Link>
      )}
      <button type="button" onClick={onLogout} className={styles.footerBtn}>
        <LogOut className={styles.footerIcon} />
        Log out
      </button>
    </div>
  );
}
