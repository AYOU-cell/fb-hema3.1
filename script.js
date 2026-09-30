if (window.lucide) {
  window.lucide.createIcons();
}

const modalOpeners = document.querySelectorAll("[data-modal-open]");
const modals = document.querySelectorAll("dialog");

modalOpeners.forEach((opener) => {
  opener.addEventListener("click", () => {
    const modal = document.getElementById(opener.dataset.modalOpen);
    if (modal) {
      modal.showModal();
      modal.querySelector(".modal-close")?.focus();
    }
  });
});

modals.forEach((modal) => {
  modal.querySelector(".modal-close")?.addEventListener("click", () => modal.close());

  modal.addEventListener("click", (event) => {
    const bounds = modal.getBoundingClientRect();
    const clickedBackdrop =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;

    if (clickedBackdrop) {
      modal.close();
    }
  });
});
