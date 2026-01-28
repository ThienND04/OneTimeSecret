import { useState } from 'react';
import type { FormEvent } from 'react';
import { apiService } from '../../services/api';
import type { CreateSecretResponse } from '../../types';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import FileUpload from '../common/FileUpload';
import Button from '../common/Button';
import { MAX_SECRET_LENGTH, MAX_FILES } from '../../config/constants';

interface CreateSecretFormProps {
    onSuccess: (response: CreateSecretResponse) => void;
}

const CreateSecretForm: React.FC<CreateSecretFormProps> = ({ onSuccess }) => {
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [password, setPassword] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [isClientEncrypted, setIsClientEncrypted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!content.trim()) {
            setError('Content is required');
            return;
        }

        if (content.length > MAX_SECRET_LENGTH) {
            setError(
                `Content exceeds maximum length of ${MAX_SECRET_LENGTH} characters`
            );
            return;
        }

        if (title && title.length > 100) {
            setError('Title must not exceed 100 characters');
            return;
        }

        setIsLoading(true);

        try {
            const response = await apiService.createSecret({
                content,
                password: password || undefined,
                is_client_encrypted: isClientEncrypted,
                title: title || undefined,
                files: files.length > 0 ? files : undefined
            });

            onSuccess(response);

            // Reset form
            setContent('');
            setTitle('');
            setPassword('');
            setFiles([]);
            setIsClientEncrypted(false);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Failed to create secret'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">
                        {error}
                    </p>
                </div>
            )}

            <Input
                label="Title (Optional)"
                placeholder="Give your secret a private title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                helperText="This title is private and won't be shared with the recipient"
            />

            <Textarea
                label="Secret Content"
                placeholder="Enter your secret message..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                maxLength={MAX_SECRET_LENGTH}
                showCharCount
                required
            />

            <Input
                label="Password (Optional)"
                variant="password"
                placeholder="Protect with a password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                helperText="Add an extra layer of security with a password"
            />

            <FileUpload
                onChange={setFiles}
                maxFiles={MAX_FILES}
                maxSizePerFile={3 * 1024 * 1024} // 3MB
            />

            <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <input
                    type="checkbox"
                    id="clientEncryption"
                    checked={isClientEncrypted}
                    onChange={(e) => setIsClientEncrypted(e.target.checked)}
                    className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                />
                <label
                    htmlFor="clientEncryption"
                    className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                    Enable client-side encryption (Advanced)
                </label>
            </div>

            <div className="flex gap-4">
                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isLoading || !content.trim()}
                    className="flex-1"
                >
                    {isLoading ? (
                        <>
                            <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            Creating Secret...
                        </>
                    ) : (
                        'Create Secret'
                    )}
                </Button>
            </div>
        </form>
    );
};

export default CreateSecretForm;
