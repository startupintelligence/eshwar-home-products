import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { after, before, test } from "node:test";
import { assertFails, assertSucceeds, initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";

const projectId = "demo-eshwar-home-products";
let testEnv;

before(async () => {
  const rulesPath = fileURLToPath(new URL("../firestore.rules", import.meta.url));
  testEnv = await initializeTestEnvironment({ projectId, firestore: { rules: readFileSync(rulesPath, "utf8") } });
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, "admin_users", "editor-1"), { active: true, role: "products-contact" });
    await setDoc(doc(db, "admin_users", "inactive-1"), { active: false, role: "products-contact" });
    await setDoc(doc(db, "products", "published-1"), { name: "Published rice", status: "published" });
    await setDoc(doc(db, "products", "draft-1"), { name: "Unpublished rice", status: "draft" });
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

test("an active products-contact editor can update products", async () => {
  const db = testEnv.authenticatedContext("editor-1").firestore();
  await assertSucceeds(setDoc(doc(db, "products", "published-1"), { name: "Updated rice", status: "published" }));
});

test("ordinary and inactive accounts cannot write products", async () => {
  const ordinaryDb = testEnv.authenticatedContext("ordinary-1").firestore();
  const inactiveDb = testEnv.authenticatedContext("inactive-1").firestore();
  await assertFails(setDoc(doc(ordinaryDb, "products", "blocked-1"), { name: "Blocked", status: "draft" }));
  await assertFails(setDoc(doc(inactiveDb, "products", "blocked-2"), { name: "Blocked", status: "draft" }));
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
