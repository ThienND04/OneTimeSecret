export default function Footer() {
  return (
    <footer className="bg-gray-900/50 border-t border-cyan-500/20 mt-auto">
      <div className="w-full px-6 lg:px-12 xl:px-20 py-8">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-300 text-sm text-center sm:text-left leading-relaxed font-medium">
            © 2026 OneTimeSecret. Secure, private, one-time message sharing.
          </p>
          <div className="flex gap-6">
            <a
              href="https://github.com/ThienND04/OneTimeSecret"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-cyan-400 text-sm transition-colors hover:underline font-medium"
            >
              GitHub
            </a>
            <a
              href="/docs"
              className="text-gray-300 hover:text-cyan-400 text-sm transition-colors hover:underline font-medium"
            >
              Documentation
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
