import { useEffect, useState, type FormEvent } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, firebaseReady } from "../../services/firebase/client";
import { signInClient, signOutClient } from "../../services/firebase/auth";
import {
  deleteProductDraft,
  getEditorProducts,
  publishProductDraft,
  saveProductDraft,
  type ProductDraftInput,
} from "../../services/firebase/products";
import type { Product } from "../../types/content";
import { siteConfig, sitePath } from "../../app/config/site";

const categories = [
  { id: "grains", label: "Rice & millets" },
  { id: "oils", label: "Oils, ghee & dairy" },
  { id: "pantry", label: "Pantry essentials" },
];

const emptyForm: ProductDraftInput = {
  name: "",
  categoryId: "grains",
  description: "",
  available: true,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function AdminPage() {
  const [email, setEmail] = useState<string>(siteConfig.email);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"info" | "error">("info");
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});
  const [draftErrors, setDraftErrors] = useState<{ name?: string; description?: string; price?: string }>({});
  const [busy, setBusy] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [drafts, setDrafts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductDraftInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  async function refreshWorkspace() {
    const result = await getEditorProducts();
    setProducts(result.products.filter((item) => item.status === "published"));
    setDrafts(result.drafts);
  }

  useEffect(() => {
    const database = db;
    if (!auth || !database) return;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setProducts([]);
        setDrafts([]);
        return;
      }
      try {
        const profile = await getDoc(doc(database, "admin_users", currentUser.uid));
        const data = profile.data();
        if (!profile.exists() || data?.active !== true || data?.role !== "products-contact") {
          await signOutClient();
          setMessageTone("error");
          setMessage("This account is not authorised for the client portal.");
          return;
        }
        setUser(currentUser);
        const result = await getEditorProducts();
        setProducts(result.products.filter((item) => item.status === "published"));
        setDrafts(result.drafts);
      } catch {
        setMessageTone("error");
        setMessage("We could not load the dashboard. Please refresh and try again.");
      }
    });
    return unsubscribe;
  }, []);

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    const trimmedEmail = email.trim();
    const nextErrors: { email?: string; password?: string } = {};
    if (!trimmedEmail || !EMAIL_RE.test(trimmedEmail)) {
      nextErrors.email = "Enter a valid store email address.";
    }
    if (!password) {
      nextErrors.password = "Enter your password.";
    }
    setLoginErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setMessage("");
    setMessageTone("info");
    setBusy(true);
    try {
      const signedInUser = await signInClient(trimmedEmail, password);
      setUser(signedInUser);
      setPassword("");
      setLoginErrors({});
      await refreshWorkspace();
      setMessageTone("info");
      setMessage("You are signed in.");
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "Sign-in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function editProduct(product: Product) {
    setEditingId(product.id);
    setDraftErrors({});
    setConfirmDeleteId(null);
    setForm({
      name: product.name,
      categoryId: product.categoryId,
      description: product.description,
      price: product.price,
      available: product.available,
    });
    setMessageTone("info");
    setMessage("Editing a draft. The published product will stay live until you publish this change.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    const trimmedName = form.name.trim();
    const trimmedDesc = form.description.trim();
    const nextErrors: { name?: string; description?: string; price?: string } = {};

    if (!trimmedName) {
      nextErrors.name = "Product name is required.";
    } else if (trimmedName.length > 100) {
      nextErrors.name = "Product name must be 100 characters or fewer.";
    }
    if (trimmedDesc.length > 500) {
      nextErrors.description = "Description must be 500 characters or fewer.";
    }
    if (form.price !== undefined) {
      const numericPrice = Number(form.price);
      if (!Number.isFinite(numericPrice) || numericPrice < 0 || numericPrice > 10000000) {
        nextErrors.price = "Enter a valid non-negative price (up to ₹1,00,00,000).";
      }
    }

    setDraftErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setBusy(true);
    setMessage("");
    setMessageTone("info");
    try {
      await saveProductDraft({
        ...form,
        name: trimmedName,
        description: trimmedDesc,
        price: form.price === undefined ? undefined : Number(form.price),
      }, editingId ?? undefined);
      setForm(emptyForm);
      setEditingId(null);
      setDraftErrors({});
      await refreshWorkspace();
      setMessageTone("info");
      setMessage("Draft saved. Review it before publishing.");
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "Could not save the draft.");
    } finally {
      setBusy(false);
    }
  }

  async function publishDraft(id: string) {
    if (busy) return;
    setBusy(true);
    setConfirmDeleteId(null);
    setMessage("");
    try {
      await publishProductDraft(id);
      await refreshWorkspace();
      setMessageTone("info");
      setMessage("Product published. The public catalogue will now show this product.");
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "Could not publish this product.");
    } finally {
      setBusy(false);
    }
  }

  async function removeDraft(id: string) {
    if (busy) return;
    setBusy(true);
    setConfirmDeleteId(null);
    setMessage("");
    try {
      await deleteProductDraft(id);
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }
      await refreshWorkspace();
      setMessageTone("info");
      setMessage("Draft deleted.");
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "Could not delete this draft.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    if (busy) return;
    setBusy(true);
    try {
      await signOutClient();
      setMessageTone("info");
      setMessage("You have signed out.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-shell">
      <a className="admin-back" href={sitePath()}>← Back to website</a>
      {!firebaseReady ? (
        <section className="admin-card">
          <span className="eyebrow">Eshwar Home Products · Client access</span>
          <h1>Portal setup in progress.</h1>
          <p>Firebase connection details have not been added to the deployment yet.</p>
          <div className="notice" role="status">The client dashboard is ready for configuration after the Firebase project settings are added.</div>
        </section>
      ) : !user ? (
        <section className="admin-card">
          <span className="eyebrow">Eshwar Home Products · Client access</span>
          <h1>Welcome back.</h1>
          <p>Sign in with the account created for your store. Public registration is not available.</p>
          <form className="admin-form" onSubmit={submitLogin} noValidate>
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              aria-invalid={Boolean(loginErrors.email)}
              aria-describedby={loginErrors.email ? "login-email-error" : undefined}
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (loginErrors.email) setLoginErrors((prev) => ({ ...prev, email: undefined }));
              }}
            />
            {loginErrors.email && <p id="login-email-error" className="field-error" role="alert">{loginErrors.email}</p>}

            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              aria-invalid={Boolean(loginErrors.password)}
              aria-describedby={loginErrors.password ? "login-password-error" : undefined}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (loginErrors.password) setLoginErrors((prev) => ({ ...prev, password: undefined }));
              }}
            />
            {loginErrors.password && <p id="login-password-error" className="field-error" role="alert">{loginErrors.password}</p>}

            <button className="button" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
          </form>
          {message && (
            <p className={`form-message${messageTone === "error" ? " form-message--error" : ""}`} role={messageTone === "error" ? "alert" : "status"}>
              {message}
            </p>
          )}
          <small>Need access help? Contact Quantora Digital. Your account must be authorised by the site administrator.</small>
        </section>
      ) : (
        <section className="admin-workspace">
          <header className="admin-workspace-header">
            <div>
              <span className="eyebrow">Eshwar Home Products · Client workspace</span>
              <h1>Product catalogue</h1>
              <p>Signed in as {user.email}. Save changes as drafts, then publish when they are ready.</p>
            </div>
            <button className="button button-outline" type="button" disabled={busy} onClick={logout}>Sign out</button>
          </header>

          <div className="admin-workspace-grid">
            <section className="admin-panel">
              <span className="eyebrow">{editingId ? "Edit product" : "Add a product"}</span>
              <h2>{editingId ? "Prepare an update." : "Create a new draft."}</h2>
              <form className="admin-form" onSubmit={saveDraft} noValidate>
                <label htmlFor="product-name">Product name</label>
                <input
                  id="product-name"
                  required
                  maxLength={100}
                  aria-invalid={Boolean(draftErrors.name)}
                  aria-describedby={draftErrors.name ? "product-name-error" : undefined}
                  value={form.name}
                  onChange={(event) => {
                    setForm({ ...form, name: event.target.value });
                    if (draftErrors.name) setDraftErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                />
                {draftErrors.name && <p id="product-name-error" className="field-error" role="alert">{draftErrors.name}</p>}

                <label htmlFor="product-category">Category</label>
                <select id="product-category" value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })}>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}
                </select>

                <label htmlFor="product-description">Description</label>
                <textarea
                  id="product-description"
                  rows={4}
                  maxLength={500}
                  aria-invalid={Boolean(draftErrors.description)}
                  aria-describedby={draftErrors.description ? "product-description-error" : undefined}
                  value={form.description}
                  onChange={(event) => {
                    setForm({ ...form, description: event.target.value });
                    if (draftErrors.description) setDraftErrors((prev) => ({ ...prev, description: undefined }));
                  }}
                />
                {draftErrors.description && <p id="product-description-error" className="field-error" role="alert">{draftErrors.description}</p>}

                <label htmlFor="product-price">Price (optional, ₹)</label>
                <input
                  id="product-price"
                  type="number"
                  min="0"
                  step="0.01"
                  aria-invalid={Boolean(draftErrors.price)}
                  aria-describedby={draftErrors.price ? "product-price-error" : undefined}
                  value={form.price ?? ""}
                  onChange={(event) => {
                    setForm({ ...form, price: event.target.value === "" ? undefined : Number(event.target.value) });
                    if (draftErrors.price) setDraftErrors((prev) => ({ ...prev, price: undefined }));
                  }}
                />
                {draftErrors.price && <p id="product-price-error" className="field-error" role="alert">{draftErrors.price}</p>}

                <label className="admin-checkbox"><input type="checkbox" checked={form.available} onChange={(event) => setForm({ ...form, available: event.target.checked })} /> Currently available</label>
                <button className="button" disabled={busy}>{busy ? "Saving…" : "Save as draft"}</button>
                {editingId && <button className="button button-outline" type="button" onClick={() => { setEditingId(null); setForm(emptyForm); setDraftErrors({}); }}>Cancel editing</button>}
              </form>
              <p className="admin-help">Product photos are currently managed by Quantora Digital in the website repository. Direct uploads are not enabled on the current Firebase free setup.</p>
            </section>

            <div className="admin-lists">
              <section className="admin-panel">
                <div className="admin-section-heading"><div><span className="eyebrow">Needs review</span><h2>Drafts ({drafts.length})</h2></div></div>
                {drafts.length === 0 ? <p className="admin-empty">No drafts yet. New products and edits will appear here.</p> : (
                  <ul className="admin-product-list">
                    {drafts.map((item) => <li key={item.id}>
                      <div><strong>{item.name}</strong><span>{categories.find((category) => category.id === item.categoryId)?.label ?? "Other"} · Draft</span></div>
                      <div className="admin-item-actions">
                        <button type="button" className="text-button" onClick={() => editProduct(item)}>Edit</button>
                        <button type="button" className="text-button" disabled={busy} onClick={() => publishDraft(item.id)}>Publish</button>
                        {confirmDeleteId === item.id ? (
                          <span className="inline-confirm" role="group" aria-label={`Confirm deletion of ${item.name}`}>
                            <span>Delete?</span>
                            <button type="button" className="text-button text-button-danger" disabled={busy} onClick={() => removeDraft(item.id)}>Confirm</button>
                            <button type="button" className="text-button text-button-muted" disabled={busy} onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                          </span>
                        ) : (
                          <button type="button" className="text-button text-button-muted" disabled={busy} onClick={() => setConfirmDeleteId(item.id)}>Delete</button>
                        )}
                      </div>
                    </li>)}
                  </ul>
                )}
              </section>

              <section className="admin-panel">
                <span className="eyebrow">Live on the website</span>
                <h2>Published products ({products.length})</h2>
                {products.length === 0 ? <p className="admin-empty">No individual products have been published yet. The current category guide remains visible to visitors.</p> : (
                  <ul className="admin-product-list">
                    {products.map((item) => <li key={item.id}>
                      <div><strong>{item.name}</strong><span>{categories.find((category) => category.id === item.categoryId)?.label ?? "Other"} · {item.available ? "Available" : "Unavailable"}</span></div>
                      <button type="button" className="text-button" onClick={() => editProduct(item)}>Prepare edit</button>
                    </li>)}
                  </ul>
                )}
              </section>
            </div>
          </div>
          {message && (
            <p className={`form-message admin-status${messageTone === "error" ? " form-message--error" : ""}`} role={messageTone === "error" ? "alert" : "status"}>
              {message}
            </p>
          )}
        </section>
      )}
    </main>
  );
}
