import type { TFunction } from "i18next";

export function buildRulesLabels(t: TFunction<"rules">) {
  return {
    page: {
      title: t("page.title"),
      subtitle: t("page.subtitle"),
    },
    whatIs: {
      title: t("whatIs.title"),
      body: t("whatIs.body"),
    },
    howToPlay: {
      title: t("howToPlay.title"),
      step1Title: t("howToPlay.step1Title"),
      step1Desc: t("howToPlay.step1Desc"),
      step2Title: t("howToPlay.step2Title"),
      step2Desc: t("howToPlay.step2Desc"),
      step3Title: t("howToPlay.step3Title"),
      step3Desc: t("howToPlay.step3Desc"),
      step4Title: t("howToPlay.step4Title"),
      step4Desc: t("howToPlay.step4Desc"),
    },
    keyRules: {
      title: t("keyRules.title"),
      onePickTitle: t("keyRules.onePickTitle"),
      onePickDesc: t("keyRules.onePickDesc"),
      noRepeatTitle: t("keyRules.noRepeatTitle"),
      noRepeatDesc: t("keyRules.noRepeatDesc"),
      drawsTitle: t("keyRules.drawsTitle"),
      drawsDesc: t("keyRules.drawsDesc"),
      deadlineTitle: t("keyRules.deadlineTitle"),
      deadlineDesc: t("keyRules.deadlineDesc"),
    },
    gettingStarted: {
      title: t("gettingStarted.title"),
      step1Title: t("gettingStarted.step1Title"),
      step1Desc: t("gettingStarted.step1Desc"),
      step2Title: t("gettingStarted.step2Title"),
      step2Desc: t("gettingStarted.step2Desc"),
      step3Title: t("gettingStarted.step3Title"),
      step3Desc: t("gettingStarted.step3Desc"),
      step4Title: t("gettingStarted.step4Title"),
      step4Desc: t("gettingStarted.step4Desc"),
    },
    faq: {
      title: t("faq.title"),
      items: [
        { q: t("faq.q1"), a: t("faq.a1") },
        { q: t("faq.q2"), a: t("faq.a2") },
        { q: t("faq.q3"), a: t("faq.a3") },
        { q: t("faq.q4"), a: t("faq.a4") },
        { q: t("faq.q5"), a: t("faq.a5") },
        { q: t("faq.q6"), a: t("faq.a6") },
        { q: t("faq.q7"), a: t("faq.a7") },
      ],
    },
    quickRef: {
      title: t("quickRef.title"),
      line1: t("quickRef.line1"),
      line2: t("quickRef.line2"),
      line3: t("quickRef.line3"),
    },
    cta: {
      backHome: t("cta.backHome"),
      myPool: t("cta.myPool"),
    },
  };
}

export type RulesLabels = ReturnType<typeof buildRulesLabels>;
