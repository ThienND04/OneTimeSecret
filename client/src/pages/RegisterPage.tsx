import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { Card, GradientText } from '../components/common';
import { RegisterForm } from '../components/features/RegisterForm';

export const RegisterPage = () => {
    const navigate = useNavigate();

    const handleSuccess = () => {
        navigate('/');
    };

    return (
        <MainLayout>
            <div className="max-w-md mx-auto py-12 px-4">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-4">
                        Create <GradientText>Account</GradientText>
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Join us to securely share your secrets
                    </p>
                </div>

                <Card className="p-8">
                    <RegisterForm onSuccess={handleSuccess} />
                </Card>

                <div className="mt-6 text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                        Already have an account?{' '}
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
