# Authentication

The /admin/ client workspace uses Firebase email/password sign-in. There is no public registration flow.

A signed-in user must have an active Firestore admin_users/{uid} profile with role products-contact. The dashboard also checks the profile when restoring a session. Unauthorised users are signed out.

The client email/password account is created by the site administrator. Never request or store the client's password or one-time codes.
