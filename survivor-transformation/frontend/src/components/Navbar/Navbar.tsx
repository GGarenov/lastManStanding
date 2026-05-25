import { useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, User } from "lucide-react";
import { useAuthStore } from "~/store/authStore";
import { useActiveTournament } from "~/contexts/ActiveTournamentContext";
import { cn } from "~/lib/utils";
import { getUserDisplayName } from "~/lib/user-utils";
import { useIsMobile } from "~/hooks/use-mobile";
import { stripLocalePrefix, useLocalizedPath } from "~/i18n/routing";
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

const GENERIC_NAV_ITEMS: { to: string; label: string }[] = [
  { to: "/", label: "Home" },
  { to: "/rules", label: "Rules" },
];

function getNavItems(activeTournament: { label: string } | null): { to: string; label: string }[] {
  if (!activeTournament) return GENERIC_NAV_ITEMS;
  return [
    { to: "/", label: "Home" },
    { to: "/my-pool", label: activeTournament.label },
    { to: "/stats", label: "Stats" },
    { to: "/leaderboard", label: "Leaderboard" },
    { to: "/rules", label: "Rules" },
  ];
}

export function Navbar() {
  const location = useLocation();
  const localizedPath = useLocalizedPath();
  const pathWithoutLocale = stripLocalePrefix(location.pathname);
  const user = useAuthStore((s) => s.user);
  const { activeTournament } = useActiveTournament();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = useMemo(() => getNavItems(activeTournament), [activeTournament]);
  const logoLabel = activeTournament ? `${activeTournament.label} Survivor` : "Survivor";

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link to={localizedPath("/")} className={styles.logo}>
          <img src={logoWhite} alt={logoLabel} className={styles.logoImage} />
        </Link>

        {/* Desktop nav links */}
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

        {/* Mobile: hamburger + profile. Desktop: profile only in header */}
        <div className={styles.actions}>
          <LanguageSwitcher className={styles.languageSwitcher} />
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className={styles.mobileMenuButton}
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
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
            <span className={styles.profileText}>{getUserDisplayName(user)}</span>
          </Link>
        </div>
      </div>

      {/* Mobile nav drawer */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          side="right"
          className={styles.sheetContent}
          aria-label="Navigation"
        >
          <SheetHeader>
            <SheetTitle className={styles.sheetTitleLeft}>Menu</SheetTitle>
          </SheetHeader>
          <nav className={styles.mobileNav} aria-label="Main navigation">
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
              {user ? "Profile" : "Log in"}
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
