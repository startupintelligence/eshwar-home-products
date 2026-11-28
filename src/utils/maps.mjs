/**
 * Build a Google Maps directions URL for a store address.
 * @param {string} address
 * @returns {string}
 */
export function buildGoogleMapsDirectionsUrl(address) {
  const destination = typeof address === "string" ? address.trim() : "";
  if (!destination) return "";
  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.set("api", "1");
  url.searchParams.set("destination", destination);
  return url.toString();
}
