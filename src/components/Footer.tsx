import { FaGithub, FaInstagram, FaXTwitter } from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="w-full bg-white/60 backdrop-blur-sm dark:border-t dark:border-zinc-800 dark:bg-zinc-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-4 text-zinc-600 dark:text-zinc-300">
            <a
              href="https://x.com/tttnaobi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl hover:opacity-70 transition-opacity"
              aria-label="X (Twitter)"
            >
              <FaXTwitter />
            </a>
            <a
              href="https://www.instagram.com/tttnaoya?igsh=NG9jdTE1aG9zMDFp&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl hover:opacity-70 transition-opacity"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
            <a
              href="https://github.com/NaoyaTatetsu"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl hover:opacity-70 transition-opacity"
              aria-label="GitHub"
            >
              <FaGithub />
            </a>
          </div>
          <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            © 2025 NaoyaTatetsu
          </div>
        </div>
      </div>
    </footer>
  );
}
