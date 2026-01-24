const { createSecretSchema, getSecretSchema } = require('../../../src/validators/secretValidator');

describe('Secret Validators', () => {
    describe('createSecretSchema', () => {
        describe('Valid inputs', () => {
            test('should validate minimal secret creation', () => {
                const validData = {
                    content: 'This is a secret message'
                };

                const result = createSecretSchema.body.safeParse(validData);
                expect(result.success).toBe(true);
                expect(result.data.content).toBe('This is a secret message');
                expect(result.data.is_client_encrypted).toBe(false); // default value
            });

            test('should validate secret with password', () => {
                const validData = {
                    content: 'Secret content',
                    password: 'mypassword123'
                };

                const result = createSecretSchema.body.safeParse(validData);
                expect(result.success).toBe(true);
                expect(result.data.password).toBe('mypassword123');
            });

            test('should validate secret with client encryption flag', () => {
                const validData = {
                    content: 'Encrypted content',
                    is_client_encrypted: true
                };

                const result = createSecretSchema.body.safeParse(validData);
                expect(result.success).toBe(true);
                expect(result.data.is_client_encrypted).toBe(true);
            });

            test('should validate secret with files', () => {
                const validData = {
                    content: 'Secret with files',
                    files: [
                        {
                            url: 'https://example.com/file1.pdf',
                            originalName: 'document.pdf',
                            mimeType: 'application/pdf',
                            filename: 'doc_123456.pdf'
                        }
                    ]
                };

                const result = createSecretSchema.body.safeParse(validData);
                expect(result.success).toBe(true);
                expect(result.data.files).toHaveLength(1);
                expect(result.data.files[0].originalName).toBe('document.pdf');
            });

            test('should validate secret with multiple files', () => {
                const validData = {
                    content: 'Secret with multiple files',
                    files: [
                        {
                            url: 'https://example.com/file1.pdf',
                            originalName: 'doc1.pdf',
                            mimeType: 'application/pdf',
                            filename: 'doc1_123.pdf'
                        },
                        {
                            url: 'https://example.com/file2.jpg',
                            originalName: 'image.jpg',
                            mimeType: 'image/jpeg',
                            filename: 'img_456.jpg'
                        }
                    ]
                };

                const result = createSecretSchema.body.safeParse(validData);
                expect(result.success).toBe(true);
                expect(result.data.files).toHaveLength(2);
            });

            test('should validate complete secret with all fields', () => {
                const validData = {
                    content: 'Complete secret',
                    password: 'securepass',
                    is_client_encrypted: true,
                    files: [
                        {
                            url: 'https://cloudinary.com/file.pdf',
                            originalName: 'test.pdf',
                            mimeType: 'application/pdf',
                            filename: 'test_123.pdf'
                        }
                    ]
                };

                const result = createSecretSchema.body.safeParse(validData);
                expect(result.success).toBe(true);
            });
        });

        describe('Invalid inputs', () => {
            test('should reject empty content', () => {
                const data = {
                    content: ''
                };

                const result = createSecretSchema.body.safeParse(data);
                expect(result.success).toBe(false);
                expect(result.error.errors[0].message).toContain('Content is required');
            });

            test('should reject missing content', () => {
                const data = {
                    password: 'test123'
                };

                const result = createSecretSchema.body.safeParse(data);
                expect(result.success).toBe(false);
            });

            test('should reject invalid file URL', () => {
                const data = {
                    content: 'Secret',
                    files: [
                        {
                            url: 'not-a-url',
                            originalName: 'file.pdf',
                            mimeType: 'application/pdf',
                            filename: 'file123.pdf'
                        }
                    ]
                };

                const result = createSecretSchema.body.safeParse(data);
                expect(result.success).toBe(false);
                expect(result.error.errors[0].message).toContain('Invalid URL format');
            });

            test('should reject file with missing originalName', () => {
                const data = {
                    content: 'Secret',
                    files: [
                        {
                            url: 'https://example.com/file.pdf',
                            originalName: '',
                            mimeType: 'application/pdf',
                            filename: 'file123.pdf'
                        }
                    ]
                };

                const result = createSecretSchema.body.safeParse(data);
                expect(result.success).toBe(false);
                expect(result.error.errors[0].message).toContain('Original name is required');
            });

            test('should reject file with missing mimeType', () => {
                const data = {
                    content: 'Secret',
                    files: [
                        {
                            url: 'https://example.com/file.pdf',
                            originalName: 'file.pdf',
                            mimeType: '',
                            filename: 'file123.pdf'
                        }
                    ]
                };

                const result = createSecretSchema.body.safeParse(data);
                expect(result.success).toBe(false);
                expect(result.error.errors[0].message).toContain('MIME type is required');
            });

            test('should reject file with missing filename', () => {
                const data = {
                    content: 'Secret',
                    files: [
                        {
                            url: 'https://example.com/file.pdf',
                            originalName: 'file.pdf',
                            mimeType: 'application/pdf',
                            filename: ''
                        }
                    ]
                };

                const result = createSecretSchema.body.safeParse(data);
                expect(result.success).toBe(false);
                expect(result.error.errors[0].message).toContain('Filename is required');
            });

            test('should reject extra fields in strict mode', () => {
                const data = {
                    content: 'Secret',
                    extraField: 'should not be here'
                };

                const result = createSecretSchema.body.safeParse(data);
                expect(result.success).toBe(false);
            });

            test('should reject non-boolean is_client_encrypted', () => {
                const data = {
                    content: 'Secret',
                    is_client_encrypted: 'yes'
                };

                const result = createSecretSchema.body.safeParse(data);
                expect(result.success).toBe(false);
            });
        });
    });

    describe('getSecretSchema', () => {
        describe('Valid inputs - params', () => {
            test('should validate valid UUID in params', () => {
                const validData = {
                    id: '123e4567-e89b-12d3-a456-426614174000'
                };

                const result = getSecretSchema.params.safeParse(validData);
                expect(result.success).toBe(true);
                expect(result.data.id).toBe('123e4567-e89b-12d3-a456-426614174000');
            });

            test('should validate different valid UUID formats', () => {
                const validUUIDs = [
                    '550e8400-e29b-41d4-a716-446655440000',
                    'c73bcdcc-2669-4bf6-81d3-e4ae73fb11fd',
                    '00000000-0000-0000-0000-000000000000'
                ];

                validUUIDs.forEach(uuid => {
                    const result = getSecretSchema.params.safeParse({ id: uuid });
                    expect(result.success).toBe(true);
                });
            });
        });

        describe('Invalid inputs - params', () => {
            test('should reject invalid UUID format', () => {
                const invalidUUIDs = [
                    'not-a-uuid',
                    '123456',
                    'abc-def-ghi',
                    '123e4567-e89b-12d3-a456', // incomplete
                    '123e4567-e89b-12d3-a456-426614174000-extra' // too long
                ];

                invalidUUIDs.forEach(uuid => {
                    const result = getSecretSchema.params.safeParse({ id: uuid });
                    expect(result.success).toBe(false);
                    expect(result.error.errors[0].message).toContain('Invalid secret ID format');
                });
            });

            test('should reject missing id', () => {
                const result = getSecretSchema.params.safeParse({});
                expect(result.success).toBe(false);
            });

            test('should reject extra fields in params', () => {
                const data = {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    extraField: 'not allowed'
                };

                const result = getSecretSchema.params.safeParse(data);
                expect(result.success).toBe(false);
            });
        });

        describe('Valid inputs - body', () => {
            test('should validate body without password', () => {
                const result = getSecretSchema.body.safeParse({});
                expect(result.success).toBe(true);
            });

            test('should validate body with password', () => {
                const validData = {
                    password: 'mypassword123'
                };

                const result = getSecretSchema.body.safeParse(validData);
                expect(result.success).toBe(true);
                expect(result.data.password).toBe('mypassword123');
            });

            test('should validate body with empty password string', () => {
                const validData = {
                    password: ''
                };

                const result = getSecretSchema.body.safeParse(validData);
                expect(result.success).toBe(true);
            });
        });

        describe('Invalid inputs - body', () => {
            test('should reject extra fields in body', () => {
                const data = {
                    password: 'test',
                    extraField: 'not allowed'
                };

                const result = getSecretSchema.body.safeParse(data);
                expect(result.success).toBe(false);
            });

            test('should reject non-string password', () => {
                const data = {
                    password: 12345
                };

                const result = getSecretSchema.body.safeParse(data);
                expect(result.success).toBe(false);
            });
        });
    });

    describe('Real-world scenarios', () => {
        test('should validate secret with long content', () => {
            const longContent = 'a'.repeat(10000);
            const data = {
                content: longContent
            };

            const result = createSecretSchema.body.safeParse(data);
            expect(result.success).toBe(true);
        });

        test('should validate secret with special characters', () => {
            const data = {
                content: 'Secret with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
                password: 'P@ssw0rd!'
            };

            const result = createSecretSchema.body.safeParse(data);
            expect(result.success).toBe(true);
        });

        test('should validate secret with unicode content', () => {
            const data = {
                content: '秘密メッセージ 🔒 密码信息'
            };

            const result = createSecretSchema.body.safeParse(data);
            expect(result.success).toBe(true);
        });

        test('should validate file with various MIME types', () => {
            const mimeTypes = [
                'application/pdf',
                'image/jpeg',
                'image/png',
                'text/plain',
                'application/zip',
                'video/mp4'
            ];

            mimeTypes.forEach(mimeType => {
                const data = {
                    content: 'Secret',
                    files: [
                        {
                            url: 'https://example.com/file',
                            originalName: 'file',
                            mimeType,
                            filename: 'file123'
                        }
                    ]
                };

                const result = createSecretSchema.body.safeParse(data);
                expect(result.success).toBe(true);
            });
        });

        test('should validate UUID from real secret creation', () => {
            const realUUID = '550e8400-e29b-41d4-a716-446655440000';
            
            const result = getSecretSchema.params.safeParse({ id: realUUID });
            expect(result.success).toBe(true);
        });
    });
});
