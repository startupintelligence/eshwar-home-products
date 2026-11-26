const configuredFacebookUrl = (import.meta.env.PUBLIC_FACEBOOK_URL ?? "").trim();

export const storeConfig = {
  name: "Eshwar Home Products",
  tamilName: "ஈஸ்வர் ஹோம் புராடக்ட்ஸ்",
  tagline: "Traditional rice, Siruthaniyam millets, cold-pressed oils & pantry essentials in Perambur, Chennai.",
  phoneDisplay: "+91 99412 09953",
  phoneHref: "tel:+919941209953",
  whatsappNumber: "919941209953",
  whatsappUrl: "https://wa.me/919941209953",
  email: "info.eshwarhomeproducts@gmail.com",
  emailHref: "mailto:info.eshwarhomeproducts@gmail.com",
  address: "119/1, Paddy Field Road, Chinnaiyan Colony, Perambur, Chennai, Tamil Nadu 600011",
  shortAddress: "119/1, Paddy Field Rd, Chinnaiyan Colony, Perambur, Chennai 600011",
  hours: "Mon–Sat: 9:00 AM – 9:00 PM · Sunday: Closed",
  shortHours: "Mon–Sat: 9:00 AM – 9:00 PM · Sun: Closed",
  mapsUrl:
    "https://www.google.com/maps/place/Eshwar+Home+Products/@13.1118547,80.2468127,17z/data=!3m1!4b1!4m6!3m5!1s0x3a526569af8122ad:0xe485caf4b8adf074!8m2!3d13.1118495!4d80.2493876!16s%2Fg%2F11v4j6lc03?entry=ttu&g_ep=EgoyMDI2MTExNS4wIKXMDSoASAFQAw%3D%3D",
  socials: {
    youtube: {
      label: "YouTube",
      handle: "@EHP_PeramburOfficial",
      url: "https://www.youtube.com/@EHP_PeramburOfficial",
    },
    instagram: {
      label: "Instagram",
      handle: "@eshwar_home_products",
      url: "https://www.instagram.com/eshwar_home_products/",
    },
    // Set PUBLIC_FACEBOOK_URL in .env or edit this string once an official Facebook page URL is ready.
    facebook: {
      label: "Facebook",
      handle: "",
      url: configuredFacebookUrl,
    },
  },
} as const;

export function buildWhatsAppUrl(
  message = "Hello Eshwar Home Products, I would like to enquire about products.",
) {
  return `${storeConfig.whatsappUrl}?text=${encodeURIComponent(message)}`;
}
