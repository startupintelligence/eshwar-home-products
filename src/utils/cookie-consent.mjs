/** @param {string} hostname */
export function getCookieDomains(hostname) {
  const normalized = hostname.trim().toLowerCase().replace(/^\.+|\.+$/g, "");
  const labels = normalized.split(".").filter(Boolean);
  const domains = new Set([normalized, `.${normalized}`]);
  for (let index = 1; index < labels.length - 1; index += 1) {
    const parentDomain = labels.slice(index).join(".");
    domains.add(parentDomain);
    domains.add(`.${parentDomain}`);
  }
  return [...domains];
}
