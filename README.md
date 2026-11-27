# Eshwar Home Products

A static, editorial-style website for Eshwar Home Products in Perambur, Chennai.

## Company Profile

The Company Profile is available at /profile/ and contains About Us, Our Story, Ratings & Reviews, and Comments & Suggestions.

Customer feedback is stored in Firestore with pending status. Only approved submissions are publicly readable. The form uses Firebase anonymous authentication, Firestore Rules validation, server timestamps, a 60-second interval per anonymous Firebase UID, and a hidden honeypot. Customer email addresses are not collected.

The private moderation workspace is /admin/profile-moderation/. It requires an active admin_users/{uid} record with role products-contact. Firestore Rules restrict approval, rejection, and deletion to that existing role.

### Firebase configuration

Configure the existing public Firebase environment variables in the deployment: PUBLIC_FIREBASE_API_KEY, PUBLIC_FIREBASE_AUTH_DOMAIN, PUBLIC_FIREBASE_PROJECT_ID, and PUBLIC_FIREBASE_APP_ID.

Enable Anonymous sign-in in Firebase Authentication. Deploy the updated firestore.rules to the Firebase project used by the site. The moderator account must already exist in admin_users with active: true and role: products-contact.

No named Grievance Officer or separate grievance contact has been supplied. The profile displays the verified public store email and phone as customer-care channels and discloses this limitation.

### Abuse-prevention note

Firestore Rules enforce field validation, pending-only creation, server timestamps, and a 60-second interval per anonymous Firebase UID. The form also uses a honeypot and minimum completion time. This is a baseline, not strong bot protection: anonymous identities can be recreated. Before broad public promotion, configure Firebase App Check and/or a server-side rate-limited endpoint or CAPTCHA. No CAPTCHA secret or App Check site key was available, so none is fabricated.

## Development

- npm run dev
- npm run check
- npm run build
- npm run test:rules
