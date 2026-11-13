const filterButtons = document.querySelectorAll("button[data-filter]");
const shelfLinks = document.querySelectorAll(".pantry-shelf-link[data-filter]");
let selectedFilter = "all";

function applySelectedFilter() {
  document.querySelectorAll("[data-group]").forEach((group) => {
    const category = group.getAttribute("data-group") || "uncategorized";
    group.hidden = selectedFilter !== "all" && category !== selectedFilter;
  });
}

function selectFilter(filter) {
  selectedFilter = filter;
  filterButtons.forEach((button) => {
    const active = button.getAttribute("data-filter") === selectedFilter;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  applySelectedFilter();
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectFilter(button.getAttribute("data-filter") || "all");
  });
});

shelfLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    selectFilter(link.getAttribute("data-filter") || "all");
    document.getElementById("catalogue-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// Reapply the visitor's selected shelf after the Firestore island renders.
document.addEventListener("catalogue:updated", applySelectedFilter);
applySelectedFilter();
