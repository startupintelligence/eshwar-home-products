# Eshwar Home Products

A static, editorial website for **Eshwar Home Products** in Perambur, Chennai (`119/1, Paddy Field Rd, Chinnaiyan Colony, Perambur, Chennai 600011`). The public website serves as a curated neighbourhood pantry guide and store information portal (not an online e-commerce checkout).

## Stack

- **Astro 5** static site generation with Astro image optimization (`astro:assets` / `getImage` generating WebP srcsets)
- **Consolidated CSS** in `src/styles/brand-system.css` and `src/styles/mobile-responsive.css` (with page-scoped styles in Astro pages)
- **React 19 islands** (`@astrojs/react`) for the Firestore-backed live catalogue (`PublishedCatalogue`), interactive Google Maps view (`StoreLocationMap`), and client admin portal
- **Firebase Authentication & Cloud Firestore** for authorised client product publishing

## Routes

- `/` — Home (hero, category strip, featured & filterable pantry collection, store story & community reviews, FAQs, and interactive map)
- `/products/` — The Pantry (full shelf guide, live client-published catalogue, and pantry search/filter)
- `/about/` — Our Story
- `/perambur-millet-store/` — Perambur Millet Store & Tamil–English Siruthaniyam reference table
- `/kitchen-guides/` & `/blog/` — Kitchen guides and practical Tamil cooking notes
- `/contact/` — Store contact details, directions, interactive store map, and official social channels
- `/admin/` — Client product workspace (not indexed)

## Store Configuration & Contacts

Verified store details, WhatsApp helpers, and social media URLs are centralized in `src/data/store.ts`.

- **Email**, **WhatsApp**, and **Call Store** actions across pages, header/footer, and the floating `Contact` button read from `src/data/store.ts`.
- To add or update the store's Facebook page URL, set `PUBLIC_FACEBOOK_URL` in your environment (`.env`) or update `configuredFacebookUrl` in `src/data/store.ts`.

## Local Development & Verification

```bash
npm ci
npm run dev
```

Run checks and production build:

```bash
npm run check
npm run test:rules
npm run build
npm run preview
```

The Firestore rules suite uses the local emulator to test public reads, editor permissions, and immutable audit history.

## Product Content & Asset Optimization

- High-resolution product and pantry assets imported in `.astro` files live in `src/assets/images/` and are processed via `getImage()` into sized WebP assets (`120x120` category thumbnails, `400w` / `800w` product cards).
- Optimized brand emblems and PWA/favicon icons live in `public/images/brand/` (`96px` and `400px` WebP) and `public/icons/` / `public/favicon/` (`32px`, `180px`, `512px` PNG).
- Static category fallback visuals in `public/images/placeholders/` remain lightweight WebP files aligned with `src/data/catalogue.json`. Always keep a `4:3` aspect ratio and do not invent prices, stock guarantees, or medical/health claims.

## Environment & Deployment

Configure client environment variables via `.env` (see `.env.example`):

- `PUBLIC_FIREBASE_API_KEY`
- `PUBLIC_FIREBASE_AUTH_DOMAIN`
- `PUBLIC_FIREBASE_PROJECT_ID`
- `PUBLIC_FIREBASE_APP_ID`
- `PUBLIC_GOOGLE_MAPS_API_KEY`
- `PUBLIC_FACEBOOK_URL` (optional store Facebook page link)

Only accounts with an active `admin_users/{uid}` Firestore record and `products-contact` role can edit published catalogue items in `/admin/`.
