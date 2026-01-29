import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { Card, GradientText } from '../components/common';
import { ChangePasswordForm } from '../components/features/ChangePasswordForm';

export const ChangePasswordPage = () => {
    return (
        <MainLayout>
            <div className="max-w-md mx-auto py-12 px-4">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-4">
                        Change <GradientText>Password</GradientText>
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Update your account password
                    </p>
                </div>

                <Card className="p-8">
                    <ChangePasswordForm />
                </Card>

                <div className="mt-6 text-center">
                    <Link
                        to="/"
                        className="text-cyan-500 hover:text-cyan-400 font-medium"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </MainLayout>
    );
};
