export type FsNode =
  | { type: "dir"; children: Record<string, FsNode> }
  | { type: "file"; content: string };

export interface ProfileItem {
  title: string;
  description: string;
}

export interface ExperienceItem {
  school: string;
  period: string;
  major: string;
  description: string[];
}

export interface NewsItem {
  title: string;
  content: string;
  date: string;
}

// 翻訳データは配列順で管理されているため、位置に対応する英語スラッグを割り当てる
const PROFILE_SLUGS = [
  "name",
  "age",
  "location",
  "from",
  "skills",
  "tools",
  "ai",
  "favorite",
];

const EXPERIENCE_SLUGS = [
  "fourdigit",
  "cyberagent",
  "musashino-univ",
  "fls-saddleback",
  "ryukyu-univ",
];

function dir(children: Record<string, FsNode>): FsNode {
  return { type: "dir", children };
}

function file(content: string): FsNode {
  return { type: "file", content };
}

export function buildTerminalFs(
  profileItems: ProfileItem[],
  experienceItems: ExperienceItem[],
  newsItems: NewsItem[],
): FsNode {
  const profile: Record<string, FsNode> = {};
  profileItems.forEach((item, i) => {
    const slug = PROFILE_SLUGS[i] ?? `item-${i}`;
    profile[`${slug}.txt`] = file(`${item.title}: ${item.description}`);
  });

  const experience: Record<string, FsNode> = {};
  experienceItems.forEach((item, i) => {
    const slug = EXPERIENCE_SLUGS[i] ?? `item-${i}`;
    const bullets = item.description.map((line) => `- ${line}`).join("\n");
    experience[`${slug}.txt`] = file(
      `${item.school}\n${item.major}\n${item.period}${bullets ? `\n\n${bullets}` : ""}`,
    );
  });

  const news: Record<string, FsNode> = {};
  newsItems.forEach((item, i) => {
    const slug = item.date || `item-${i}`;
    news[`${slug}.txt`] = file(
      `${item.date} — ${item.title}\n\n${item.content}`,
    );
  });

  return dir({
    "README.txt": file(
      [
        "Hi, I'm Naoya Tatetsu — System Engineer.",
        "",
        "Explore this portfolio with Linux commands.",
        "Try:",
        "  ls",
        "  cd profile",
        "  cat skills.txt",
        "  tree",
        "  neofetch",
        "",
        "(psst — not every command is documented in 'help'.)",
      ].join("\n"),
    ),
    ".secret": file("You found me! 🎉 Nothing stays hidden from engineers."),
    profile: dir(profile),
    experience: dir(experience),
    news: dir(news),
    links: dir({
      "github.txt": file("https://github.com/NaoyaTatetsu"),
      "x.txt": file("https://x.com/tttnaobi"),
      "instagram.txt": file("https://www.instagram.com/tttnaoya"),
    }),
  });
}

/** `~`・`/`・`..`・`.` を解決して root からのセグメント配列を返す */
export function resolvePath(cwd: string[], arg: string): string[] {
  const absolute = arg.startsWith("/") || arg.startsWith("~");
  const parts = absolute ? [] : [...cwd];
  const segments = arg
    .replace(/^~\/?/, "")
    .replace(/^\/+/, "")
    .split("/")
    .filter((seg) => seg !== "" && seg !== ".");
  for (const seg of segments) {
    if (seg === "..") {
      parts.pop();
    } else {
      parts.push(seg);
    }
  }
  return parts;
}

export function getNode(root: FsNode, path: string[]): FsNode | null {
  let node: FsNode = root;
  for (const seg of path) {
    if (node.type !== "dir") return null;
    const child: FsNode | undefined = node.children[seg];
    if (!child) return null;
    node = child;
  }
  return node;
}

export function formatCwd(cwd: string[]): string {
  return cwd.length === 0 ? "~" : `~/${cwd.join("/")}`;
}
