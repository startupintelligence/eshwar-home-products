# Tests

Run `npm run test:rules` to start the Firestore emulator and test the Firestore rules. The suite covers public published-product reads, unpublished-product protection, authorised and unauthorised product writes, audit actor identity, server timestamps, and immutable audit history.

GitHub Actions runs these tests before building the static site. Browser checks for 320, 360, 390 and 430 px widths, keyboard navigation, reduced motion, and complete client publishing flows remain separate acceptance checks.
