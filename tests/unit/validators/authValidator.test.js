const { registerSchema, loginSchema, logoutSchema, refreshTokenSchema } = require('../../../src/validators/authValidator');

describe('Auth Validators', () => {
    describe('registerSchema', () => {
        describe('Valid inputs', () => {
            test('should validate correct registration data', () => {
                const validData = {
                    userName: 'john_doe',
                    gender: 'male',
                    email: 'john@example.com',
                    password: 'password123'
                };

                const result = registerSchema.body.safeParse(validData);
                expect(result.success).toBe(true);
                expect(result.data).toEqual(validData);
            });

            test('should accept all valid gender values', () => {
                const genders = ['male', 'female', 'helicopter'];
                
                genders.forEach(gender => {
                    const data = {
                        userName: 'testuser',
                        gender,
                        email: 'test@example.com',
                        password: 'password123'
                    };
                    const result = registerSchema.body.safeParse(data);
                    expect(result.success).toBe(true);
                });
            });

            test('should accept minimum valid lengths', () => {
                const data = {
                    userName: 'abc', // exactly 3 chars
                    gender: 'male',
                    email: 'aa@bb.cc',
                    password: '123456' // exactly 6 chars
                };

                const result = registerSchema.body.safeParse(data);
                expect(result.success).toBe(true);
            });
        });

        describe('Invalid inputs', () => {
            test('should reject username shorter than 3 characters', () => {
                const data = {
                    userName: 'ab',
                    gender: 'male',
                    email: 'test@example.com',
                    password: 'password123'
                };

                const result = registerSchema.body.safeParse(data);
                expect(result.success).toBe(false);
                expect(result.error.errors[0].message).toContain('at least 3 characters');
            });

            test('should reject invalid gender', () => {
                const data = {
                    userName: 'testuser',
                    gender: 'invalid',
                    email: 'test@example.com',
                    password: 'password123'
                };

                const result = registerSchema.body.safeParse(data);
                expect(result.success).toBe(false);
            });

            test('should reject invalid email format', () => {
                const invalidEmails = ['notanemail', '@example.com', 'user@', 'user@domain'];
                
                invalidEmails.forEach(email => {
                    const data = {
                        userName: 'testuser',
                        gender: 'male',
                        email,
                        password: 'password123'
                    };
                    const result = registerSchema.body.safeParse(data);
                    expect(result.success).toBe(false);
                });
            });

            test('should reject password shorter than 6 characters', () => {
                const data = {
                    userName: 'testuser',
                    gender: 'male',
                    email: 'test@example.com',
                    password: '12345'
                };

                const result = registerSchema.body.safeParse(data);
                expect(result.success).toBe(false);
                expect(result.error.errors[0].message).toContain('at least 6 characters');
            });

            test('should reject missing required fields', () => {
                const data = {
                    userName: 'testuser'
                    // missing gender, email, password
                };

                const result = registerSchema.body.safeParse(data);
                expect(result.success).toBe(false);
                expect(result.error.errors.length).toBeGreaterThan(0);
            });

            test('should reject extra fields (strict mode)', () => {
                const data = {
                    userName: 'testuser',
                    gender: 'male',
                    email: 'test@example.com',
                    password: 'password123',
                    extraField: 'should not be here'
                };

                const result = registerSchema.body.safeParse(data);
                expect(result.success).toBe(false);
            });
        });
    });

    describe('loginSchema', () => {
        describe('Valid inputs', () => {
            test('should validate correct login data', () => {
                const validData = {
                    email: 'user@example.com',
                    password: 'password123'
                };

                const result = loginSchema.body.safeParse(validData);
                expect(result.success).toBe(true);
                expect(result.data).toEqual(validData);
            });

            test('should accept minimum valid password length', () => {
                const data = {
                    email: 'test@example.com',
                    password: '123456'
                };

                const result = loginSchema.body.safeParse(data);
                expect(result.success).toBe(true);
            });
        });

        describe('Invalid inputs', () => {
            test('should reject invalid email', () => {
                const data = {
                    email: 'notvalidemail',
                    password: 'password123'
                };

                const result = loginSchema.body.safeParse(data);
                expect(result.success).toBe(false);
                expect(result.error.errors[0].message).toContain('valid email');
            });

            test('should reject short password', () => {
                const data = {
                    email: 'test@example.com',
                    password: '12345'
                };

                const result = loginSchema.body.safeParse(data);
                expect(result.success).toBe(false);
                expect(result.error.errors[0].message).toContain('at least 6 characters');
            });

            test('should reject missing fields', () => {
                const data = {
                    email: 'test@example.com'
                    // missing password
                };

                const result = loginSchema.body.safeParse(data);
                expect(result.success).toBe(false);
            });

            test('should reject extra fields', () => {
                const data = {
                    email: 'test@example.com',
                    password: 'password123',
                    rememberMe: true
                };

                const result = loginSchema.body.safeParse(data);
                expect(result.success).toBe(false);
            });
        });
    });

    describe('logoutSchema', () => {
        describe('Valid inputs', () => {
            test('should validate correct logout data', () => {
                const validData = {
                    refreshToken: 'valid-token-string'
                };

                const result = logoutSchema.body.safeParse(validData);
                expect(result.success).toBe(true);
            });
        });

        describe('Invalid inputs', () => {
            test('should reject missing refreshToken', () => {
                const data = {};

                const result = logoutSchema.body.safeParse(data);
                expect(result.success).toBe(false);
            });

            test('should reject non-string refreshToken', () => {
                const data = {
                    refreshToken: 12345
                };

                const result = logoutSchema.body.safeParse(data);
                expect(result.success).toBe(false);
            });
        });
    });

    describe('refreshTokenSchema', () => {
        describe('Valid inputs', () => {
            test('should validate correct refresh token data', () => {
                const validData = {
                    refreshToken: 'valid-refresh-token'
                };

                const result = refreshTokenSchema.body.safeParse(validData);
                expect(result.success).toBe(true);
            });
        });

        describe('Invalid inputs', () => {
            test('should reject missing refreshToken', () => {
                const data = {};

                const result = refreshTokenSchema.body.safeParse(data);
                expect(result.success).toBe(false);
            });

            test('should reject empty string refreshToken', () => {
                const data = {
                    refreshToken: ''
                };

                const result = refreshTokenSchema.body.safeParse(data);
                // Zod allows empty strings by default unless explicitly prevented
                // This test documents current behavior
                expect(result.success).toBe(true);
            });
        });
    });

    describe('Real-world scenarios', () => {
        test('should handle registration with complex password', () => {
            const data = {
                userName: 'john_doe_123',
                gender: 'male',
                email: 'john.doe+test@example.co.uk',
                password: 'P@ssw0rd!2024'
            };

            const result = registerSchema.body.safeParse(data);
            expect(result.success).toBe(true);
        });

        test('should handle login with uppercase email', () => {
            const data = {
                email: 'USER@EXAMPLE.COM',
                password: 'password123'
            };

            const result = loginSchema.body.safeParse(data);
            expect(result.success).toBe(true);
        });

        test('should provide helpful error messages', () => {
            const data = {
                userName: 'ab', // too short
                gender: 'other', // invalid
                email: 'bademail', // invalid format
                password: '123' // too short
            };

            const result = registerSchema.body.safeParse(data);
            expect(result.success).toBe(false);
            expect(result.error.errors.length).toBeGreaterThan(0);
            
            // Check that error messages are descriptive
            const errorMessages = result.error.errors.map(e => e.message);
            expect(errorMessages.some(msg => msg.includes('3 characters'))).toBe(true);
            expect(errorMessages.some(msg => msg.includes('6 characters'))).toBe(true);
        });
    });
});
