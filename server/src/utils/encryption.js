var CryptoJS = require("crypto-js");
const config = require('../config/config');

/**
 * @desc  Encrypt plain text using AES encryption
 * @param {string} text - plain text to encrypt
 * @returns {{ encryptedContent: string, iv: string }} - encrypted content and initialization vector
 */
function encryptText(text) {
    const iv = CryptoJS.lib.WordArray.random(16);
    const key = CryptoJS.SHA256(config.encryption.secretKey || 'emancomchua');
    const encrypted = CryptoJS.AES.encrypt(
        CryptoJS.enc.Utf8.parse(text),
        key,
        {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        }
    );

    return {
        encryptedContent: encrypted.ciphertext.toString(CryptoJS.enc.Base64),
        iv: iv.toString(CryptoJS.enc.Hex)
    };
}

/**
 * @desc Decrypt cipher text using AES decryption
 * @param {string} cipherTextBase64 - base64 encoded cipher text
 * @param {string} iv - initialization vector in hex format
 * @returns {string} - decrypted plain text
 */
function decryptText(cipherTextBase64, iv) {
    const cipherText = CryptoJS.enc.Base64.parse(cipherTextBase64);
    const ivHex = CryptoJS.enc.Hex.parse(iv);
    const key = CryptoJS.SHA256(config.encryption.secretKey || 'emancomchua');

    const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: cipherText },
        key,
        {
            iv: ivHex,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        }
    );
    return decrypted.toString(CryptoJS.enc.Utf8);
}

module.exports = {
    encryptText,
    decryptText
};