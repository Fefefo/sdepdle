import { randomBytes, createCipheriv, createDecipheriv } from "crypto";

import { SECRET_KEY } from "$env/static/private";

// 📦 Codifica e decodifica base64
const toBase64 = (buffer: Buffer) => buffer.toString("base64");
const fromBase64 = (str: string) => Buffer.from(str, "base64");

// 🔐 Cifra con AES-256-GCM
export function EncryptAES(plaintext: string): { ciphertextBase64: string; authTag: string } {
  const iv = randomBytes(12); // IV per GCM: 12 byte
  const cipher = createCipheriv("aes-256-gcm", SECRET_KEY, iv);

  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);

  const authTag = cipher.getAuthTag();

  const combined = Buffer.concat([iv, encrypted, authTag]);

  return {
    ciphertextBase64: toBase64(combined),
    authTag: toBase64(authTag)
  };
}

// 🔓 Decifra
export function DecryptAES(ciphertextBase64: string): string {
  const combined = fromBase64(ciphertextBase64);

  const iv = combined.subarray(0, 12);
  const authTag = combined.subarray(combined.length - 16);
  const ciphertext = combined.subarray(12, combined.length - 16);

  const decipher = createDecipheriv("aes-256-gcm", SECRET_KEY, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

  return decrypted.toString("utf8");
}
