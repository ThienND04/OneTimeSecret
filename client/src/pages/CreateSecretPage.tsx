import { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import Card from '../components/common/Card';
import GradientText from '../components/common/GradientText';
import CreateSecretForm from '../components/features/CreateSecretForm';
import SecretSuccessModal from '../components/features/SecretSuccessModal';
import type { CreateSecretResponse } from '../types';

const CreateSecretPage = () => {
    const [successResponse, setSuccessResponse] =
        useState<CreateSecretResponse | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSuccess = (response: CreateSecretResponse) => {
        setSuccessResponse(response);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSuccessResponse(null);
    };

    return (
        <MainLayout>
            <div className="max-w-3xl mx-auto py-12 px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Create a <GradientText>Secret</GradientText>
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Share sensitive information securely. Your secret will
                        be encrypted and can only be viewed once.
                    </p>
                </div>

                <Card className="p-8">
                    <CreateSecretForm onSuccess={handleSuccess} />
                </Card>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <svg
                                className="w-6 h-6 text-cyan-600 dark:text-cyan-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            Encrypted
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            All secrets are encrypted using AES-256-CBC
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <svg
                                className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            View Once
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Secrets self-destruct after being viewed once
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <svg
                                className="w-6 h-6 text-purple-600 dark:text-purple-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            File Support
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Attach up to 3 files, 3MB each
                        </p>
                    </div>
                </div>
            </div>

            {successResponse && (
                <SecretSuccessModal
                    isOpen={isModalOpen}
                    accessUrl={successResponse.accessUrl}
                    onClose={handleCloseModal}
                />
            )}
        </MainLayout>
    );
};

export default CreateSecretPage;
