/** @type {import('i18next-parser').UserConfig} */
module.exports = {
  input: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.test.{ts,tsx}",
    "!src/test/**",
    "!src/i18n/**",
    "!src/api/**",
    "!src/store/**",
    "!src/data/**",
    "!src/types/**",
    "!src/lib/**",
    "!src/locales/labels/**",
    "!src/locales/helpers/**",
    "!src/locales/localeStructure.ts",
    "!src/pages/admin-pages/**",
  ],
  output: "src/locales/$LOCALE/$NAMESPACE.json",
  locales: ["en"],
  defaultNamespace: "common",
  namespaceSeparator: ":",
  keySeparator: ".",
  pluralSeparator: "_",
  sort: true,
  keepRemoved: true,
  skipDefaultValues: true,
  createOldCatalogs: false,
  indentation: 2,
  verbose: true,
  lexers: {
    ts: [
      {
        lexer: "JavascriptLexer",
        functions: ["t", "i18n.t", "i18next.t"],
        namespaceFunctions: ["useTranslation", "useLabels"],
      },
    ],
    tsx: [
      {
        lexer: "JsxLexer",
        functions: ["t", "i18n.t", "i18next.t"],
        namespaceFunctions: ["useTranslation", "useLabels"],
        componentFunctions: ["Trans"],
      },
    ],
    default: [
      {
        lexer: "JavascriptLexer",
        functions: ["t", "i18n.t", "i18next.t"],
        namespaceFunctions: ["useTranslation", "useLabels"],
      },
    ],
  },
};
