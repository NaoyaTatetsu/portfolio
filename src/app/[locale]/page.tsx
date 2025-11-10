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
    { name: t("profile"), path: "/profile", icon: "👤" },
    { name: t("news"), path: "/news", icon: "📰" },
    { name: t("blog"), path: "/blog", icon: "📝" },
    { name: t("experience"), path: "/experience", icon: "🏢" },
    { name: t("contact"), path: "/contact", icon: "📧" },
  ];

  return (
    <div className="flex w-full max-w-3xl flex-col items-center justify-center px-16 font-sans mt-8 mb-8">
      <Image
        src="/dev_icon.svg"
        alt="dev icon"
        width={320}
        height={320}
        className="mb-8 rounded-full w-32 h-32 md:w-44 md:h-44 lg:w-56 lg:h-56 shadow-lg dark:shadow-xl dark:shadow-zinc-800/50"
      />
      <TypingText />
      <nav className="flex flex-col gap-4">
        {pages.map((page) => (
          <Link
            key={page.path}
            href={page.path}
            className="flex items-center gap-2 text-lg"
          >
            <span>{page.icon}</span>
            <span>{page.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
