const { encryptText, decryptText } = require('../../utils/encryption');
require('dotenv').config();

describe('Encryption Utils', () => {

    test('should encrypt and decrypt text correctly', () => {
        const originalText = 'Hello everyone! This is a test message.';
        const { encryptedContent, iv } = encryptText(originalText);

        expect(encryptedContent).toBeDefined();
        expect(iv).toBeDefined();

        console.log('Encrypted content:', encryptedContent);
        console.log('IV:', iv);

        const decrypted = decryptText(encryptedContent, iv);
        console.log('Decrypted text:', decrypted);
        expect(decrypted).toBe(originalText);
    });

    test('should encrypt and decrypt text correctly', () => {
        const originalText = '1245';
        const { encryptedContent, iv } = encryptText(originalText);

        expect(encryptedContent).toBeDefined();
        expect(iv).toBeDefined();

        console.log('Encrypted content:', encryptedContent);
        console.log('IV:', iv);

        const decrypted = decryptText(encryptedContent, iv);
        console.log('Decrypted text:', decrypted);
        expect(decrypted).toBe(originalText);
    });

    test('should encrypt and decrypt text correctly', () => {
        const originalText = 'dsbcdhsbc';
        const { encryptedContent, iv } = encryptText(originalText);

        expect(encryptedContent).toBeDefined();
        expect(iv).toBeDefined();

        console.log('Encrypted content:', encryptedContent);
        console.log('IV:', iv);

        const decrypted = decryptText(encryptedContent, iv);
        console.log('Decrypted text:', decrypted);
        expect(decrypted).toBe(originalText);
    });

    test('should not return original text with wrong iv', () => {
        const originalText = 'dsbcdhsbc';
        const { encryptedContent, iv } = encryptText(originalText);
        console.log('Encrypted content:', encryptedContent);
        console.log('IV:', iv);
        const wrongIv = '00000000000000000000000000000000'; 

        const decrypted = decryptText(encryptedContent, wrongIv);
        console.log('Decrypted with wrong IV:', decrypted);
        expect(decrypted).not.toBe(originalText);
    });
});
