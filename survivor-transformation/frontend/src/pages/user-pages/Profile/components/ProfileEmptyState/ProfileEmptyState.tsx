import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useLabels } from "~/hooks/useLabels";
import { useLocalizedPath } from "~/i18n/routing";
import { buildProfileLabels } from "~/locales/labels/profile.labels";
import { Card, CardContent } from "~/components/Card/Card";
import styles from "./ProfileEmptyState.module.less";

export function ProfileEmptyState() {
  const localizedPath = useLocalizedPath();
  const { t } = useLabels("profile");
  const labels = useMemo(() => buildProfileLabels(t), [t]);

  return (
    <Card className={styles.card}>
      <CardContent className={styles.emptyCard}>
        <p className={styles.emptyCardText}>{labels.empty.joinPool}</p>
        <Link to={localizedPath("/my-pool")} className={styles.myPoolBtn}>
          {labels.empty.myPool}
        </Link>
      </CardContent>
    </Card>
  );
}
