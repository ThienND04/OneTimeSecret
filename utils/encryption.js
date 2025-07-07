var CryptoJS = require("crypto-js");


function encryptText(text) {
    console.log('Encrypting text:', text);
    const iv = CryptoJS.lib.WordArray.random(16);
    const key = CryptoJS.SHA256(process.env.SECRET_KEY || 'emancomchua');
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

function decryptText(cipherTextBase64, iv) {
    const cipherText = CryptoJS.enc.Base64.parse(cipherTextBase64);
    const ivHex = CryptoJS.enc.Hex.parse(iv);
    const key = CryptoJS.SHA256(process.env.SECRET_KEY || 'emancomchua');

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