const enc = new TextEncoder();
const dec = new TextDecoder();

const PBKDF2_ITERATIONS = 100_000;
const KEY_LEN = 256;

const toB64 = (buf: ArrayBuffer | Uint8Array) => {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let str = "";
  bytes.forEach((b) => (str += String.fromCharCode(b)));
  return btoa(str);
};

const fromB64 = (b64: string) => {
  const str = atob(b64);
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i);
  return bytes;
};

async function deriveKey(passcode: string, salt: Uint8Array): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(passcode),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: KEY_LEN },
    false,
    ["encrypt", "decrypt"],
  );
}

export interface EncryptedPayload {
  ciphertext: string; // base64
  iv: string; // base64
  salt: string; // base64
}

export async function encryptText(plaintext: string, passcode: string): Promise<EncryptedPayload> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passcode, salt);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    enc.encode(plaintext),
  );
  return { ciphertext: toB64(ciphertext), iv: toB64(iv), salt: toB64(salt) };
}

export async function decryptText(payload: EncryptedPayload, passcode: string): Promise<string> {
  const salt = fromB64(payload.salt);
  const iv = fromB64(payload.iv);
  const key = await deriveKey(passcode, salt);
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    fromB64(payload.ciphertext) as BufferSource,
  );
  return dec.decode(plaintext);
}

export async function hashPasscode(passcode: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(passcode));
  return toB64(buf);
}
