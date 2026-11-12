const filterButtons = document.querySelectorAll("[data-filter]");
const groups = document.querySelectorAll("[data-group]");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.getAttribute("data-filter") || "all";
    filterButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    groups.forEach((group) => {
      const visible = filter === "all" || group.getAttribute("data-group") === filter;
      group.hidden = !visible;
    });
  });
});
