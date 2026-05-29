import type { TFunction } from "i18next";

export function buildAuthLabels(t: TFunction<"auth">) {
  const registerErrors = {
    firstNameRequired: t("register.errors.firstNameRequired"),
    lastNameRequired: t("register.errors.lastNameRequired"),
    usernameRequired: t("register.errors.usernameRequired"),
    usernameMin: t("register.errors.usernameMin"),
    usernameMax: t("register.errors.usernameMax"),
    usernamePattern: t("register.errors.usernamePattern"),
    required: t("register.errors.required"),
    passwordMismatch: t("register.errors.passwordMismatch"),
    passwordMin: t("register.errors.passwordMin"),
    failed: t("register.errors.failed"),
  };

  return {
    login: {
      title: t("login.title"),
      description: t("login.description"),
      emailLabel: t("login.emailLabel"),
      emailPlaceholder: t("login.emailPlaceholder"),
      passwordLabel: t("login.passwordLabel"),
      submit: t("login.submit"),
      submitting: t("login.submitting"),
      noAccount: t("login.noAccount"),
      registerLink: t("login.registerLink"),
      redirecting: t("login.redirecting"),
      errors: {
        required: t("login.errors.required"),
        failed: t("login.errors.failed"),
      },
    },
    register: {
      heading: t("register.heading"),
      title: t("register.title"),
      description: t("register.description"),
      firstNameLabel: t("register.firstNameLabel"),
      firstNamePlaceholder: t("register.firstNamePlaceholder"),
      lastNameLabel: t("register.lastNameLabel"),
      lastNamePlaceholder: t("register.lastNamePlaceholder"),
      emailLabel: t("register.emailLabel"),
      emailPlaceholder: t("register.emailPlaceholder"),
      usernameLabel: t("register.usernameLabel"),
      usernamePlaceholder: t("register.usernamePlaceholder"),
      usernameHint: t("register.usernameHint"),
      passwordLabel: t("register.passwordLabel"),
      confirmPasswordLabel: t("register.confirmPasswordLabel"),
      submit: t("register.submit"),
      submitting: t("register.submitting"),
      hasAccount: t("register.hasAccount"),
      loginLink: t("register.loginLink"),
      redirecting: t("register.redirecting"),
      errors: registerErrors,
      validateUsername: (value: string): string | null => {
        if (!value.trim()) return registerErrors.usernameRequired;
        if (value.length < 3) return registerErrors.usernameMin;
        if (value.length > 30) return registerErrors.usernameMax;
        if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
          return registerErrors.usernamePattern;
        }
        return null;
      },
    },
  };
}

export type AuthLabels = ReturnType<typeof buildAuthLabels>;
