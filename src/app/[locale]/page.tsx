import {
  BuildingOfficeIcon,
  EnvelopeIcon,
  PencilSquareIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { FaGithub, FaInstagram, FaXTwitter } from "react-icons/fa6";
import Tilt from "@/components/Tilt";
import TypingText from "@/components/TypingText";
import { Link } from "@/i18n/routing";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function Home({ params }: PageProps) {
  await params;
  const t = await getTranslations("home");

  const bubbles = [
    { name: t("profile"), href: "/profile", Icon: UserIcon, external: false },
    { name: t("blog"), href: "/blog", Icon: PencilSquareIcon, external: false },
    {
      name: t("experience"),
      href: "/experience",
      Icon: BuildingOfficeIcon,
      external: false,
    },
    {
      name: t("contact"),
      href: "/contact",
      Icon: EnvelopeIcon,
      external: false,
    },
    {
      name: "X",
      href: "https://x.com/tttnaobi",
      Icon: FaXTwitter,
      external: true,
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/tttnaoya?igsh=NG9jdTE1aG9zMDFp&utm_source=qr",
      Icon: FaInstagram,
      external: true,
    },
    {
      name: "GitHub",
      href: "https://github.com/NaoyaTatetsu",
      Icon: FaGithub,
      external: true,
    },
  ];

  // globals.css の orbit アニメーションの duration と合わせる
  const orbitDuration = 120;

  return (
    <div className="orbit-container relative flex w-full max-w-3xl flex-col items-center justify-center px-16 font-sans my-8">
      <Tilt className="mb-8">
        <Image
          src="/dev_icon.svg"
          alt="dev icon"
          width={320}
          height={320}
          priority
          className="rounded-full w-32 h-32 md:w-44 md:h-44 lg:w-44 lg:h-44 shadow-lg dark:shadow-xl dark:shadow-zinc-800/50"
        />
      </Tilt>
      <TypingText />
      <nav className="absolute inset-0 pointer-events-none" aria-label="Main">
        {bubbles.map((bubble, index) => {
          const bubbleClassName =
            "orbit-bubble group pointer-events-auto absolute top-1/2 left-1/2 -mt-7 -ml-7 h-14 w-14";
          const bubbleStyle = {
            "--orbit-angle": `${(360 / bubbles.length) * index}deg`,
            animationDelay: `${-(orbitDuration / bubbles.length) * index}s`,
          } as React.CSSProperties;
          const content = (
            <>
              {/* ホバー判定はリンク側の固定サイズで行い、見た目だけ拡大する（判定領域が動くと震えるため） */}
              <span className="flex h-full w-full items-center justify-center rounded-full border border-white/50 dark:border-white/20 bg-white/25 dark:bg-white/10 backdrop-blur-md shadow-[inset_0_4px_10px_rgba(255,255,255,0.45),0_4px_14px_rgba(0,0,0,0.15)] transition-transform duration-200 group-hover:scale-110">
                <bubble.Icon className="w-6 h-6" />
              </span>
              <span className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/50 dark:border-white/20 bg-white/40 dark:bg-zinc-900/50 backdrop-blur-sm px-3 py-1 text-sm opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                {bubble.name}
              </span>
            </>
          );

          return bubble.external ? (
            <a
              key={bubble.href}
              href={bubble.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={bubble.name}
              className={bubbleClassName}
              style={bubbleStyle}
            >
              {content}
            </a>
          ) : (
            <Link
              key={bubble.href}
              href={bubble.href}
              aria-label={bubble.name}
              className={bubbleClassName}
              style={bubbleStyle}
            >
              {content}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
