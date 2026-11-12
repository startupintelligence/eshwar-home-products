# Eshwar Home Products

A static, editorial-style website for Eshwar Home Products in Perambur, Chennai.

## Stack

- Astro static site generation
- Vanilla CSS with CSS custom properties
- Small browser-native JavaScript for mobile navigation and pantry filters
- React is retained only for the existing client sign-in screen
- Firebase client integration remains separate from the public catalogue

## Routes

- / — Home
- /about/ — Our story
- /products/ — Pantry catalogue and category filters
- /contact/ — Store details and directions
- /admin/ — Client sign-in (not indexed)

## Local development

    npm install
    npm run dev

## Production checks

    npm run check
    npm run build
    npm run preview

The production build is generated in dist/ and deployed to GitHub Pages by .github/workflows/deploy.yml.

## Content and photography

The pantry index is maintained in src/data/catalogue.json. Update it when the client confirms product names and availability. No stock photographs or placeholder product images are used. Add only client-approved photographs under public/images/.

## Firebase

The client portal reads these GitHub Actions secrets at build time:

- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_APP_ID

If they are not configured, the sign-in page shows a setup notice. Do not add private service-account credentials to the frontend.
