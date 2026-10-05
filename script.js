if (window.lucide) {
  window.lucide.createIcons();
}

const inflationBaseIndex = 110.2;
const inflationCurrentIndex = 125.8;
const amountInput = document.querySelector("#amount-input");
const currentValueOutput = document.querySelector("#current-value");
const futureValueOutput = document.querySelector("#future-value");
const lossAmountOutput = document.querySelector("#loss-amount");
const presetButtons = document.querySelectorAll("[data-amount]");

const formatEuro = (amount) =>
  new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);

function updateInflationResult(amount) {
  const hasAmount = Number.isFinite(amount) && amount > 0;
  const normalizedAmount = hasAmount ? amount : 0;
  const remainingRatio = inflationBaseIndex / inflationCurrentIndex;
  const currentValue = normalizedAmount * remainingRatio;
  const lossAmount = normalizedAmount - currentValue;

  if (hasAmount) {
    currentValueOutput.textContent = formatEuro(currentValue);
    futureValueOutput.textContent = formatEuro(currentValue);
    lossAmountOutput.textContent = `-${formatEuro(lossAmount).replace("-", "")}`;
  } else {
    currentValueOutput.textContent = "Keine Daten";
    futureValueOutput.textContent = "Keine Daten";
    lossAmountOutput.textContent = "Keine Daten";
  }

  currentValueOutput.classList.toggle("is-empty", !hasAmount);
  futureValueOutput.classList.toggle("is-empty", !hasAmount);
  lossAmountOutput.classList.toggle("is-empty", !hasAmount);

  presetButtons.forEach((button) => {
    button.classList.toggle("is-selected", Number(button.dataset.amount) === normalizedAmount);
  });
}

amountInput?.addEventListener("input", () => {
  updateInflationResult(Number(amountInput.value));
});

presetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    amountInput.value = button.dataset.amount;
    updateInflationResult(Number(button.dataset.amount));
  });
});

updateInflationResult(Number(amountInput?.value || 0));

const vercelEventLabels = {
  yemian_ws: "页面内 WhatsApp 按钮点击",
  dibu_ws: "底部悬浮 WhatsApp 按钮点击",
  tingliu_10s: "停留超过 10 秒",
  tingliu_30s: "停留超过 30 秒",
  tingliu_60s: "停留超过 60 秒",
  dibu: "滚动到资料区域",
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

function trackMetaContact() {
  if (typeof window.fbq === "function") {
    window.fbq("track", "Contact");
  }
}

document.querySelector(".section-whatsapp")?.addEventListener("click", () => {
  trackMetaContact();
  trackVercelEvent("yemian_ws", {
    button_location: "inline",
    button_location_zh: "页面内容区",
  });
});

document.querySelector(".floating-whatsapp")?.addEventListener("click", () => {
  trackMetaContact();
  trackVercelEvent("dibu_ws", {
    button_location: "floating",
    button_location_zh: "底部悬浮",
  });
});

[
  ["tingliu_10s", 10_000],
  ["tingliu_30s", 30_000],
  ["tingliu_60s", 60_000],
].forEach(([eventName, delay]) => {
  window.setTimeout(() => {
    trackVercelEvent(eventName, {
      threshold_seconds: delay / 1000,
      threshold_zh: `停留 ${delay / 1000} 秒`,
    });
  }, delay);
});

const documentsSection = document.querySelector(".group-downloads");
const inlineWhatsapp = document.querySelector(".section-whatsapp");
const floatingWhatsapp = document.querySelector(".floating-whatsapp");

if (inlineWhatsapp && floatingWhatsapp && "IntersectionObserver" in window) {
  let inlineHasBeenSeen = false;

  const setFloatingVisibility = (visible) => {
    floatingWhatsapp.classList.toggle("is-visible", visible);
    floatingWhatsapp.setAttribute("aria-hidden", String(!visible));
  };

  const whatsappObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        inlineHasBeenSeen = true;
        setFloatingVisibility(false);
        return;
      }

      if (inlineHasBeenSeen) {
        setFloatingVisibility(true);
      }
    },
    { threshold: 0.01 },
  );

  whatsappObserver.observe(inlineWhatsapp);
}

if (documentsSection && "IntersectionObserver" in window) {
  const documentsObserver = new IntersectionObserver(
    (entries, observer) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        trackVercelEvent("dibu", {
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
