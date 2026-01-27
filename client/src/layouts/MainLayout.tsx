import type { ReactNode } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface MainLayoutProps {
    children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    return (
        <div className="flex flex-col w-full min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 items-stretch">
            <Header />

            <main className="flex-1 w-full flex justify-center">
                <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
                    {children}
                </div>
            </main>

            <Footer />
        </div>
    );
}
