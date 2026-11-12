const filterButtons = document.querySelectorAll("[data-filter]");
let selectedFilter = "all";

function applySelectedFilter() {
  document.querySelectorAll("[data-group]").forEach((group) => {
    const visible =
      selectedFilter === "all" || group.getAttribute("data-group") === selectedFilter;
    group.hidden = !visible;
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

// Firebase catalogue items may render after a visitor has already chosen a filter.
document.addEventListener("catalogue:updated", applySelectedFilter);
