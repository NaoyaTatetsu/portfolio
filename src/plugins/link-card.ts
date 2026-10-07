import type { SatteriResolvedOptions } from "@astrojs/markdown-satteri";
import type { Paragraph } from "mdast";

// Zenn の @[card](URL) 記法をリンクカードに変換する Sätteri の mdast プラグイン。
// ビルド時に OGP を取得して静的 HTML として埋め込むので、クライアント JS は増えない。
//
// 対応する書き方:
// - 独立した段落の @[card](URL)
// - 段落(箇条書きの項目を含む)の末尾の行の @[card](URL)。
//   カードは段落の直後にブロックとして置く

type MdastPlugin = Extract<
  SatteriResolvedOptions["mdastPlugins"][number],
  { name: string }
>;

interface Ogp {
  title?: string;
  description?: string;
  image?: string;
}

const FETCH_TIMEOUT_MS = 10_000;

// en / ja の両方の記事から同じ URL を参照しても、1回のビルドで取得は1回にする
const ogpCache = new Map<string, Promise<Ogp>>();

export const linkCard: MdastPlugin = {
  name: "link-card",
  async paragraph(node, ctx) {
    const card = findTrailingCard(node);
    if (!card) return;

    const html = {
      type: "html",
      value: renderCard(card.url, await getOgp(card.url)),
    } as const;
    if (card.keep === 0) {
      ctx.replaceNode(node, html);
      return;
    }
    const nodes = node.children;
    for (let i = nodes.length - 1; i >= card.keep; i--) {
      ctx.removeNode(nodes[i]);
    }
    if (card.lastText !== undefined) {
      ctx.replaceNode(nodes[card.keep - 1], {
        type: "text",
        value: card.lastText,
      });
    }
    ctx.insertAfter(node, html);
  },
};

interface TrailingCard {
  url: string;
  /** 段落に残す子ノードの数(先頭から) */
  keep: number;
  /** 残す最後のテキストノードの末尾を削った値。変更が無ければ undefined */
  lastText?: string;
}

// 段落の末尾が「@」+ テキストが card のリンクかを調べる。
// カードの直前にあった改行(空白・<br>・</br>)も落とし、段落の末尾に余計な改行を残さない
function findTrailingCard(paragraph: Readonly<Paragraph>): TrailingCard | null {
  const nodes = paragraph.children;
  const link = nodes.at(-1);
  const at = nodes.at(-2);
  if (
    link?.type !== "link" ||
    link.children.length !== 1 ||
    link.children[0].type !== "text" ||
    link.children[0].value !== "card" ||
    at?.type !== "text" ||
    !/(^|\n)[ \t]*@$/.test(at.value)
  ) {
    return null;
  }

  for (let i = nodes.length - 2; i >= 0; i--) {
    const current = nodes[i];
    if (current.type === "text") {
      const value = (
        i === nodes.length - 2 ? current.value.slice(0, -1) : current.value
      ).trimEnd();
      if (value !== "") {
        return {
          url: link.url,
          keep: i + 1,
          lastText: value === current.value ? undefined : value,
        };
      }
    } else if (
      current.type !== "break" &&
      !(current.type === "html" && /^<\/?br\s*\/?>$/i.test(current.value))
    ) {
      return { url: link.url, keep: i + 1 };
    }
  }
  return { url: link.url, keep: 0 };
}

function getOgp(url: string): Promise<Ogp> {
  let ogp = ogpCache.get(url);
  if (!ogp) {
    ogp = fetchOgp(url);
    ogpCache.set(url, ogp);
  }
  return ogp;
}

// 取得に失敗してもビルドは止めず、URL だけのカードにする
async function fetchOgp(url: string): Promise<Ogp> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; p-jihyo.jp link card)",
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return parseOgp(await res.text(), res.url || url);
  } catch (error) {
    console.warn(
      `[link-card] Failed to fetch OGP for ${url}: ${error instanceof Error ? error.message : error}`,
    );
    return {};
  }
}

function parseOgp(html: string, baseUrl: string): Ogp {
  const meta = new Map<string, string>();
  for (const [tag] of html.matchAll(/<meta\s[^>]*>/gi)) {
    const attrs = new Map<string, string>();
    for (const [, name, , dq, sq] of tag.matchAll(
      /([\w:-]+)\s*=\s*("([^"]*)"|'([^']*)')/g,
    )) {
      attrs.set(name.toLowerCase(), dq ?? sq);
    }
    const key = (attrs.get("property") ?? attrs.get("name"))?.toLowerCase();
    const content = attrs.get("content");
    if (key && content && !meta.has(key)) {
      meta.set(key, decodeEntities(content).trim());
    }
  }
  const titleTag = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1];

  const image = meta.get("og:image") ?? meta.get("twitter:image");
  return {
    title:
      meta.get("og:title") ??
      meta.get("twitter:title") ??
      (titleTag && decodeEntities(titleTag).trim()),
    description:
      meta.get("og:description") ??
      meta.get("twitter:description") ??
      meta.get("description"),
    image: image ? toAbsoluteUrl(image, baseUrl) : undefined,
  };
}

function toAbsoluteUrl(url: string, baseUrl: string): string | undefined {
  try {
    return new URL(url, baseUrl).href;
  } catch {
    return undefined;
  }
}

function decodeEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(Number(dec)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Tailwind はソース中のクラス名を走査して CSS を生成するため、クラスは文字列のまま書く。
// 記事本文は .prose の中なので、リンクの下線などが当たらないよう not-prose を付ける
function renderCard(url: string, ogp: Ogp): string {
  const host = URL.canParse(url) ? new URL(url).hostname : url;
  const title = escapeHtml(ogp.title || url);
  const description = ogp.description
    ? `<span class="line-clamp-1 text-[13px] text-zinc-500 dark:text-zinc-400">${escapeHtml(ogp.description)}</span>`
    : "";
  const image = ogp.image
    ? `<img src="${escapeHtml(ogp.image)}" alt="" loading="lazy" decoding="async" class="w-[120px] shrink-0 self-stretch border-l border-zinc-200 object-cover sm:w-[230px] dark:border-zinc-700" />`
    : "";

  return [
    `<a href="${escapeHtml(url)}" class="not-prose my-4 flex overflow-hidden rounded-lg border border-zinc-200 bg-white transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700/60">`,
    `<span class="flex min-w-0 flex-1 flex-col justify-center gap-1 px-4 py-3">`,
    `<span class="line-clamp-2 text-[15px] font-bold leading-snug [overflow-wrap:anywhere] text-zinc-900 dark:text-zinc-100">${title}</span>`,
    description,
    `<span class="truncate text-[12px] text-zinc-500 dark:text-zinc-400">${escapeHtml(host)}</span>`,
    `</span>`,
    image,
    `</a>`,
  ].join("");
}
