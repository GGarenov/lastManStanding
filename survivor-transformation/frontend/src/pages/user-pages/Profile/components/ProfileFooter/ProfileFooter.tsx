import { useMemo } from "react";
import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useLabels } from "~/hooks/useLabels";
import { buildProfileLabels } from "~/locales/labels/profile.labels";
import styles from "./ProfileFooter.module.less";

export interface ProfileFooterProps {
  isAdmin: boolean;
  onLogout: () => void;
}

export function ProfileFooter({ isAdmin, onLogout }: ProfileFooterProps) {
  const { t } = useLabels("profile");
  const labels = useMemo(() => buildProfileLabels(t), [t]);

  return (
    <div className={styles.footer}>
      {isAdmin && (
        <Link to="/admin" className={styles.footerBtn}>
          {labels.footer.adminPanel}
        </Link>
      )}
      <button type="button" onClick={onLogout} className={styles.footerBtn}>
        <LogOut className={styles.footerIcon} />
        {labels.footer.logout}
      </button>
    </div>
  );
}
