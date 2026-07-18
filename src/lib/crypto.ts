import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

// Encryption key from environment variable (set in .env.local and Vercel)
// Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
function getKey(): Buffer {
  const keyHex = process.env.ENCRYPTION_KEY;
  if (!keyHex) {
    // Fallback for development — NEVER use in production
    if (process.env.NODE_ENV === "production") {
      throw new Error("ENCRYPTION_KEY environment variable is required in production");
    }
    return crypto.scryptSync("dev-fallback-key-do-not-use-in-prod", "salt", 32);
  }
  return Buffer.from(keyHex, "hex");
}

export function encrypt(text: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Format: iv:tag:encrypted (all hex-encoded)
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decrypt(encrypted: string): string {
  const key = getKey();
  const [ivHex, tagHex, encryptedHex] = encrypted.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
