/**
 * Ghost Protocol — Client-Side E2E Encryption
 *
 * Strategy:
 *  - Each room uses a symmetric AES-GCM-256 key derived from the room's invite code
 *    via PBKDF2 (100,000 iterations, SHA-256).
 *  - The invite code acts as a shared secret: only users who know the code can derive
 *    the key and decrypt messages.
 *  - The server stores only ciphertext (base64) — it can never read messages.
 *
 * Format stored in DB (encrypted_content column):
 *   "<base64(iv)>.<base64(ciphertext)>"
 */

const PBKDF2_ITERATIONS = 100_000;
const KEY_LENGTH = 256;
const SALT = new TextEncoder().encode("GhostProtocol_v3_Salt_2026");

/** In-memory cache: inviteCode → CryptoKey */
const keyCache = new Map<string, CryptoKey>();

/** Derive AES-GCM key from invite code */
export async function deriveRoomKey(inviteCode: string): Promise<CryptoKey> {
  const cached = keyCache.get(inviteCode);
  if (cached) return cached;

  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(inviteCode.toUpperCase()),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: SALT,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );

  keyCache.set(inviteCode, key);
  return key;
}

/** Encrypt a plaintext string → "<iv_b64>.<ct_b64>" */
export async function encryptMessage(plaintext: string, inviteCode: string): Promise<string> {
  const key = await deriveRoomKey(inviteCode);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plaintext)
  );
  const ivB64 = btoa(String.fromCharCode(...iv));
  const ctB64 = btoa(String.fromCharCode(...new Uint8Array(ciphertext)));
  return `${ivB64}.${ctB64}`;
}

/** Decrypt "<iv_b64>.<ct_b64>" → plaintext string, or null on failure */
export async function decryptMessage(encrypted: string, inviteCode: string): Promise<string | null> {
  try {
    const [ivB64, ctB64] = encrypted.split(".");
    if (!ivB64 || !ctB64) return null;

    const iv = Uint8Array.from(atob(ivB64), (c) => c.charCodeAt(0));
    const ct = Uint8Array.from(atob(ctB64), (c) => c.charCodeAt(0));

    const key = await deriveRoomKey(inviteCode);
    const plainBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ct
    );
    return new TextDecoder().decode(plainBuffer);
  } catch {
    return null;
  }
}

/** Check if a string looks like our encrypted format */
export function isEncrypted(value: string): boolean {
  return /^[A-Za-z0-9+/=]+\.[A-Za-z0-9+/=]+$/.test(value);
}
