# Publishing

The client is the publisher. Quantora Digital does not need to approve every product update.

The client saves a draft, reviews its name, category, description, price, and availability, then chooses Publish. Publishing writes the live products/{id} record, deletes the corresponding product_drafts/{id} record, and adds a change_history entry in one Firestore batch.

Public pages read only published products. The static category guide remains as a fallback while no individual Firestore products have been published or Firebase is not configured.
