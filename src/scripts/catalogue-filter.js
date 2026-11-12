const filterButtons = document.querySelectorAll("[data-filter]");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.getAttribute("data-filter") || "all";

    filterButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });

    // Query at click time so this includes Firebase products rendered after hydration.
    document.querySelectorAll("[data-group]").forEach((group) => {
      const visible = filter === "all" || group.getAttribute("data-group") === filter;
      group.hidden = !visible;
    });
  });
});
