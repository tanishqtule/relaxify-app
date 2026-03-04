import CryptoJS from 'crypto-js';

// An additional static salt for added security, on top of the dynamic user key
const STATIC_SALT = "Relaxify_E2E_Encr_Salt_v1";

/**
 * Generates an encryption key specific to the user.
 */
const deriveKey = (uid: string) => `${uid}_${STATIC_SALT}`;

/**
 * Encrypts an object payload to an AES ciphertext string.
 */
export const encryptData = <T>(payload: T, uid: string): string => {
    try {
        const jsonStr = JSON.stringify(payload);
        const key = deriveKey(uid);
        return CryptoJS.AES.encrypt(jsonStr, key).toString();
    } catch (error) {
        console.error("Encryption failed", error);
        // Fallback to storing as stringified json if encryption critically fails,
        // though this shouldn't happen unless somehow the crypto-js module is missing.
        return JSON.stringify(payload);
    }
};

/**
 * Decrypts an AES ciphertext string back into the object payload.
 */
export const decryptData = <T>(ciphertext: string, uid: string, fallback: T): T => {
    if (!ciphertext) return fallback;
    try {
        // If it's pure JSON (fallback), try parsing it first
        if (ciphertext.startsWith('{') || ciphertext.startsWith('[')) {
            return JSON.parse(ciphertext) as T;
        }

        const key = deriveKey(uid);
        const bytes = CryptoJS.AES.decrypt(ciphertext, key);
        const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);

        if (!decryptedStr) throw new Error("Decryption resulted in empty string (wrong key?)");

        return JSON.parse(decryptedStr) as T;
    } catch (error) {
        console.error("Decryption failed, using fallback.", error);
        return fallback;
    }
};
