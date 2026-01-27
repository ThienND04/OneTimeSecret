import MainLayout from '../layouts/MainLayout';
import { Button, Card, IconBox, GradientText } from '../components/common';

export default function HomePage() {
  return (
    <MainLayout>
      <div className="w-full space-y-24 lg:space-y-32 justify-items-center">
        {/* Hero Section */}
        <div className="text-center max-w-6xl mx-auto">
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-8 leading-tight">
            Share Secrets <GradientText>Securely</GradientText>
          </h2>
          <p className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Send sensitive information that can only be read once and then disappears forever
          </p>
          <div className="flex gap-6 justify-center flex-wrap">
            <Button href="/create" variant="primary" size="lg" className="shadow-2xl">
              Create a Secret
            </Button>
            <Button variant="secondary" size="lg">
              Learn More
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          <Card variant="cyan">
            <IconBox variant="cyan" size="md" className="mb-8">
              <span className="text-5xl">🔒</span>
            </IconBox>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">One-Time Access</h3>
            <p className="text-gray-300 leading-relaxed text-lg">
              Your secret can only be viewed once. After that, it's permanently deleted.
            </p>
          </Card>

          <Card variant="emerald">
            <IconBox variant="emerald" size="md" className="mb-8">
              <span className="text-5xl">🔐</span>
            </IconBox>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">Password Protected</h3>
            <p className="text-gray-300 leading-relaxed text-lg">
              Optionally add password protection for an extra layer of security.
            </p>
          </Card>

          <Card variant="gradient" className="sm:col-span-2 lg:col-span-1">
            <IconBox variant="gradient" size="md" className="mb-8">
              <span className="text-5xl">📎</span>
            </IconBox>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">File Attachments</h3>
            <p className="text-gray-300 leading-relaxed text-lg">
              Attach up to 3 files to your secret message for secure sharing.
            </p>
          </Card>
        </div>

        {/* How it works */}
        <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border-2 border-cyan-500/30 rounded-3xl p-12 lg:p-20 backdrop-blur-sm">
          <h3 className="text-4xl sm:text-5xl font-extrabold text-white mb-16 lg:mb-20 text-center">
            How It <GradientText>Works</GradientText>
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
            <div className="text-center">
              <IconBox variant="cyan" size="lg" shape="circle" className="mx-auto mb-8 border-4 border-cyan-400/30">
                <span className="text-white font-black text-5xl sm:text-6xl">1</span>
              </IconBox>
              <h4 className="text-2xl sm:text-3xl font-bold text-white mb-4">Create</h4>
              <p className="text-gray-300 leading-relaxed text-lg">
                Write your secret message or upload files
              </p>
            </div>
            <div className="text-center">
              <IconBox variant="emerald" size="lg" shape="circle" className="mx-auto mb-8 border-4 border-emerald-400/30">
                <span className="text-white font-black text-5xl sm:text-6xl">2</span>
              </IconBox>
              <h4 className="text-2xl sm:text-3xl font-bold text-white mb-4">Share</h4>
              <p className="text-gray-300 leading-relaxed text-lg">
                Get a unique link and share it securely
              </p>
            </div>
            <div className="text-center sm:col-span-2 lg:col-span-1">
              <IconBox variant="gradient" size="lg" shape="circle" className="mx-auto mb-8 border-4 border-cyan-400/30">
                <span className="text-white font-black text-5xl sm:text-6xl">3</span>
              </IconBox>
              <h4 className="text-2xl sm:text-3xl font-bold text-white mb-4">Auto-Delete</h4>
              <p className="text-gray-300 leading-relaxed text-lg">
                Message disappears after being read once
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
