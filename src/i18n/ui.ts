import en from "../../messages/en.json";
import ja from "../../messages/ja.json";

export const locales = ["en", "ja"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export interface ProfileItem {
  title: string;
  description: string;
}

export interface ExperienceItem {
  school: string;
  /** timelineIcons のキー。未知の値は building-office にフォールバックする */
  icon: string;
  period: string;
  major: string;
  description: string[];
}

export interface Messages {
  home: {
    title: string;
    blog: string;
    contact: string;
    experience: string;
    profile: string;
  };
  pages: {
    blog: string;
    contact: string;
    experience: string;
    profile: string;
  };
  experience: {
    title: string;
    items: ExperienceItem[];
  };
  profile: {
    about: string;
    basic: ProfileItem[];
    skills: string;
    toolsAndAi: string;
    favorite: string;
    favoriteDescription: string;
  };
  notFound: {
    title: string;
    description: string;
    backToHome: string;
  };
}

const messages: Record<Locale, Messages> = {
  en: en as Messages,
  ja: ja as Messages,
};

export function getMessages(locale: Locale): Messages {
  return messages[locale];
}

export function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}

/** 各ページの getStaticPaths() から使う、ロケール一覧のパラメータ */
export function localeParams() {
  return locales.map((locale) => ({ params: { locale } }));
}

/** ロケールプレフィックス付きの内部リンクを組み立てる */
export function localeHref(locale: Locale, path = ""): string {
  const normalized = path === "/" ? "" : path;
  return `/${locale}${normalized}`;
}

export const localeLabels: Record<Locale, string> = {
  en: "🇺🇸",
  ja: "🇯🇵",
};
