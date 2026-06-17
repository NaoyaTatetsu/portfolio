import Image from "next/image";
import { getTranslations } from "next-intl/server";
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

  const pages = [
    { name: t("profile"), path: "/profile", icon: "👤", bg: "#f4e5cc" },
    { name: t("news"), path: "/news", icon: "📰", bg: "#fff4dc" },
    { name: t("blog"), path: "/blog", icon: "📝", bg: "#c5e8e3" },
    { name: t("experience"), path: "/experience", icon: "🏢", bg: "#fde0d4" },
    { name: t("contact"), path: "/contact", icon: "📧", bg: "#e0eddb" },
  ];

  return (
    <div className="flex w-full max-w-3xl flex-col items-center justify-center px-8 font-sans mt-8 mb-8">
      <Image
        src="/dev_icon.svg"
        alt="dev icon"
        width={320}
        height={320}
        priority
        className="mb-8 rounded-full w-32 h-32 md:w-44 md:h-44 lg:w-44 lg:h-44 shadow-lg dark:shadow-xl dark:shadow-zinc-800/50"
      />
      <TypingText />
      <nav className="flex flex-col gap-3 w-full max-w-xs">
        {pages.map((page, i) => {
          const tilt = (i - (pages.length - 1) / 2) * 1.2;
          return (
            <Link
              key={page.path}
              href={page.path}
              className="font-display font-semibold flex items-center gap-3 text-base md:text-lg text-zinc-900 border-2 border-zinc-900 dark:border-zinc-50 rounded-lg px-4 py-2 shadow-[3px_3px_0_0_rgba(0,0,0,0.85)] dark:shadow-[3px_3px_0_0_rgba(255,255,255,0.7)] transition-transform hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[5px_5px_0_0_rgba(0,0,0,0.85)] dark:hover:shadow-[5px_5px_0_0_rgba(255,255,255,0.7)]"
              style={{
                backgroundColor: page.bg,
                transform: `rotate(${tilt}deg)`,
              }}
            >
              <span className="text-xl">{page.icon}</span>
              <span>{page.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
