import { FaGithub, FaInstagram, FaXTwitter } from "react-icons/fa6";

const links = [
  {
    label: "X (Twitter)",
    href: "https://x.com/tttnaobi",
    Icon: FaXTwitter,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/tttnaoya?igsh=NG9jdTE1aG9zMDFp&utm_source=qr",
    Icon: FaInstagram,
  },
  {
    label: "GitHub",
    href: "https://github.com/NaoyaTatetsu",
    Icon: FaGithub,
  },
];

export default function ContactScreen() {
  return (
    <div className="w-full h-full flex items-center justify-center px-6 py-5 text-zinc-900 dark:text-zinc-100">
      <div className="text-center">
        <h1 className="text-xl font-bold mb-5">Contact</h1>
        <ul className="flex flex-col gap-3 items-stretch">
          {links.map(({ label, href, Icon }) => (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Icon className="text-lg" />
                <span className="text-sm">{label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
