import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { after, before, test } from "node:test";
import { assertFails, assertSucceeds, initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where, writeBatch } from "firebase/firestore";

const projectId = "demo-eshwar-home-products";
let testEnv;

function productData(id, status = "published") {
  return {
    id,
    name: "Published rice",
    categoryId: "grains",
    description: "Traditional rice for everyday cooking.",
    available: true,
    status,
    updatedAt: serverTimestamp(),
  };
}

before(async () => {
  const rulesPath = fileURLToPath(new URL("../firestore.rules", import.meta.url));
  testEnv = await initializeTestEnvironment({ projectId, firestore: { rules: readFileSync(rulesPath, "utf8") } });
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, "admin_users", "editor-1"), { active: true, role: "products-contact" });
    await setDoc(doc(db, "admin_users", "inactive-1"), { active: false, role: "products-contact" });
    await setDoc(doc(db, "products", "published-1"), productData("published-1"));
    await setDoc(doc(db, "product_drafts", "draft-1"), productData("draft-1", "draft"));
  });
});

after(async () => { await testEnv?.cleanup(); });

test("public visitors can read published products but not drafts", async () => {
  const db = testEnv.unauthenticatedContext().firestore();
  await assertSucceeds(getDoc(doc(db, "products", "published-1")));
  await assertFails(getDoc(doc(db, "product_drafts", "draft-1")));
});

test("public visitors can query only published products", async () => {
  const db = testEnv.unauthenticatedContext().firestore();
  const publishedQuery = query(collection(db, "products"), where("status", "==", "published"));
  const result = await assertSucceeds(getDocs(publishedQuery));
  if (result.size !== 1 || result.docs[0]?.id !== "published-1") {
    throw new Error("The public query returned an unexpected product set.");
  }
});

test("public visitors cannot list the mixed products collection", async () => {
  const db = testEnv.unauthenticatedContext().firestore();
  await assertFails(getDocs(collection(db, "products")));
});

test("an editor must atomically publish a matching draft to change a published product", async () => {
  const db = testEnv.authenticatedContext("editor-1").firestore();
  const publishedRef = doc(db, "products", "published-1");
  const draftRef = doc(db, "product_drafts", "published-1");

  await assertFails(updateDoc(publishedRef, { name: "Direct update bypass" }));
  await assertSucceeds(setDoc(draftRef, { ...productData("published-1", "draft"), name: "Updated rice" }));

  const batch = writeBatch(db);
  batch.set(publishedRef, { ...productData("published-1"), name: "Updated rice" });
  batch.delete(draftRef);
  batch.set(doc(collection(db, "change_history")), {
    actorUid: "editor-1",
    action: "publish",
    entityType: "product",
    entityId: "published-1",
    summary: "Published Updated rice",
    createdAt: serverTimestamp(),
  });
  await assertSucceeds(batch.commit());
});

test("product writes reject unknown fields and invalid values", async () => {
  const db = testEnv.authenticatedContext("editor-1").firestore();

  const validDraftRef = doc(db, "product_drafts", "valid-new");
  await assertSucceeds(setDoc(validDraftRef, productData("valid-new", "draft")));
  const publishBatch = writeBatch(db);
  publishBatch.set(doc(db, "products", "valid-new"), productData("valid-new"));
  publishBatch.delete(validDraftRef);
  await assertSucceeds(publishBatch.commit());

  await assertFails(setDoc(doc(db, "product_drafts", "extra-field"), {
    ...productData("extra-field", "draft"),
    administrator: true,
  }));

  await assertFails(setDoc(doc(db, "product_drafts", "bad-category"), {
    ...productData("bad-category", "draft"),
    categoryId: "not-a-store-category",
  }));

  await assertFails(setDoc(doc(db, "product_drafts", "negative-price"), {
    ...productData("negative-price", "draft"),
    price: -1,
  }));

  await assertFails(setDoc(doc(db, "product_drafts", "wrong-id"), productData("different-id", "draft")));
});

test("draft writes require the draft status and the same product schema", async () => {
  const db = testEnv.authenticatedContext("editor-1").firestore();

  await assertSucceeds(setDoc(doc(db, "product_drafts", "valid-draft"), productData("valid-draft", "draft")));

  await assertFails(setDoc(doc(db, "product_drafts", "published-as-draft"), productData("published-as-draft")));

  await assertFails(setDoc(doc(db, "product_drafts", "invalid-draft"), {
    ...productData("invalid-draft", "draft"),
    unexpected: "not allowed",
  }));
});

test("ordinary and inactive accounts cannot write products", async () => {
  const ordinaryDb = testEnv.authenticatedContext("ordinary-1").firestore();
  const inactiveDb = testEnv.authenticatedContext("inactive-1").firestore();
  await assertFails(setDoc(doc(ordinaryDb, "products", "blocked-1"), productData("blocked-1")));
  await assertFails(setDoc(doc(inactiveDb, "products", "blocked-2"), productData("blocked-2")));
});

test("audit entries require the signed-in actor and server timestamp", async () => {
  const db = testEnv.authenticatedContext("editor-1").firestore();
  await assertSucceeds(setDoc(doc(db, "change_history", "valid-1"), { actorUid: "editor-1", action: "publish", entityType: "product", entityId: "published-1", summary: "Published a product", createdAt: serverTimestamp() }));
  await assertFails(setDoc(doc(db, "change_history", "spoofed-1"), { actorUid: "someone-else", action: "publish", entityType: "product", entityId: "published-1", summary: "Spoofed actor", createdAt: serverTimestamp() }));
});

test("audit history is immutable after creation", async () => {
  const db = testEnv.authenticatedContext("editor-1").firestore();
  const entry = doc(db, "change_history", "immutable-1");
  await assertSucceeds(setDoc(entry, { actorUid: "editor-1", action: "update", entityType: "product", entityId: "published-1", summary: "Updated a product", createdAt: serverTimestamp() }));
  await assertFails(updateDoc(entry, { summary: "Changed" }));
  await assertFails(deleteDoc(entry));
});

test("client editors cannot delete published products but can delete drafts", async () => {
  const db = testEnv.authenticatedContext("editor-1").firestore();
  const draftRef = doc(db, "product_drafts", "draft-1");
  if (!(await getDoc(draftRef)).exists()) {
    throw new Error("The draft fixture was not created.");
  }
  await assertFails(deleteDoc(doc(db, "products", "published-1")));
  await assertSucceeds(deleteDoc(draftRef));
  if ((await getDoc(draftRef)).exists()) {
    throw new Error("The draft was not deleted.");
  }
});
