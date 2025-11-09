import { getTranslations } from "next-intl/server";
import Image from "next/image";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function ProfilePage({ params }: PageProps) {
  await params;
  const t = await getTranslations("pages");
  const profileT = await getTranslations("profile");

  return (
    <div className="w-full px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center gap-6 md:gap-8">
          <div className="text-2xl mb-4 text-center font-bold">{t("profile")}</div>
          <Image
            src="/me_in_cafe.svg"
            alt="Me in cafe"
            width={320}
            height={320}
            className="rounded-full w-40 h-40 md:w-56 md:h-56 lg:w-72 lg:h-72"
          />
          <div className="space-y-4 text-left">
            <div>
              <span className="font-semibold">{profileT("name")} : </span>
              <span>{profileT("nameValue")}</span>
            </div>
            <div>
              <span className="font-semibold">{profileT("birthday")} : </span>
              <span>{profileT("birthdayValue")}</span>
            </div>
            <div>
              <span className="font-semibold">{profileT("live")} : </span>
              <span>{profileT("liveValue")}</span>
            </div>
            <div>
              <span className="font-semibold">{profileT("from")} : </span>
              <span>{profileT("fromValue")}</span>
            </div>
            <div>
              <span className="font-semibold">{profileT("age")}: </span>
              <span>{profileT("ageValue")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
