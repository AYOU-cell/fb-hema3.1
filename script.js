if (window.lucide) {
  window.lucide.createIcons();
}

const vercelEventLabels = {
  whatsapp_inline_click: "页面内 WhatsApp 按钮点击",
  whatsapp_floating_click: "底部悬浮 WhatsApp 按钮点击",
  engaged_10s: "停留超过 10 秒",
  engaged_30s: "停留超过 30 秒",
  engaged_60s: "停留超过 60 秒",
  scroll_to_documents: "滚动到资料区域",
};

function trackVercelEvent(name, data = {}) {
  if (typeof window.va !== "function") {
    return;
  }

  window.va("event", {
    name,
    data: {
      label: vercelEventLabels[name] || name,
      ...data,
    },
  });
}

document.querySelector(".section-whatsapp")?.addEventListener("click", () => {
  trackVercelEvent("whatsapp_inline_click", {
    button_location: "inline",
    button_location_zh: "页面内容区",
  });
});

document.querySelector(".floating-whatsapp")?.addEventListener("click", () => {
  trackVercelEvent("whatsapp_floating_click", {
    button_location: "floating",
    button_location_zh: "底部悬浮",
  });
});

[
  ["engaged_10s", 10_000],
  ["engaged_30s", 30_000],
  ["engaged_60s", 60_000],
].forEach(([eventName, delay]) => {
  window.setTimeout(() => {
    trackVercelEvent(eventName, {
      threshold_seconds: delay / 1000,
      threshold_zh: `停留 ${delay / 1000} 秒`,
    });
  }, delay);
});

const documentsSection = document.querySelector(".group-downloads");

if (documentsSection && "IntersectionObserver" in window) {
  const documentsObserver = new IntersectionObserver(
    (entries, observer) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        trackVercelEvent("scroll_to_documents", {
          section: "documents",
          section_zh: "群组资料",
        });
        observer.disconnect();
      }
    },
    { threshold: 0.35 },
  );

  documentsObserver.observe(documentsSection);
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
