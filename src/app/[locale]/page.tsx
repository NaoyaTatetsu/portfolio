import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import TypingText from "@/components/TypingText";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function Home({ params }: PageProps) {
  await params;
  const t = await getTranslations("home");

  const pages = [
    { name: t("profile"), path: "/profile", icon: "👤", },
    { name: t("news"), path: "/news", icon: "📰", },
    { name: t("blog"), path: "/blog", icon: "📝", },
    { name: t("experience"), path: "/experience", icon: "🏢", },
    { name: t("contact"), path: "/contact", icon: "📧", },
  ];

  return (
    <div className="flex w-full max-w-3xl flex-col items-center justify-center px-16 font-sans mt-8">
      <Image
        src="/dev_icon.svg"
        alt="dev icon"
        width={320}
        height={320}
        className="mb-8 rounded-full w-40 h-40 md:w-56 md:h-56 lg:w-72 lg:h-72"
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

