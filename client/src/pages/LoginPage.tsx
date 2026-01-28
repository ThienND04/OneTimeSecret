import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { Card, GradientText } from '../components/common';
import { LoginForm } from '../components/features/LoginForm';

export const LoginPage = () => {
    const navigate = useNavigate();

    const handleSuccess = () => {
        navigate('/');
    };

    return (
        <MainLayout>
            <div className="max-w-md mx-auto py-12 px-4">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-4">
                        Welcome <GradientText>Back</GradientText>
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Sign in to your account to continue
                    </p>
                </div>

                <Card className="p-8">
                    <LoginForm onSuccess={handleSuccess} />
                </Card>

                <div className="mt-6 text-center space-y-3">
                    <p className="text-gray-600 dark:text-gray-400">
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            className="text-cyan-500 hover:text-cyan-400 font-medium"
                        >
                            Sign up
                        </Link>
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                        <Link
                            to="/forgot-password"
                            className="text-cyan-500 hover:text-cyan-400 font-medium"
                        >
                            Forgot your password?
                        </Link>
                    </p>
                </div>
            </div>
        </MainLayout>
    );
};
