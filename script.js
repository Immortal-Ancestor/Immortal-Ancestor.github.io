"use strict";

const mobile = window.matchMedia("(max-width: 850px)");
const menu = document.querySelector(".menu");
const nav = document.querySelector("#navigation");
const navLinks = [...nav.querySelectorAll("a")];
const navSections = navLinks.map(link => document.querySelector(link.hash));

function setMenu(open) {
  menu.hidden = !mobile.matches;
  menu.setAttribute("aria-expanded", String(open && mobile.matches));
  nav.hidden = mobile.matches && !open;
}

setMenu(false);
mobile.addEventListener("change", () => setMenu(false));
menu.addEventListener("click", () => setMenu(menu.getAttribute("aria-expanded") !== "true"));
navLinks.forEach(link => link.addEventListener("click", () => {
  if (!mobile.matches) return;
  setMenu(false);
  const target = document.querySelector(link.hash);
  target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
}));
nav.addEventListener("keydown", event => {
  if (event.key !== "Escape" || !mobile.matches) return;
  setMenu(false);
  menu.focus();
});

const progress = document.querySelector(".read-progress");
let pending = false;

function updateNavigation() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.setProperty("--progress", scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0);
  const active = navSections.reduce((last, section, index) =>
    section.getBoundingClientRect().top <= 130 ? index : last, -1);
  navLinks.forEach((link, index) => {
    if (index === active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  pending = false;
}

function requestNavigationUpdate() {
  if (pending) return;
  pending = true;
  requestAnimationFrame(updateNavigation);
}

window.addEventListener("scroll", requestNavigationUpdate, { passive: true });
window.addEventListener("resize", requestNavigationUpdate);
updateNavigation();

const themeToggle = document.querySelector(".theme-toggle");
function syncThemeButton() {
  const light = document.documentElement.dataset.theme === "light";
  themeToggle.setAttribute("aria-pressed", String(light));
  document.querySelector('meta[name="theme-color"]').content = light ? "#f8f7f2" : "#090e18";
}
themeToggle.hidden = false;
syncThemeButton();
themeToggle.addEventListener("click", () => {
  const theme = document.documentElement.dataset.theme === "light" ? "dark" : "light";
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem("portfolio-theme", theme); } catch {}
  syncThemeButton();
});

const filters = document.querySelector(".filters");
const filterButtons = [...filters.querySelectorAll("button")];
const projects = [...document.querySelectorAll(".project")];
const roles = [...document.querySelectorAll(".timeline article")];
const interestNote = document.querySelector("#interest-note");
const interestLink = document.querySelector("#interest-experience");
const interestDescriptions = {
  all: "Browse four more projects by interest.",
  finance: "Explore financial risk and controls, then see how they connect to my experience.",
  research: "Explore policy and case research, plus my related university and data experience.",
  automation: "See how Python turned guest records into personalized invitations.",
  strategy: "Explore market entry, supplier payments and recommendations from a risk case."
};
document.querySelector(".explore").hidden = false;

filters.addEventListener("click", event => {
  const button = event.target.closest("button[data-filter]");
  if (!button) return;
  const filter = button.dataset.filter;
  filterButtons.forEach(item => item.setAttribute("aria-pressed", String(item === button)));
  let count = 0;
  projects.forEach(project => {
    const match = filter === "all" || project.dataset.category.split(" ").includes(filter);
    project.hidden = !match;
    if (match) {
      count += 1;
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        project.animate([{ opacity: 0.65 }, { opacity: 1 }], { duration: 180 });
      }
    }
  });
  let hasRelatedRoles = false;
  roles.forEach(role => {
    const match = role.dataset.interest.split(" ").includes(filter);
    role.classList.toggle("related-role", match);
    role.querySelector(".role-match").hidden = !match;
    hasRelatedRoles ||= match;
  });
  interestNote.textContent = filter === "all"
    ? interestDescriptions.all
    : (count === 1 ? "1 project. " : count + " projects. ") + interestDescriptions[filter];
  interestLink.hidden = !hasRelatedRoles && filter !== "automation";
  interestLink.href = hasRelatedRoles ? "#experience" : "#skills";
  interestLink.textContent = hasRelatedRoles ? "See related experience" : "See automation skills";
  requestNavigationUpdate();
});

const exposure = document.querySelector("#exposure");
const shock = document.querySelector("#shock");
const exposureValue = document.querySelector("#exposure-value");
const shockValue = document.querySelector("#shock-value");
const loss = document.querySelector("#loss");
const riskStatus = document.querySelector("#risk-status");
const simulator = document.querySelector("#fx");
const fxLine = document.querySelector("#fx-line");
const fxMarker = document.querySelector("#fx-marker");
const fxValue = document.querySelector("#fx-value");
const usd = new Intl.NumberFormat("en-CA", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const cad = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });
const compactMoney = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", notation: "compact", maximumFractionDigits: 0 });
const riskThreshold = 5;

function updateSimulator() {
  const exposurePercent = exposure.valueAsNumber;
  const shockPercent = shock.valueAsNumber;
  const portfolioLoss = exposurePercent * shockPercent / 100;
  const flagged = portfolioLoss > riskThreshold;
  exposureValue.textContent = exposurePercent + "%";
  shockValue.textContent = shockPercent + "%";
  exposure.setAttribute("aria-valuetext", exposureValue.textContent);
  shock.setAttribute("aria-valuetext", shockValue.textContent);
  loss.textContent = portfolioLoss.toFixed(2) + "%";
  riskStatus.textContent = flagged ? "Above threshold" : "Within threshold";
  simulator.classList.toggle("is-risk", flagged);
  fxLine.setAttribute("d", "M42 140L336 " + (140 - 120 * exposurePercent / 100));
  fxMarker.setAttribute("cx", 42 + 294 * shockPercent / Number(shock.max));
  fxMarker.setAttribute("cy", 140 - 120 * portfolioLoss / Number(shock.max));
  fxValue.textContent = usd.format(100000 * (1 - portfolioLoss / 100));
}

document.querySelectorAll(".sim-inputs").forEach(inputs => { inputs.hidden = false; });
exposure.addEventListener("input", updateSimulator);
shock.addEventListener("input", updateSimulator);
updateSimulator();

const cash = document.querySelector("#cash-flow");
const discount = document.querySelector("#discount");
const npv = document.querySelector("#npv");
const npvResult = npv.querySelector("#npv-value");
const npvStatus = npv.querySelector("#npv-status");
const cashValue = npv.querySelector("#cash-value");
const rateValue = npv.querySelector("#rate-value");
const npvLine = npv.querySelector("#npv-line");
const npvZero = npv.querySelector("#npv-zero");
const npvMarker = npv.querySelector("#npv-marker");
const npvLower = npv.querySelector("#npv-lower");
const npvUpper = npv.querySelector("#npv-upper");

function presentValue(cashFlow, discountPercent) {
  let value = -100000;
  for (let year = 1; year <= 5; year += 1) {
    value += cashFlow / (1 + discountPercent / 100) ** year;
  }
  return value;
}

function updateNpv() {
  const cashFlow = cash.valueAsNumber;
  const rate = discount.valueAsNumber;
  const maximumRate = Number(discount.max);
  const value = presentValue(cashFlow, rate);
  const minimum = Math.min(0, presentValue(cashFlow, maximumRate));
  const maximum = Math.max(0, presentValue(cashFlow, 0));
  const pad = Math.max(5000, (maximum - minimum) * 0.1);
  const lower = Math.floor((minimum - pad) / 5000) * 5000;
  const upper = Math.ceil((maximum + pad) / 5000) * 5000;
  const x = percent => 66 + 270 * percent / maximumRate;
  const y = amount => 140 - 120 * (amount - lower) / (upper - lower);
  const points = Array.from({ length: 21 }, (_, i) => {
    const sample = maximumRate * i / 20;
    return (i === 0 ? "M" : "L") + x(sample) + " " + y(presentValue(cashFlow, sample));
  });
  npvLine.setAttribute("d", points.join(" "));
  npvZero.setAttribute("d", "M66 " + y(0) + "H336");
  npvMarker.setAttribute("cx", x(rate));
  npvMarker.setAttribute("cy", y(value));
  npvLower.textContent = compactMoney.format(lower);
  npvUpper.textContent = compactMoney.format(upper);
  cashValue.textContent = cad.format(cashFlow);
  rateValue.textContent = rate + "%";
  cash.setAttribute("aria-valuetext", cashValue.textContent);
  discount.setAttribute("aria-valuetext", rateValue.textContent);
  const roundedValue = Math.round(value);
  npvResult.textContent = cad.format(roundedValue);
  npvStatus.textContent = roundedValue === 0 ? "Break-even" : roundedValue > 0 ? "Positive NPV" : "Negative NPV";
  npv.classList.toggle("is-risk", roundedValue < 0);
}

document.querySelector("#npv-chart").hidden = false;
cash.addEventListener("input", updateNpv);
discount.addEventListener("input", updateNpv);
updateNpv();

const email = document.querySelector(".contact-email");
const copyButton = document.querySelector("#copy-email");
const copyStatus = document.querySelector("#copy-status");
if (navigator.clipboard?.writeText) {
  copyButton.hidden = false;
  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(email.textContent);
      copyStatus.textContent = "Email copied.";
    } catch {
      copyStatus.textContent = "Couldn’t copy automatically. Select the email address to copy it.";
    }
  });
}

const draft = document.querySelector(".contact-draft");
draft.hidden = false;
draft.querySelector("form").addEventListener("submit", event => {
  event.preventDefault();
  const fields = new FormData(event.currentTarget);
  const name = fields.get("name").trim();
  const subject = "Portfolio inquiry from " + name;
  const body = ["Hi Niyat,", "", fields.get("message").trim(), "", "Best,", name, fields.get("email").trim()].join("\n");
  window.location.href = email.href + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
});

document.querySelector("#year").textContent = new Date().getFullYear();
