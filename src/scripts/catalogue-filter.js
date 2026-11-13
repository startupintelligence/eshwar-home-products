const filterButtons = document.querySelectorAll("[data-filter]");
let selectedFilter = "all";

function applySelectedFilter() {
  document.querySelectorAll("[data-group]").forEach((group) => {
    const category = group.getAttribute("data-group") || "uncategorized";
    group.hidden = selectedFilter !== "all" && category !== selectedFilter;
  });
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedFilter = button.getAttribute("data-filter") || "all";
    filterButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    applySelectedFilter();
  });
});

// Reapply the visitor's selected shelf after the Firestore island renders.
document.addEventListener("catalogue:updated", applySelectedFilter);
applySelectedFilter();
