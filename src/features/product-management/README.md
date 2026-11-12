# Product management

The client workspace supports:
- Listing published products and drafts
- Creating new product drafts
- Preparing edits to published products without changing the live version
- Publishing a draft to the public products collection
- Deleting unpublished drafts

Publishing uses a Firestore batch to write the published record, remove its draft, and append an immutable change-history entry. Public visitors query only records with status=published.

Product data must be confirmed by the client. Product photo uploads are not enabled; Quantora Digital manages approved image files in the repository under the current Firebase Spark plan.
