import crypto from "crypto";

const ENCRYPTION_ALGORITHM = "aes-256-gcm";

const getEncryptionKey = () => {
  const secret = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY;

  if (typeof secret !== "string" || secret.trim().length < 32) {
    throw new Error(
      "GOOGLE_TOKEN_ENCRYPTION_KEY must be set to a strong secret for Google Calendar token encryption.",
    );
  }

  return crypto.createHash("sha256").update(secret).digest();
};

export const encryptSecret = (value) => {
  if (typeof value !== "string" || value.length === 0) {
    return "";
  }

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [iv.toString("hex"), authTag.toString("hex"), encrypted.toString("hex")].join(":");
};

export const decryptSecret = (payload) => {
  if (typeof payload !== "string" || payload.length === 0) {
    return "";
  }

  const [ivHex, authTagHex, encryptedHex] = payload.split(":");

  if (!ivHex || !authTagHex || !encryptedHex) {
    throw new Error("Encrypted token payload is malformed.");
  }

  const decipher = crypto.createDecipheriv(
    ENCRYPTION_ALGORITHM,
    getEncryptionKey(),
    Buffer.from(ivHex, "hex"),
  );
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
};
