import { useCallback, useEffect, useState } from "react";
import { firebaseReady } from "../services/firebase/client";
import { getPublishedProducts } from "../services/firebase/products";
import catalogue from "../data/catalogue.json";
import type { Product } from "../types/content";

const categoryLabels: Record<string, string> = {
  grains: "Rice & millets",
  oils: "Oils, ghee & dairy",
  pantry: "Pantry essentials",
  uncategorized: "Store selection",
};

const categoryVisuals = Object.fromEntries(
  catalogue.groups.map((group) => [group.id, {
    src: `${import.meta.env.BASE_URL}${group.placeholderImage}`,
    alt: group.placeholderAlt,
  }]),
) as Record<string, { src: string; alt: string }>;

const defaultVisual = categoryVisuals.pantry;

function resolveProductImage(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
}

export default function PublishedCatalogue() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [attempt, setAttempt] = useState(0);

  const loadProducts = useCallback(() => {
    if (!firebaseReady) {
      setLoading(false);
      setErrorMessage("");
      return () => {};
    }

    let active = true;
    setLoading(true);
    setErrorMessage("");

    getPublishedProducts()
      .then((items) => {
        if (!active) return;
        setProducts(items);
        if (items.length > 0) {
          document.querySelectorAll("[data-static-catalogue-items]").forEach((element) => {
            element.setAttribute("hidden", "");
          });
        }
      })
      .catch(() => {
        if (!active) return;
        setErrorMessage(
          "We could not load recently published store items right now. You can retry below or browse our full category guide on this page."
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const cleanup = loadProducts();
    return cleanup;
  }, [loadProducts, attempt]);

  useEffect(() => {
    document.dispatchEvent(new Event("catalogue:updated"));
  }, [products]);

  if (loading) {
    return (
      <div className="live-catalogue-loading" role="status" aria-live="polite" aria-busy="true">
        <p className="live-catalogue-loading-text">Checking recently published store items…</p>
        <div className="live-catalogue-skeleton">
          <div className="skeleton-card" aria-hidden="true" />
          <div className="skeleton-card" aria-hidden="true" />
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="live-catalogue-error" role="alert">
        <p>{errorMessage}</p>
        <button
          type="button"
          className="filter-button live-catalogue-retry"
          onClick={() => setAttempt((prev) => prev + 1)}
        >
          Retry loading items
        </button>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="live-catalogue" aria-live="polite">
      {products.map((product) => {
        const rawCategory = typeof product.categoryId === "string" ? product.categoryId : "";
        const categoryId = Object.prototype.hasOwnProperty.call(categoryLabels, rawCategory) && rawCategory !== "uncategorized"
          ? rawCategory
          : "uncategorized";
        const categoryVisual = categoryVisuals[categoryId] ?? defaultVisual;
        const productRecord = product as Product & { imageUrl?: string };
        const uploadedImage = productRecord.imageUrl || product.imagePath;
        const hasUploadedImage = typeof uploadedImage === "string" && uploadedImage.trim().length > 0;
        const imageSrc = hasUploadedImage ? resolveProductImage(uploadedImage) : categoryVisual.src;
        const imageAlt = hasUploadedImage ? `${product.name} product photograph` : categoryVisual.alt;
        return (
          <article className="live-product" data-group={categoryId} key={product.id}>
            <div className="live-product-media">
              <div className="live-product-image">
                <img src={imageSrc} alt={imageAlt} width="800" height="600" loading="lazy" decoding="async" />
              </div>
              {!hasUploadedImage && <span className="representative-caption">Representative visual · Store photos coming soon</span>}
            </div>
            <div className="live-product-content">
              <span className="category-badge">{categoryLabels[categoryId]}</span>
              <h2><button className="live-product-title-trigger" type="button" data-ehp-dialog="product" data-ehp-title={product.name} data-ehp-description={product.description || "Ask the store about current availability and pack sizes."} data-ehp-items={JSON.stringify([product.name])} aria-haspopup="dialog">{product.name}</button></h2>
              {product.description && <p>{product.description}</p>}
              <div className="live-product-meta">
                {typeof product.price === "number" && <strong>₹{product.price.toLocaleString("en-IN")}</strong>}
                {typeof product.available === "boolean" && <span>{product.available ? "Available" : "Currently unavailable"}</span>}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
