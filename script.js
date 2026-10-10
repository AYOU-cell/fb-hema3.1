if (window.lucide) {
  window.lucide.createIcons();
}

const annualInflationAssumption = 0.027;
const fiveYearInflationFactor = (1 + annualInflationAssumption) ** 5;
const currentValueOutput = document.querySelector("#current-value");
const futureValueOutput = document.querySelector("#future-value");
const currentValueNumber = currentValueOutput.querySelector(".value-number");
const futureValueNumber = futureValueOutput.querySelector(".value-number");
const futureLossInline = document.querySelector("#future-loss-inline");
const presetButtons = document.querySelectorAll("[data-amount]");
const customAmountToggle = document.querySelector(".custom-amount-toggle");
const customAmountField = document.querySelector(".custom-amount-field");
const customAmountInput = document.querySelector("#custom-amount-input");
const calculatorWhatsapp = document.querySelector(".calculator-whatsapp");
const calculatorWhatsappPitch = document.querySelector(".calculator-whatsapp-pitch");
const calculatorWhatsappNote = document.querySelector(".calculator-whatsapp-note");
const autoMatchNote = document.querySelector(".auto-match-note");
let amountInputTracked = false;
let amountManuallySelected = false;

const formatAmount = (amount) =>
  new Intl.NumberFormat("de-DE", {
    maximumFractionDigits: 0,
  }).format(amount);

function updateInflationResult(amount) {
  const hasAmount = Number.isFinite(amount) && amount > 0;
  const normalizedAmount = hasAmount ? amount : 0;
  const currentValue = normalizedAmount;
  const futureValue = normalizedAmount / fiveYearInflationFactor;
  const futureLossAmount = normalizedAmount - futureValue;

  if (hasAmount) {
    currentValueNumber.textContent = formatAmount(currentValue);
    futureValueNumber.textContent = formatAmount(futureValue);
    futureLossInline.textContent = `(-${formatAmount(futureLossAmount)})`;
  } else {
    currentValueNumber.textContent = "Keine Daten";
    futureValueNumber.textContent = "Keine Daten";
    futureLossInline.textContent = "";
  }

  currentValueNumber.classList.toggle("is-empty", !hasAmount);
  futureValueNumber.classList.toggle("is-empty", !hasAmount);
  calculatorWhatsapp.hidden = !hasAmount;
  calculatorWhatsappPitch.hidden = !hasAmount;
  calculatorWhatsappNote.hidden = !hasAmount;

  presetButtons.forEach((button) => {
    button.classList.toggle("is-selected", Number(button.dataset.amount) === normalizedAmount);
  });
}

presetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const amount = Number(button.dataset.amount);
    amountManuallySelected = true;
    autoMatchNote.hidden = true;
    customAmountField.hidden = true;
    customAmountToggle.setAttribute("aria-expanded", "false");
    customAmountToggle.classList.remove("is-selected");
    updateInflationResult(amount);
    trackAmountInput(amount, "preset");
  });
});

customAmountToggle.addEventListener("click", () => {
  amountManuallySelected = true;
  autoMatchNote.hidden = true;
  customAmountField.hidden = false;
  customAmountToggle.setAttribute("aria-expanded", "true");
  customAmountToggle.classList.add("is-selected");
  presetButtons.forEach((button) => button.classList.remove("is-selected"));
  customAmountInput.value = "";
  updateInflationResult(0);
  customAmountInput.focus();
});

customAmountInput.addEventListener("input", () => {
  const amount = Number(customAmountInput.value);
  updateInflationResult(amount);
  customAmountToggle.classList.toggle("is-selected", Number.isFinite(amount) && amount > 0);
  trackAmountInput(amount, "manual");
});

updateInflationResult(0);

window.setTimeout(() => {
  if (amountManuallySelected) {
    return;
  }

  updateInflationResult(10_000);
  autoMatchNote.hidden = false;
}, 5_000);

const vercelEventLabels = {
  whatsapp_click: "点击 WhatsApp",
  shuru_jine: "输入金额",
  tingliu_10s: "停留超过 10 秒",
  tingliu_20s: "停留超过 20 秒",
  tingliu_30s: "停留超过 30 秒",
  diyiping: "浏览到第一屏",
  dierping: "浏览到第二屏",
  disanping: "浏览到第三屏",
  dibu: "滚动到页面底部",
  ziliaoqu: "浏览到群组资料区域",
};

function trackVercelEvent(name, data = {}) {
  const label = vercelEventLabels[name] || name;

  if (typeof window.fbq === "function") {
    window.fbq("trackCustom", name, {
      event_label_zh: label,
      ...data,
    });
  }

  if (typeof window.va === "function") {
    window.va("event", {
      name,
      data: {
        label,
        ...data,
      },
    });
  }
}

function trackAmountInput(amount, source) {
  if (amountInputTracked || !Number.isFinite(amount) || amount <= 0) {
    return;
  }

  amountInputTracked = true;
  trackVercelEvent("shuru_jine", {
    input_source: source,
    input_source_zh: source === "manual" ? "其他金额输入框" : "预设金额按钮",
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
    trackVercelEvent("whatsapp_click", {
      button_location: location,
      button_location_zh: location === "calculator" ? "计算器下方" : "页面内容区",
    });
  });
});

document.querySelector(".floating-whatsapp")?.addEventListener("click", () => {
  trackMetaContact();
  trackVercelEvent("whatsapp_click", {
    button_location: "floating",
    button_location_zh: "底部悬浮",
  });
});

[
  ["tingliu_10s", 10_000],
  ["tingliu_20s", 20_000],
  ["tingliu_30s", 30_000],
].forEach(([eventName, delay]) => {
  window.setTimeout(() => {
    trackVercelEvent(eventName, {
      threshold_seconds: delay / 1000,
      threshold_zh: `停留 ${delay / 1000} 秒`,
    });
  }, delay);
});

const trackedScrollMilestones = new Set();

function trackScrollMilestones() {
  const viewportHeight = window.innerHeight;
  const scrollPosition = window.scrollY;
  const pageBottom = document.documentElement.scrollHeight - viewportHeight;
  const milestones = [
    ["diyiping", scrollPosition < viewportHeight],
    ["dierping", scrollPosition >= viewportHeight],
    ["disanping", scrollPosition >= viewportHeight * 2],
    ["dibu", scrollPosition >= pageBottom - 2],
  ];

  milestones.forEach(([eventName, reached]) => {
    if (!reached || trackedScrollMilestones.has(eventName)) {
      return;
    }

    trackedScrollMilestones.add(eventName);
    trackVercelEvent(eventName);
  });
}

trackScrollMilestones();
window.addEventListener("scroll", trackScrollMilestones, { passive: true });
window.addEventListener("resize", trackScrollMilestones);

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

  const syncFloatingVisibility = () => {
    let hasVisibleInlineButton = false;

    inlineWhatsappButtons.forEach((button) => {
      if (button.hidden) {
        return;
      }

      const rect = button.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        inlineHasBeenSeen = true;
      }

      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        hasVisibleInlineButton = true;
      }
    });

    setFloatingVisibility(inlineHasBeenSeen && !hasVisibleInlineButton);
  };

  const whatsappObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          inlineHasBeenSeen = true;
          visibleInlineButtons.add(entry.target);
        } else {
          visibleInlineButtons.delete(entry.target);
          if (entry.boundingClientRect.bottom < 0) {
            inlineHasBeenSeen = true;
          }
        }
      });

      setFloatingVisibility(inlineHasBeenSeen && visibleInlineButtons.size === 0);
    },
    { threshold: 0.01 },
  );

  inlineWhatsappButtons.forEach((button) => whatsappObserver.observe(button));
  window.addEventListener("scroll", syncFloatingVisibility, { passive: true });
  window.addEventListener("resize", syncFloatingVisibility);
}

if (documentsSection && "IntersectionObserver" in window) {
  const documentsObserver = new IntersectionObserver(
    (entries, observer) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        trackVercelEvent("ziliaoqu", {
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
