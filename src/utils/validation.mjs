/** @param {string} value */
export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

/** @param {string} value */
export function isValidPhoneNumber(value) {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");
  return /^[+\d\s()-]+$/.test(trimmed) && digits.length >= 10 && digits.length <= 13;
}
