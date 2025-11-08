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
        <div className="text-2xl mb-8">{t("profile")}</div>
        <div className="flex flex-col items-center gap-12 md:gap-20">
          <Image
            src="/me_in_cafe.svg"
            alt="Me in cafe"
            width={500}
            height={500}
            className="w-full max-w-48 md:max-w-sm h-auto rounded-full"
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
