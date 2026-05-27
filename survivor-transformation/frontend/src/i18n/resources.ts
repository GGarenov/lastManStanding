import type { AppLocale } from '~/i18n/constants';

import enAuth from '~/locales/en/auth.json';
import enCommon from '~/locales/en/common.json';
import enHome from '~/locales/en/home.json';
import enLeaderboard from '~/locales/en/leaderboard.json';
import enNavbar from '~/locales/en/navbar.json';
import enPool from '~/locales/en/pool.json';
import enProfile from '~/locales/en/profile.json';
import enRules from '~/locales/en/rules.json';

import bgAuth from '~/locales/bg/auth.json';
import bgCommon from '~/locales/bg/common.json';
import bgHome from '~/locales/bg/home.json';
import bgLeaderboard from '~/locales/bg/leaderboard.json';
import bgNavbar from '~/locales/bg/navbar.json';
import bgPool from '~/locales/bg/pool.json';
import bgProfile from '~/locales/bg/profile.json';
import bgRules from '~/locales/bg/rules.json';

export const resources = {
  en: {
    common: enCommon,
    navbar: enNavbar,
    home: enHome,
    rules: enRules,
    pool: enPool,
    leaderboard: enLeaderboard,
    profile: enProfile,
    auth: enAuth,
  },
  bg: {
    common: bgCommon,
    navbar: bgNavbar,
    home: bgHome,
    rules: bgRules,
    pool: bgPool,
    leaderboard: bgLeaderboard,
    profile: bgProfile,
    auth: bgAuth,
  },
} satisfies Record<AppLocale, Record<string, Record<string, unknown>>>;
