import {
  createCipheriv,
  createDecipheriv,
  pbkdf2Sync,
  randomBytes,
} from "crypto";

const ALGORITHM = "aes-256-gcm";
const PBKDF2_ITERATIONS = 600_000;
const KEY_LEN = 32;
const DIGEST = "sha256";

function deriveKey(password: string, salt: Buffer): Buffer {
  return pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LEN, DIGEST);
}

export function encryptMnemonic(
  mnemonic: string,
  password: string,
): { encryptedMnemonic: string; iv: string; salt: string } {
  const salt = randomBytes(32);
  const iv = randomBytes(16);
  const key = deriveKey(password, salt);

  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(mnemonic, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // Prepend authTag to ciphertext so we can extract it on decryption
  const combined = Buffer.concat([authTag, encrypted]);

  return {
    encryptedMnemonic: combined.toString("hex"),
    iv: iv.toString("hex"),
    salt: salt.toString("hex"),
  };
}

export function decryptMnemonic(
  encryptedMnemonic: string,
  iv: string,
  salt: string,
  password: string,
): string {
  const combined = Buffer.from(encryptedMnemonic, "hex");
  const authTag = combined.subarray(0, 16);
  const ciphertext = combined.subarray(16);

  const key = deriveKey(password, Buffer.from(salt, "hex"));
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(iv, "hex"));
  decipher.setAuthTag(authTag);

  return decipher.update(ciphertext) + decipher.final("utf8");
}
