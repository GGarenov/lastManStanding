import { useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLabels } from "~/hooks/useLabels";
import { useLocalizedPath } from "~/i18n/routing";
import { buildCommonLabels } from "~/locales/labels/common.labels";
import styles from "./NotFound.module.less";

const NotFound = () => {
  const location = useLocation();
  const localizedPath = useLocalizedPath();
  const { t } = useLabels("common");
  const labels = useMemo(() => buildCommonLabels(t), [t]);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <h1 className={styles.title}>{labels.notFound.code}</h1>
        <p className={styles.message}>{labels.notFound.message}</p>
        <Link to={localizedPath("/")} className={styles.link}>
          {labels.notFound.backHome}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
