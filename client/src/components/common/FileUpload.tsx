import { useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';

interface FileUploadProps {
    onChange: (files: File[]) => void;
    maxFiles?: number;
    maxSizePerFile?: number; // in bytes
    acceptedTypes?: string[];
    error?: string;
}

interface FileWithPreview {
    file: File;
    preview?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
    onChange,
    maxFiles = 3,
    maxSizePerFile = 3 * 1024 * 1024, // 3MB default
    acceptedTypes = [],
    error
}) => {
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const [fileError, setFileError] = useState<string>('');
    const inputRef = useRef<HTMLInputElement>(null);

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return (
            Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
        );
    };

    const validateFile = (file: File): string | null => {
        if (file.size > maxSizePerFile) {
            return `${file.name} exceeds ${formatFileSize(maxSizePerFile)} limit`;
        }
        if (acceptedTypes.length > 0 && !acceptedTypes.includes(file.type)) {
            return `${file.name} is not an accepted file type`;
        }
        return null;
    };

    const processFiles = (fileList: FileList | null) => {
        if (!fileList) return;

        const newFiles = Array.from(fileList);
        const totalFiles = files.length + newFiles.length;

        if (totalFiles > maxFiles) {
            setFileError(`Maximum ${maxFiles} files allowed`);
            return;
        }

        const validatedFiles: FileWithPreview[] = [];
        let hasError = false;

        for (const file of newFiles) {
            const error = validateFile(file);
            if (error) {
                setFileError(error);
                hasError = true;
                break;
            }

            const fileWithPreview: FileWithPreview = { file };

            // Create preview for images
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    fileWithPreview.preview = reader.result as string;
                    setFiles((prev) => [...prev]);
                };
                reader.readAsDataURL(file);
            }

            validatedFiles.push(fileWithPreview);
        }

        if (!hasError) {
            setFileError('');
            const updatedFiles = [...files, ...validatedFiles];
            setFiles(updatedFiles);
            onChange(updatedFiles.map((f) => f.file));
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        processFiles(e.target.files);
    };

    const handleDrag = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        processFiles(e.dataTransfer.files);
    };

    const removeFile = (index: number) => {
        const updatedFiles = files.filter((_, i) => i !== index);
        setFiles(updatedFiles);
        onChange(updatedFiles.map((f) => f.file));
        setFileError('');
    };

    const handleClick = () => {
        inputRef.current?.click();
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Attachments (Optional)
            </label>

            <div
                onClick={handleClick}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-all duration-200
          ${
              dragActive
                  ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-cyan-400 dark:hover:border-cyan-500'
          }
          ${error || fileError ? 'border-red-500' : ''}
        `}
            >
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    accept={acceptedTypes.join(',')}
                />

                <svg
                    className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
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

                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                        Click to upload
                    </span>{' '}
                    or drag and drop
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                    Max {maxFiles} files, {formatFileSize(maxSizePerFile)} each
                </p>
            </div>

            {(error || fileError) && (
                <p className="mt-1 text-sm text-red-500">
                    {error || fileError}
                </p>
            )}

            {files.length > 0 && (
                <div className="mt-4 space-y-2">
                    {files.map((fileWithPreview, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                {fileWithPreview.preview ? (
                                    <img
                                        src={fileWithPreview.preview}
                                        alt={fileWithPreview.file.name}
                                        className="w-10 h-10 object-cover rounded"
                                    />
                                ) : (
                                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                                        <svg
                                            className="w-6 h-6 text-gray-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                            />
                                        </svg>
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                        {fileWithPreview.file.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatFileSize(
                                            fileWithPreview.file.size
                                        )}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile(index);
                                }}
                                className="ml-2 p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FileUpload;
