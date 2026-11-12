# Eshwar Home Products

Website project by **Quantora Digital (QD)**.

A product exploration website, not an e-commerce platform. Visitors browse categories, learn about the shop and contact the business. No cart, checkout, payments or online order processing.

## Current stack
- React + TypeScript + Vite multi-page application.
- Approved design: **Theme 2 – Modern Premium**.
- Public pages: Home, Products and Contact.
- Separate `/admin/` client sign-in entry.
- Firebase Authentication and Firestore foundation.
- Firestore security rules and GitHub Actions deployment workflow.
- Previous HTML previews retained in `preview/` as references.

## Local development
Requires Node.js 22+ and npm.

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

Copy `.env.example` to `.env` and fill in Firebase web app configuration only after the client creates the Firebase project. Never commit `.env`, passwords, private keys or service-account files.

## Firebase plan
The Firebase project belongs to the client and must be created under `info.eshwarhomeproducts@gmail.com`. QD should receive appropriate project access; never request the client's password or OTP.

Initial target is Firebase Spark: email/password Authentication, Firestore, no public registration, no Storage and no billing upgrade. Product images remain QD-managed in the repository until a free alternative is approved.

After creating the client's Firebase Auth account, the project administrator must create `admin_users/{uid}` with `role: "products-contact"` and `active: true`. The client cannot grant their own role.

## Client editing and publishing
The intended workflow is client edits drafts, previews changes, then publishes. Public visitors should only read published content. Product CRUD, draft/publish UI, site settings editor and history UI are not yet implemented.

## Hosting
GitHub Pages is the initial host. Configure repository Pages source as **GitHub Actions**. Vite base path is `/eshwar-home-products/`. The workflow builds `dist/` and deploys it.

## Before launch
Replace the temporary EH monogram with the approved emblem, replace illustrative product art with real client-approved photographs, confirm the complete product list and descriptions, configure Firebase and test security rules. Opening hours and final legal pages remain to be confirmed.

## Ownership
QD manages this repository during development. Transfer it to the client only after the website is completed and tested. Firebase belongs to the client from the beginning.