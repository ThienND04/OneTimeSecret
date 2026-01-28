import MainLayout from '../layouts/MainLayout';
import { Button } from '../components/common';

const NotFoundPage = () => {
    return (
        <MainLayout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <h1 className="text-6xl font-bold text-white mb-4">404</h1>
                <p className="text-xl text-gray-400 mb-8">Page not found</p>
                <Button to="/" variant="primary" size="lg">
                    Go Home
                </Button>
            </div>
        </MainLayout>
    );
};

export default NotFoundPage;
