export const AUTH_COOKIE_NAME = "scribo_token";
export const PASSWORD_MIN_LENGTH = 6;
export const BCRYPT_SALT_ROUNDS = 10;
export const JWT_EXPIRES_IN = "7d";
export const AUTH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export const isValidEmail = (value) => {
  if (typeof value !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
};

export const isValidPassword = (value) => {
  if (typeof value !== "string") return false;
  return value.trim().length >= PASSWORD_MIN_LENGTH;
};

export const normalizeEmail = (value) => value.trim().toLowerCase();

export const getCookieOptions = (isProduction) => ({
  httpOnly: true,
  secure: isProduction,
  path: "/",
  sameSite: isProduction ? "none" : "lax",
  maxAge: AUTH_COOKIE_MAX_AGE_MS,
});

export const getClearCookieOptions = (isProduction) => ({
  httpOnly: true,
  secure: isProduction,
  path: "/",
  sameSite: isProduction ? "none" : "lax",
});

export const parseCookies = (cookieHeader = "") =>
  cookieHeader.split(";").reduce((cookies, pair) => {
    const [rawKey, ...rawValue] = pair.split("=");
    const key = rawKey?.trim();

    if (!key) return cookies;

    cookies[key] = decodeURIComponent(rawValue.join("=").trim());
    return cookies;
  }, {});
