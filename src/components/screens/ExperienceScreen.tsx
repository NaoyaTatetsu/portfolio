import { useTranslations } from "next-intl";

interface ExperienceItem {
  school: string;
  icon: string;
  period: string;
  major: string;
  description: string[];
}

export default function ExperienceScreen() {
  const tPages = useTranslations("pages");
  const tExperience = useTranslations("experience");
  const items = tExperience.raw("items") as ExperienceItem[];

  return (
    <div className="w-full h-full overflow-auto px-6 py-5 text-zinc-900 dark:text-zinc-100">
      <h1 className="text-xl font-bold mb-4">{tPages("experience")}</h1>
      <div className="flex flex-col">
        {items.map((item, index) => (
          <div key={item.school} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="text-base">{item.icon}</div>
              {index < items.length - 1 && (
                <div className="w-0.5 bg-zinc-300 dark:bg-zinc-700 flex-1 my-1" />
              )}
            </div>
            <div className="flex-1 pb-5">
              <div className="text-xs text-zinc-500 mb-1">{item.period}</div>
              <h2 className="text-sm font-bold">{item.school}</h2>
              <div className="italic text-xs mb-2">{item.major}</div>
              {item.description && item.description.length > 0 && (
                <ul className="list-disc list-inside space-y-0.5">
                  {item.description.map((desc) => (
                    <li
                      key={`${item.school}-${desc}`}
                      className="text-xs text-zinc-700 dark:text-zinc-300"
                    >
                      {desc}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
