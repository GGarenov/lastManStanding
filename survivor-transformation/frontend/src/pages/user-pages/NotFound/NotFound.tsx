import { Link, useLocation } from "react-router-dom";
import { useLocalizedPath } from "~/i18n/routing";
import { useEffect } from "react";
import styles from "./NotFound.module.less";

const NotFound = () => {
  const location = useLocation();
  const localizedPath = useLocalizedPath();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <h1 className={styles.title}>404</h1>
        <p className={styles.message}>Oops! Page not found</p>
        <Link to={localizedPath("/")} className={styles.link}>
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
