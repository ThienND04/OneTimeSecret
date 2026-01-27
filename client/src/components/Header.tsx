import { Button, IconBox } from './common';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-cyan-500/20 bg-gray-900/80 backdrop-blur-md justify-items-center">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex shrink-0 items-center gap-3">
          <IconBox variant="gradient" size="sm">
            <span className="text-xl font-bold text-white">🔐</span>
          </IconBox>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              OneTimeSecret
            </h1>
            <p className="text-xs text-gray-400 sm:text-sm">Secure message sharing</p>
          </div>
          <div className="sm:hidden">
            <h1 className="text-xl font-bold tracking-tight text-white">OTS</h1>
          </div>
        </div>

        <nav className="flex items-center gap-2 sm:gap-4">
          <Button href="/" variant="ghost" size="sm">
            Home
          </Button>
          <Button href="/create" variant="primary" size="md" className="whitespace-nowrap">
            Create Secret
          </Button>
        </nav>
      </div>
    </header>
  );
}