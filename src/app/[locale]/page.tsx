import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";

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
    <div className="flex w-full max-w-3xl flex-col items-center justify-center px-16 font-sans">
      <h1 className="text-3xl font-bold mb-8">{t("title")}</h1>
      <nav className="flex flex-col gap-4">
        {pages.map((page) => (
          <Link
            key={page.path}
            href={page.path}
            className="flex items-center gap-2 text-xl"
          >
            <span>{page.icon}</span>
            <span>{page.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

