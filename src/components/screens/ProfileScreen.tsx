import Image from "next/image";
import { useTranslations } from "next-intl";

interface ProfileItem {
  title: string;
  description: string;
}

export default function ProfileScreen() {
  const tPages = useTranslations("pages");
  const tProfile = useTranslations("profile");
  const items = tProfile.raw("items") as ProfileItem[];

  return (
    <div className="w-full h-full overflow-auto px-6 py-5 text-zinc-900 dark:text-zinc-100">
      <div className="max-w-2xl mx-auto flex flex-col items-center gap-5">
        <h1 className="text-xl font-bold">{tPages("profile")}</h1>
        <Image
          src="/me_in_cafe.svg"
          alt="Me in cafe"
          width={320}
          height={320}
          className="rounded-full w-28 h-28 md:w-32 md:h-32 shadow-md"
        />
        <div className="w-full max-w-sm space-y-3">
          {items.map((item) => (
            <div
              key={item.title}
              className="flex flex-col border-b border-zinc-200 dark:border-zinc-800 pb-2"
            >
              <span className="font-semibold text-sm">{item.title}</span>
              <span className="text-xs text-zinc-700 dark:text-zinc-300">
                {item.description}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
