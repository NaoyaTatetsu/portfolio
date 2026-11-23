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
  site: {
    /** 人名。トップの見出し・アイコンの alt・構造化データ（Person）に使う */
    name: string;
    /** サイト名。各ページの <title> の末尾に付く */
    title: string;
    description: string;
  };
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
    /** ブログ記事の目次の見出し */
    toc: string;
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

/**
 * ルート / にトップを出すロケール。このロケールのトップは /ja ではなく / になり、
 * /ja は public/_redirects で / へ 308 する（トップ以外は /ja/... のまま）
 */
export const rootLocale: Locale = "ja";

/** トップページを生成するロケール（rootLocale のトップは src/pages/index.astro が出す） */
export function homeLocaleParams() {
  return localeParams().filter(({ params }) => params.locale !== rootLocale);
}

/** ロケールプレフィックス付きの内部リンクを組み立てる（rootLocale のトップだけは /） */
export function localeHref(locale: Locale, path = ""): string {
  const normalized = path === "/" ? "" : path;
  if (locale === rootLocale && normalized === "") return "/";
  return `/${locale}${normalized}`;
}

/**
 * canonical・hreflang・構造化データ用の絶対 URL。Cloudflare の配信に合わせて末尾スラッシュを付ける
 * （/en/profile は /en/profile/ へリダイレクトされるため、正規の URL はスラッシュ付きの方）
 */
export function absoluteLocaleUrl(
  locale: Locale,
  path: string,
  site: URL | undefined,
): string {
  const href = localeHref(locale, path);
  return new URL(href.endsWith("/") ? href : `${href}/`, site).href;
}

export const localeLabels: Record<Locale, string> = {
  en: "🇺🇸",
  ja: "🇯🇵",
};
