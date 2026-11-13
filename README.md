# Eshwar Home Products

A static, editorial-style website for Eshwar Home Products in Perambur, Chennai. The public website is a product catalogue and store-information site, not an e-commerce checkout.

## Stack

- Astro static site generation
- Vanilla CSS with CSS custom properties
- Small browser-native JavaScript for mobile navigation and pantry filters
- React islands for the client portal and Firestore-backed published catalogue
- Firebase Authentication and Cloud Firestore for authorised client editing

## Routes

- / — Home
- /about/ — Our story
- /products/ — Pantry catalogue, category filters, and published product records
- /contact/ — Store details and directions
- /admin/ — Client product workspace (not indexed)

## Local development

    npm ci
    npm run dev

## Checks

    npm run check
    npm run test:rules
    npm run build
    npm run preview

The Firestore rules suite uses the local emulator. It tests public reads, editor permissions, and immutable audit history. The production build is generated in dist/ and deployed to GitHub Pages by .github/workflows/deploy.yml.

## Product content and photography

The static pantry index is maintained in src/data/catalogue.json. Keep it as the fallback until the client confirms product-level records. Published Firestore product records appear in the public catalogue when Firebase is configured and at least one product is published.

Do not invent product names, prices, pack sizes, availability, ingredients, certifications, or health claims. Until the client supplies original store photographs, use only clean, representative category visuals (royalty-free stock with its licence recorded, or crisp custom SVG category illustrations) in `public/images/placeholders/`. Keep the three shelf files aligned with `rice-millets`, `oils-ghee`, and `pantry-essentials`. Use these only as category illustrations and as the Firestore product-image fallback when a published record has no `imageUrl`/`imagePath`. Never present a representative visual as a photograph of a specific product. Use descriptive alt text such as `Representative image of traditional millets and grains` and the unobtrusive caption `Representative visual · Store photos coming soon`. All shelf and product image frames must reserve a 4:3 aspect ratio and explicit intrinsic dimensions to avoid layout shift. When approved store/product photos arrive, replace the SVGs or add the approved product image path without changing the reserved frame dimensions. Optimise any temporary raster photographs to lightweight WebP before adding them; custom SVG category illustrations are preferred for crisp, small files. See `public/images/placeholders/README.md` for the temporary-phase rules.

The client dashboard currently supports product drafts, editing, publishing, and draft deletion. Direct photo uploads, contact/business settings, and media management are not enabled yet. Under the agreed Firebase Spark setup, images remain managed in the repository by Quantora Digital.

## Firebase

The client portal reads these GitHub Actions secrets at build time:

- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_APP_ID

The workflow maps these existing secret names to Astro's PUBLIC_FIREBASE_ environment variables. Local development uses the matching PUBLIC_FIREBASE_ names in .env. If the GitHub secrets are missing, the sign-in page shows a setup notice.

Only accounts with an active admin_users/{uid} record and role products-contact can edit. Public registration is not available. Do not add private service-account credentials to the frontend.

## Deployment

The feature branch builds and tests but does not deploy. The repository's GitHub Pages setting must use GitHub Actions as its source before the main branch can deploy this Astro site. Do not merge or publish without approval.
