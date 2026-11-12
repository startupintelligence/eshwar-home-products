import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "./client";
import type { Product } from "../../types/content";

export type ProductDraftInput = {
  name: string;
  categoryId: string;
  description: string;
  price?: number;
  available: boolean;
};

export async function getPublishedProducts(): Promise<Product[]> {
  if (!db) return [];
  const snapshot = await getDocs(
    query(collection(db, "products"), where("status", "==", "published")),
  );
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Product);
}

export async function getEditorProducts(): Promise<{ products: Product[]; drafts: Product[] }> {
  if (!db) throw new Error("The client portal is not connected.");
  const [productsSnapshot, draftsSnapshot] = await Promise.all([
    getDocs(collection(db, "products")),
    getDocs(collection(db, "product_drafts")),
  ]);

  return {
    products: productsSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Product),
    drafts: draftsSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Product),
  };
}

export async function saveProductDraft(input: ProductDraftInput, productId?: string) {
  if (!db) throw new Error("The client portal is not connected.");
  const id = productId ?? doc(collection(db, "products")).id;
  await setDoc(doc(db, "product_drafts", id), {
    ...input,
    id,
    status: "draft",
    updatedAt: serverTimestamp(),
  });
  return id;
}

export async function publishProductDraft(productId: string) {
  if (!db || !auth?.currentUser) throw new Error("Please sign in again.");
  const draftRef = doc(db, "product_drafts", productId);
  const draftSnapshot = await getDoc(draftRef);
  if (!draftSnapshot.exists()) throw new Error("This draft no longer exists.");

  const draft = draftSnapshot.data();
  const batch = writeBatch(db);
  batch.set(doc(db, "products", productId), {
    ...draft,
    id: productId,
    status: "published",
    updatedAt: serverTimestamp(),
  });
  batch.delete(draftRef);

  const historyRef = doc(collection(db, "change_history"));
  batch.set(historyRef, {
    actorUid: auth.currentUser.uid,
    action: "publish",
    entityType: "product",
    entityId: productId,
    summary: `Published ${String(draft.name ?? "a product")}`.slice(0, 280),
    createdAt: serverTimestamp(),
  });

  await batch.commit();
}

export async function deleteProductDraft(productId: string) {
  if (!db || !auth?.currentUser) throw new Error("Please sign in again.");
  const batch = writeBatch(db);
  batch.delete(doc(db, "product_drafts", productId));
  const historyRef = doc(collection(db, "change_history"));
  batch.set(historyRef, {
    actorUid: auth.currentUser.uid,
    action: "delete",
    entityType: "product",
    entityId: productId,
    summary: "Deleted an unpublished product draft",
    createdAt: serverTimestamp(),
  });
  await batch.commit();
}
