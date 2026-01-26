import MainLayout from '../layouts/MainLayout';

export default function HomePage() {
  return (
    <MainLayout>
      <div className="w-full">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Share Secrets Securely
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Send sensitive information that can only be read once and then disappears forever
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="/create"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors shadow-lg shadow-blue-600/20"
            >
              Create a Secret
            </a>
            <button className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors border border-slate-700">
              Learn More
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 hover:border-blue-600/50 transition-colors">
            <div className="w-14 h-14 bg-blue-600/10 rounded-lg flex items-center justify-center mb-6">
              <span className="text-3xl">🔒</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">One-Time Access</h3>
            <p className="text-slate-400 leading-relaxed">
              Your secret can only be viewed once. After that, it's permanently deleted.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 hover:border-purple-600/50 transition-colors">
            <div className="w-14 h-14 bg-purple-600/10 rounded-lg flex items-center justify-center mb-6">
              <span className="text-3xl">🔐</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Password Protected</h3>
            <p className="text-slate-400 leading-relaxed">
              Optionally add password protection for an extra layer of security.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 hover:border-green-600/50 transition-colors">
            <div className="w-14 h-14 bg-green-600/10 rounded-lg flex items-center justify-center mb-6">
              <span className="text-3xl">📎</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">File Attachments</h3>
            <p className="text-slate-400 leading-relaxed">
              Attach up to 3 files to your secret message for secure sharing.
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12">
          <h3 className="text-3xl font-bold text-white mb-12 text-center">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-3xl shadow-lg shadow-blue-600/30">
                1
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">Create</h4>
              <p className="text-slate-400 leading-relaxed">
                Write your secret message or upload files
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-3xl shadow-lg shadow-purple-600/30">
                2
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">Share</h4>
              <p className="text-slate-400 leading-relaxed">
                Get a unique link and share it securely
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-3xl shadow-lg shadow-green-600/30">
                3
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">Auto-Delete</h4>
              <p className="text-slate-400 leading-relaxed">
                Message disappears after being read once
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
