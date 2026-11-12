import { useEffect, useState } from "react";
import { getPublishedProducts } from "../services/firebase/products";
import type { Product } from "../types/content";

const categoryLabels: Record<string, string> = {
  grains: "Rice & millets",
  oils: "Oils, ghee & dairy",
  pantry: "Pantry essentials",
};

export default function PublishedCatalogue() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    getPublishedProducts()
      .then((items) => {
        if (!active) return;
        setProducts(items);
        if (items.length > 0) {
          document.getElementById("static-catalogue")?.setAttribute("hidden", "");
        }
      })
      .catch(() => {
        // Keep the verified static catalogue visible if Firebase is unavailable.
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => { active = false; };
  }, []);

  if (!loaded || products.length === 0) return null;

  return (
    <div className="live-catalogue" aria-live="polite">
      {products.map((product) => (
        <article className="live-product" key={product.id}>
          <div>
            <p className="eyebrow">{categoryLabels[product.categoryId] ?? "Store selection"}</p>
            <h2>{product.name}</h2>
            <p>{product.description}</p>
          </div>
          <div className="live-product-meta">
            {typeof product.price === "number" && <strong>₹{product.price.toLocaleString("en-IN")}</strong>}
            <span>{product.available ? "Available" : "Currently unavailable"}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
