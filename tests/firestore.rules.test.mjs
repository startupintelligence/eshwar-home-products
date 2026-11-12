import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { after, before, test } from "node:test";
import { assertFails, assertSucceeds, initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";

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
    await setDoc(doc(db, "products", "draft-1"), productData("draft-1", "draft"));
  });
});

after(async () => { await testEnv?.cleanup(); });

test("public visitors can read published products but not drafts", async () => {
  const db = testEnv.unauthenticatedContext().firestore();
  await assertSucceeds(getDoc(doc(db, "products", "published-1")));
  await assertFails(getDoc(doc(db, "products", "draft-1")));
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

test("an active products-contact editor can update a valid published product", async () => {
  const db = testEnv.authenticatedContext("editor-1").firestore();
  await assertSucceeds(setDoc(doc(db, "products", "published-1"), {
    ...productData("published-1"),
    name: "Updated rice",
  }));
});

test("product writes reject unknown fields and invalid values", async () => {
  const db = testEnv.authenticatedContext("editor-1").firestore();

  await assertSucceeds(setDoc(doc(db, "products", "valid-new"), productData("valid-new")));

  await assertFails(setDoc(doc(db, "products", "extra-field"), {
    ...productData("extra-field"),
    administrator: true,
  }));

  await assertFails(setDoc(doc(db, "products", "bad-category"), {
    ...productData("bad-category"),
    categoryId: "not-a-store-category",
  }));

  await assertFails(setDoc(doc(db, "products", "negative-price"), {
    ...productData("negative-price"),
    price: -1,
  }));

  await assertFails(setDoc(doc(db, "products", "wrong-id"), productData("different-id")));
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
