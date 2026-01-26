import { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">🔐</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">OneTimeSecret</h1>
                <p className="text-sm text-slate-400">Secure message sharing</p>
              </div>
            </div>
            
            <nav className="flex gap-4">
              <a
                href="/"
                className="text-slate-300 hover:text-white transition-colors px-4 py-2"
              >
                Home
              </a>
              <a
                href="/create"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
              >
                Create Secret
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-sm text-center sm:text-left">
              © 2026 OneTimeSecret. Secure, private, one-time message sharing.
            </p>
            <div className="flex gap-6">
              <a 
                href="https://github.com/ThienND04/OneTimeSecret" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white text-sm transition-colors"
              >
                GitHub
              </a>
              <a 
                href="/docs" 
                className="text-slate-400 hover:text-white text-sm transition-colors"
              >
                Documentation
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
