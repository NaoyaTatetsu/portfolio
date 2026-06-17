import { getTranslations } from "next-intl/server";
import PlanetTitle from "@/components/PlanetTitle";
import ProfileViewer from "@/components/ProfileViewer";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

interface ProfileItem {
  title: string;
  description: string;
}

export default async function ProfilePage({ params }: Readonly<PageProps>) {
  await params;
  const profileT = await getTranslations("profile");

  const items = profileT.raw("items") as ProfileItem[];

  return (
    <div className="w-full px-4 pt-6 pb-8 self-start">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-4 md:gap-6">
        <PlanetTitle
          text="PROFILE"
          className="text-3xl md:text-5xl lg:text-6xl"
        />
        <ProfileViewer items={items} />
      </div>
    </div>
  );
}
