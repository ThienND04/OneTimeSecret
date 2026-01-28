import { useState, useEffect } from 'react';
import Button from '../common/Button';
import Card from '../common/Card';

interface SecretSuccessModalProps {
    isOpen: boolean;
    secretId: string;
    onClose: () => void;
}

const SecretSuccessModal: React.FC<SecretSuccessModalProps> = ({
    isOpen,
    secretId,
    onClose
}) => {
    const [copied, setCopied] = useState(false);
    const frontendUrl = `${window.location.origin}/secret/${secretId}`;

    useEffect(() => {
        if (!isOpen) {
            setCopied(false);
        }
    }, [isOpen]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(frontendUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <Card
                variant="gradient"
                className="max-w-2xl w-full p-8 animate-in fade-in zoom-in duration-200"
            >
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                        <svg
                            className="h-10 w-10 text-green-600 dark:text-green-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Secret Created Successfully!
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Share this link with your recipient. It can only be
                        viewed once!
                    </p>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-left">
                            Secret Link
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={frontendUrl}
                                readOnly
                                className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 font-mono text-sm"
                                onClick={(e) => e.currentTarget.select()}
                            />
                            <Button
                                onClick={handleCopy}
                                variant={copied ? 'secondary' : 'primary'}
                                className="px-6"
                            >
                                {copied ? (
                                    <>
                                        <svg
                                            className="w-5 h-5 mr-2"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            className="w-5 h-5 mr-2"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                            />
                                        </svg>
                                        Copy
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                        <div className="flex">
                            <svg
                                className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0 mt-0.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                            <div className="text-left">
                                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                                    Important Reminder
                                </h3>
                                <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                                    This link will expire after the first view.
                                    Make sure to save any important information
                                    before closing this window.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            onClick={onClose}
                            variant="secondary"
                            size="lg"
                            className="flex-1"
                        >
                            Create Another Secret
                        </Button>
                        <Button
                            to={`/secret/${secretId}`}
                            variant="outline"
                            size="lg"
                            className="flex-1"
                        >
                            View Secret
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default SecretSuccessModal;
