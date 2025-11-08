import { getTranslations } from "next-intl/server";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function ExperiencePage({ params }: PageProps) {
  await params;
  const t = await getTranslations("pages");

  return (
    <div className="w-full px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-2xl">{t("experience")}</div>
      </div>
    </div>
  );
}
