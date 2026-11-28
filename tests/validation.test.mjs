import test from "node:test";
import assert from "node:assert/strict";
import { isValidEmail, isValidPhoneNumber } from "../src/utils/validation.mjs";
import { getCookieDomains } from "../src/utils/cookie-consent.mjs";
import { buildGoogleMapsDirectionsUrl } from "../src/utils/maps.mjs";

test("email validation accepts normal store and customer addresses", () => {
  for (const value of ["test@example.com", "hello@gmail.com", "info.eshwarhomeproducts@gmail.com", "  person+shop@example.in  "]) {
    assert.equal(isValidEmail(value), true, value);
  }
});

test("email validation rejects malformed addresses", () => {
  for (const value of ["", "missing-at.example.com", "person@", "@example.com", "person@example", "person example@example.com"]) {
    assert.equal(isValidEmail(value), false, value);
  }
});

test("phone validation accepts Indian numbers with common formatting", () => {
  for (const value of ["9876543210", "+919876543210", "+91 98765 43210", "(987) 654-3210"]) {
    assert.equal(isValidPhoneNumber(value), true, value);
  }
});

test("phone validation rejects short, long, and non-numeric values", () => {
  for (const value of ["", "987654321", "12345678901234", "98765ABCDE", "+91-98765-abc10"]) {
    assert.equal(isValidPhoneNumber(value), false, value);
  }
});

test("cookie cleanup includes every parent domain for country-code domains", () => {
  const domains = getCookieDomains("www.example.co.in");
  assert.ok(domains.includes("www.example.co.in"));
  assert.ok(domains.includes(".www.example.co.in"));
  assert.ok(domains.includes("example.co.in"));
  assert.ok(domains.includes(".example.co.in"));
  assert.ok(domains.includes("co.in"));
  assert.ok(!domains.includes("in"));
});

test("Google Maps directions URL uses the exact store address", () => {
  const address = "119/1, Paddy Field Road, Chinnaiyan Colony, Perambur, Chennai, Tamil Nadu 600 011";
  const url = new URL(buildGoogleMapsDirectionsUrl(address));
  assert.equal(url.origin, "https://www.google.com");
  assert.equal(url.pathname, "/maps/dir/");
  assert.equal(url.searchParams.get("api"), "1");
  assert.equal(url.searchParams.get("destination"), address);
  assert.equal(buildGoogleMapsDirectionsUrl("  "), "");
  assert.equal(buildGoogleMapsDirectionsUrl(null), "");
});
