import { useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, User } from "lucide-react";
import { useAuthStore } from "~/store/authStore";
import { useActiveTournament } from "~/contexts/ActiveTournamentContext";
import { cn } from "~/lib/utils";
import { getUserDisplayName } from "~/lib/user-utils";
import { useIsMobile } from "~/hooks/use-mobile";
import { useLabels } from "~/hooks/useLabels";
import { stripLocalePrefix, useLocalizedPath } from "~/i18n/routing";
import {
  buildNavbarLabels,
  GENERIC_NAV_CONFIG,
  getTournamentNavConfig,
  resolveNavItemLabel,
} from "~/locales/labels/navbar.labels";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "~/components/Sheet/Sheet";
import { Button } from "~/components/Button/Button";
import { LanguageSwitcher } from "~/components/LanguageSwitcher/LanguageSwitcher";
import logoWhite from "~/assets/logo/logo-white.svg";
import styles from "./Navbar.module.less";

export function Navbar() {
  const location = useLocation();
  const localizedPath = useLocalizedPath();
  const pathWithoutLocale = stripLocalePrefix(location.pathname);
  const user = useAuthStore((s) => s.user);
  const { activeTournament } = useActiveTournament();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useLabels("navbar");
  const { t: tCommon } = useLabels("common");

  const labels = useMemo(() => buildNavbarLabels(t), [t]);
  const guestDisplayName = useMemo(
    () => tCommon("guest.displayName"),
    [tCommon],
  );

  const navConfig = useMemo(
    () => (activeTournament ? getTournamentNavConfig() : GENERIC_NAV_CONFIG),
    [activeTournament],
  );

  const tournamentLabel = activeTournament?.label ?? null;

  const navItems = useMemo(
    () =>
      navConfig.map((item) => ({
        to: item.to,
        label: resolveNavItemLabel(item, t, tournamentLabel),
      })),
    [navConfig, t, tournamentLabel],
  );

  const logoAlt = labels.logoAlt(tournamentLabel);
  const profileLinkLabel = user ? labels.profile.label : labels.profile.login;

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to={localizedPath("/")} className={styles.logo}>
          <img src={logoWhite} alt={logoAlt} className={styles.logoImage} />
        </Link>

        <nav className={styles.nav}>
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={localizedPath(to)}
              className={({ isActive: active }) =>
                cn(styles.navLink, active && styles.active)
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.actions}>
          <LanguageSwitcher className={styles.languageSwitcher} />
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className={styles.mobileMenuButton}
              onClick={() => setMenuOpen(true)}
              aria-label={labels.menu.openAria}
            >
              <Menu className={styles.menuIcon} />
            </Button>
          )}
          <Link
            to={localizedPath(user ? "/profile" : "/login")}
            className={styles.profileLink}
          >
            <div className={styles.profileIconWrap}>
              <User className={styles.profileIconSvg} />
            </div>
            <span className={styles.profileText}>
              {user ? getUserDisplayName(user) : guestDisplayName}
            </span>
          </Link>
        </div>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          side="right"
          className={styles.sheetContent}
          aria-label={labels.menu.sheetAria}
        >
          <SheetHeader>
            <SheetTitle className={styles.sheetTitleLeft}>
              {labels.menu.title}
            </SheetTitle>
          </SheetHeader>
          <nav className={styles.mobileNav} aria-label={labels.menu.navAria}>
            <div className={styles.mobileLangRow}>
              <LanguageSwitcher />
            </div>
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={localizedPath(to)}
                className={({ isActive: active }) =>
                  cn(styles.mobileNavLink, active && styles.active)
                }
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </NavLink>
            ))}
            <Link
              to={localizedPath(user ? "/profile" : "/login")}
              className={cn(
                styles.mobileNavLink,
                (pathWithoutLocale === "/profile" || pathWithoutLocale === "/login") &&
                  styles.active,
              )}
              onClick={() => setMenuOpen(false)}
            >
              {profileLinkLabel}
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
