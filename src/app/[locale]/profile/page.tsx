import { getTranslations } from "next-intl/server";
import Image from "next/image";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

interface ProfileItem {
  title: string;
  description: string;
}

export default async function ProfilePage({ params }: PageProps) {
  await params;
  const t = await getTranslations("pages");
  const profileT = await getTranslations("profile");

  const items = profileT.raw("items") as ProfileItem[];

  return (
    <div className="w-full px-4 pt-20 pb-20 self-start">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center gap-6 md:gap-8">
          <div className="text-2xl text-center font-bold">{t("profile")}</div>
          <Image
            src="/me_in_cafe.svg"
            alt="Me in cafe"
            width={320}
            height={320}
            className="rounded-full w-40 h-40 md:w-56 md:h-56 lg:w-72 lg:h-72"
          />
          <div className="space-y-4 text-left w-full px-10 md:px-[300px] pb-8">
            {items.map((item, index) => (
              <div key={index} className="flex flex-col">
                <span className="font-semibold break-words">{item.title}</span>
                <span className="text-sm break-words">{item.description}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
