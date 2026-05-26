import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useLabels } from "~/hooks/useLabels";
import { useLocalizedPath } from "~/i18n/routing";
import { buildProfileLabels } from "~/locales/labels/profile.labels";
import { Card, CardContent } from "~/components/Card/Card";
import styles from "./ProfileNotLoggedIn.module.less";

export function ProfileNotLoggedIn() {
  const localizedPath = useLocalizedPath();
  const { t } = useLabels("profile");
  const labels = useMemo(() => buildProfileLabels(t), [t]);

  return (
    <Card className={`${styles.card} ${styles.cardMaxW}`}>
      <CardContent className={`${styles.cardContentCentered} ${styles.cardContentCenteredText}`}>
        <p>{labels.guest.message}</p>
        <Link to={localizedPath("/login")} className={styles.btnPrimary}>
          {labels.guest.login}
        </Link>
        <Link to={localizedPath("/register")} className={styles.btnOutline}>
          {labels.guest.register}
        </Link>
      </CardContent>
    </Card>
  );
}
