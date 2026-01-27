const { encryptText, decryptText } = require('../../../src/utils/encryption');
require('dotenv').config();

describe('Encryption Utils', () => {

    test('should encrypt and decrypt text correctly', () => {
        const originalText = 'Hello everyone! This is a test message.';
        const { encryptedContent, iv } = encryptText(originalText);

        expect(encryptedContent).toBeDefined();
        expect(iv).toBeDefined();

        const decrypted = decryptText(encryptedContent, iv);
        expect(decrypted).toBe(originalText);
    });

    test('should encrypt and decrypt text correctly', () => {
        const originalText = '1245';
        const { encryptedContent, iv } = encryptText(originalText);

        expect(encryptedContent).toBeDefined();
        expect(iv).toBeDefined();

        const decrypted = decryptText(encryptedContent, iv);
        expect(decrypted).toBe(originalText);
    });

    test('should encrypt and decrypt text correctly', () => {
        const originalText = 'dsbcdhsbc';
        const { encryptedContent, iv } = encryptText(originalText);

        expect(encryptedContent).toBeDefined();
        expect(iv).toBeDefined();

        const decrypted = decryptText(encryptedContent, iv);
        expect(decrypted).toBe(originalText);
    });

    test('should return empty or invalid text when decrypting with wrong iv', () => {
        const originalText = 'dsbcdhsbc';
        const { encryptedContent, iv } = encryptText(originalText);
        const wrongIv = '00000000000000000000000000000000'; 

        const decrypted = decryptText(encryptedContent, wrongIv);
        
        // With wrong IV, decryption should produce invalid result
        // (empty string or garbage data, but not the original text)
        expect(decrypted).not.toBe(originalText);
        expect(typeof decrypted).toBe('string');
    });
});
