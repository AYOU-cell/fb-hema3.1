if (window.lucide) {
  window.lucide.createIcons();
}

const inflationBaseIndex = 110.2;
const inflationCurrentIndex = 125.8;
const inflation2027Rate = 0.027;
const inflation2027Index = inflationCurrentIndex * (1 + inflation2027Rate);
const currentValueOutput = document.querySelector("#current-value");
const futureValueOutput = document.querySelector("#future-value");
const currentValueNumber = currentValueOutput.querySelector(".value-number");
const futureValueNumber = futureValueOutput.querySelector(".value-number");
const currentLossInline = document.querySelector("#current-loss-inline");
const futureLossInline = document.querySelector("#future-loss-inline");
const presetButtons = document.querySelectorAll("[data-amount]");
const calculatorWhatsapp = document.querySelector(".calculator-whatsapp");
let amountInputTracked = false;

const formatAmount = (amount) =>
  new Intl.NumberFormat("de-DE", {
    maximumFractionDigits: 0,
  }).format(amount);

function updateInflationResult(amount) {
  const hasAmount = Number.isFinite(amount) && amount > 0;
  const normalizedAmount = hasAmount ? amount : 0;
  const currentRatio = inflationBaseIndex / inflationCurrentIndex;
  const futureRatio = inflationBaseIndex / inflation2027Index;
  const currentValue = normalizedAmount * currentRatio;
  const futureValue = normalizedAmount * futureRatio;
  const currentLossAmount = normalizedAmount - currentValue;
  const futureLossAmount = normalizedAmount - futureValue;

  if (hasAmount) {
    currentValueNumber.textContent = formatAmount(currentValue);
    futureValueNumber.textContent = formatAmount(futureValue);
    currentLossInline.textContent = `(-${formatAmount(currentLossAmount)})`;
    futureLossInline.textContent = `(-${formatAmount(futureLossAmount)})`;
  } else {
    currentValueNumber.textContent = "Keine Daten";
    futureValueNumber.textContent = "Keine Daten";
    currentLossInline.textContent = "";
    futureLossInline.textContent = "";
  }

  currentValueNumber.classList.toggle("is-empty", !hasAmount);
  futureValueNumber.classList.toggle("is-empty", !hasAmount);
  calculatorWhatsapp.hidden = !hasAmount;

  presetButtons.forEach((button) => {
    button.classList.toggle("is-selected", Number(button.dataset.amount) === normalizedAmount);
  });
}

presetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const amount = Number(button.dataset.amount);
    updateInflationResult(amount);
    trackAmountInput(amount, "preset");
  });
});

updateInflationResult(0);

const vercelEventLabels = {
  yemian_ws: "页面内 WhatsApp 按钮点击",
  dibu_ws: "底部悬浮 WhatsApp 按钮点击",
  shuru_jine: "输入金额",
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

function trackAmountInput(amount, source) {
  if (amountInputTracked || !Number.isFinite(amount) || amount <= 0) {
    return;
  }

  amountInputTracked = true;
  trackVercelEvent("shuru_jine", {
    input_source: source,
    input_source_zh: "预设金额按钮",
  });
}

function trackMetaContact() {
  if (typeof window.fbq === "function") {
    window.fbq("track", "Contact");
  }
}

document.querySelectorAll(".section-whatsapp").forEach((button) => {
  button.addEventListener("click", () => {
    const location = button.dataset.buttonLocation || "content";
    trackMetaContact();
    trackVercelEvent("yemian_ws", {
      button_location: location,
      button_location_zh: location === "calculator" ? "计算器下方" : "页面内容区",
    });
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
const inlineWhatsappButtons = document.querySelectorAll(".section-whatsapp");
const floatingWhatsapp = document.querySelector(".floating-whatsapp");

if (inlineWhatsappButtons.length && floatingWhatsapp && "IntersectionObserver" in window) {
  let inlineHasBeenSeen = false;
  const visibleInlineButtons = new Set();

  const setFloatingVisibility = (visible) => {
    floatingWhatsapp.classList.toggle("is-visible", visible);
    floatingWhatsapp.setAttribute("aria-hidden", String(!visible));
  };

  const whatsappObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          inlineHasBeenSeen = true;
          visibleInlineButtons.add(entry.target);
        } else {
          visibleInlineButtons.delete(entry.target);
        }
      });

      setFloatingVisibility(inlineHasBeenSeen && visibleInlineButtons.size === 0);
    },
    { threshold: 0.01 },
  );

  inlineWhatsappButtons.forEach((button) => whatsappObserver.observe(button));
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
