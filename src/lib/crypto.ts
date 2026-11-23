import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

/** AES-256-GCM key derived from AUTH_SECRET, so secrets stored in MongoDB are never in plain text. */
function key() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set. Add it to .env.local");
  return createHash("sha256").update(`wedtheme-mail:${secret}`).digest();
}

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, enc].map((b) => b.toString("base64")).join(".");
}

export function decryptSecret(payload?: string | null): string {
  if (!payload) return "";
  try {
    const [iv, tag, enc] = payload.split(".").map((p) => Buffer.from(p, "base64"));
    const decipher = createDecipheriv("aes-256-gcm", key(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
  } catch {
    // AUTH_SECRET changed or data is corrupt: treat as "no password saved".
    return "";
  }
}
