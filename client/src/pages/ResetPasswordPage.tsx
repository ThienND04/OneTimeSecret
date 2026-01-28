import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { Card, GradientText } from '../components/common';
import { ResetPasswordForm } from '../components/features/ResetPasswordForm';

export const ResetPasswordPage = () => {
    return (
        <MainLayout>
            <div className="max-w-md mx-auto py-12 px-4">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-4">
                        Reset <GradientText>Password</GradientText>
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Create a new secure password for your account
                    </p>
                </div>

                <Card className="p-8">
                    <ResetPasswordForm />
                </Card>

                <div className="mt-6 text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                        <Link
                            to="/login"
                            className="text-cyan-500 hover:text-cyan-400 font-medium"
                        >
                            Back to Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </MainLayout>
    );
};
