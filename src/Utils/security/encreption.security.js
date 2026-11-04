// 🔑 Use 32 bytes (256 bits) for AES-256
const ENCRYPTION_KEY = `7f3a9c2e81d64b05f2a7e93c4d8b1a60e5f9472c3a1d8e6b9f0c5a27d4e8136b` // You should store this securely (e.g., env variable)
const IV_LENGTH = 16; // For AES, the IV is always 16 bytes

// 0123456789012345fgfcbc 0123456789012345 0123456789012345 0123456789012345 
// 5670123456789012
// amira - amira29383746jdugyugtd7
export function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);  

    let encrypted = cipher.update(text, 'utf8', 'hex');

    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
}  // 29383746jdugyugtd7:mcbudcuiefyey8iyiyueiyh



// Decrypt function
export function decrypt(text) {

    const [ivHex, encryptedText] = text.split(':');
    
    const iv = Buffer.from(ivHex, 'hex');    

    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY , iv);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');

    decrypted += decipher.final('utf8');

    return decrypted;
}
