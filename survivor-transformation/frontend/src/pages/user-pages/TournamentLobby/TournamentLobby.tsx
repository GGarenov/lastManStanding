import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Users } from "lucide-react";
import { useLabels } from "~/hooks/useLabels";
import { useLocalizedPath } from "~/i18n/routing";
import { buildTournamentLobbyLabels } from "~/locales/labels/tournamentLobby.labels";
import { getRegisteredUsers } from "~/api/users.api";
import tournamentLogo from "~/assets/images/tournament-logo.svg";
import heroImage from "~/assets/images/wc2026.jpg";
import styles from "./TournamentLobby.module.less";

export default function TournamentLobby() {
  const localizedPath = useLocalizedPath();
  const { t } = useLabels("tournamentLobby");
  const labels = useMemo(() => buildTournamentLobbyLabels(t), [t]);

  const {
    data: registeredUsers = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["registeredUsers"],
    queryFn: getRegisteredUsers,
    staleTime: 60_000,
  });

  return (
    <div className={styles.page}>
      <div className={styles.heroBackdrop} aria-hidden="true">
        <img src={heroImage} alt="" className={styles.heroBackdropImage} />
        <div className={styles.heroBackdropOverlay} />
      </div>

      <main className={styles.main}>
        <Link to={localizedPath("/")} className={styles.backLink}>
          <ArrowLeft className={styles.iconSm} aria-hidden />
          {labels.page.backHome}
        </Link>

        <section className={styles.heroCard}>
          <div className={styles.heroContent}>
            <img
              src={tournamentLogo}
              alt={labels.page.logoAlt}
              className={styles.logo}
            />
            <h1 className={styles.title}>{labels.page.title}</h1>
            <p className={styles.buyIn}>{labels.page.buyIn}</p>
          </div>

          <div className={styles.heroImageWrap} aria-hidden="true">
            <img
              src={heroImage}
              alt={labels.page.heroImageAlt}
              className={styles.heroImage}
            />
          </div>
        </section>

        <section className={styles.registeredSection}>
          <header className={styles.registeredHeader}>
            <div className={styles.registeredHeadingRow}>
              <Users className={styles.registeredIcon} aria-hidden />
              <h2 className={styles.registeredTitle}>
                {labels.page.registeredUsers}
              </h2>
            </div>
            <span className={styles.registeredCountBadge}>
              {labels.page.registeredCount(registeredUsers.length)}
            </span>
          </header>

          {isLoading ? (
            <div className={styles.stateMessage} role="status">
              <Loader2 className={styles.spinner} aria-hidden />
              {labels.page.loading}
            </div>
          ) : isError ? (
            <p className={styles.stateMessageError}>{labels.page.loadError}</p>
          ) : registeredUsers.length === 0 ? (
            <p className={styles.stateMessage}>{labels.page.emptyList}</p>
          ) : (
            <ul className={styles.userGrid}>
              {registeredUsers.map((user, index) => (
                <li
                  key={`${user.firstName}-${user.lastName}-${index}`}
                  className={styles.userCard}
                >
                  <span className={styles.userName}>
                    {user.firstName} {user.lastName}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
