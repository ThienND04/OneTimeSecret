import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { Card, GradientText } from '../components/common';
import { ForgotPasswordForm } from '../components/features/ForgotPasswordForm';

export const ForgotPasswordPage = () => {
    return (
        <MainLayout>
            <div className="max-w-md mx-auto py-12 px-4">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-4">
                        Forgot <GradientText>Password</GradientText>
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        No worries, we'll help you reset it
                    </p>
                </div>

                <Card className="p-8">
                    <ForgotPasswordForm />
                </Card>

                <div className="mt-6 text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                        Remember your password?{' '}
                        <Link
                            to="/login"
                            className="text-cyan-500 hover:text-cyan-400 font-medium"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </MainLayout>
    );
};
