import Image from "next/image";
import { getTranslations } from "next-intl/server";
import InstagramPhone from "@/components/InstagramPhone";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

interface ProfileItem {
  title: string;
  description: string;
}

const INSTAGRAM_URL =
  "https://www.instagram.com/tttnaoya?igsh=NG9jdTE1aG9zMDFp&utm_source=qr";

const instagramFeeds = [
  "/instagram/feed-1.svg",
  "/instagram/feed-2.svg",
  "/instagram/feed-3.svg",
];

export default async function ProfilePage({ params }: PageProps) {
  await params;
  const t = await getTranslations("pages");
  const profileT = await getTranslations("profile");

  const items = profileT.raw("items") as ProfileItem[];

  return (
    <div className="w-full px-4 pt-7 pb-20 self-start">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center gap-6 md:gap-8">
          <div className="text-2xl text-center font-bold">{t("profile")}</div>
          <Image
            src="/me_in_cafe.svg"
            alt="Me in cafe"
            width={320}
            height={320}
            className="rounded-full w-32 h-32 md:w-44 md:h-44 lg:w-56 lg:h-56 shadow-lg dark:shadow-xl dark:shadow-zinc-800/50"
          />
          <div className="space-y-4 text-left max-w-70 md:max-w-90 lg:max-w-90 mx-auto px-4 pb-8">
            {items.map((item) => (
              <div key={item.title} className="flex flex-col">
                <span className="font-semibold break-words">{item.title}</span>
                <span className="text-sm break-words">{item.description}</span>
              </div>
            ))}
          </div>
          <div className="text-2xl text-center font-bold">
            {profileT("instagramTitle")}
          </div>
          <InstagramPhone feeds={instagramFeeds} />
          <div className="text-sm pb-8">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity underline underline-offset-4"
            >
              @tttnaoya →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
