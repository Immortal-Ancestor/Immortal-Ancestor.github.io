"use strict";

const mobile = window.matchMedia("(max-width: 720px)");
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

const filters = document.querySelector(".filters");
const filterButtons = [...filters.querySelectorAll("button")];
const projects = [...document.querySelectorAll(".project")];
const filterCount = filters.querySelector(".filter-count");
filters.hidden = false;

filters.addEventListener("click", event => {
  const button = event.target.closest("button[data-filter]");
  if (!button) return;
  const filter = button.dataset.filter;
  filterButtons.forEach(item => item.setAttribute("aria-pressed", String(item === button)));
  let count = 0;
  projects.forEach(project => {
    project.hidden = filter !== "all" && !project.dataset.category.split(" ").includes(filter);
    if (!project.hidden) count += 1;
  });
  filterCount.textContent = count === 1 ? "1 project" : count + " projects";
  requestNavigationUpdate();
});

const exposure = document.querySelector("#exposure");
const shock = document.querySelector("#shock");
const exposureValue = document.querySelector("#exposure-value");
const shockValue = document.querySelector("#shock-value");
const loss = document.querySelector("#loss");
const riskStatus = document.querySelector("#risk-status");
const simulator = document.querySelector(".simulator");
const riskThreshold = 5;

function updateSimulator() {
  const exposurePercent = exposure.valueAsNumber;
  const shockPercent = shock.valueAsNumber;
  const portfolioLoss = exposurePercent * shockPercent / 100;
  const flagged = portfolioLoss > riskThreshold;
  exposureValue.textContent = exposurePercent + "%";
  shockValue.textContent = shockPercent + "%";
  loss.textContent = portfolioLoss.toFixed(2) + "%";
  riskStatus.textContent = flagged ? "Above threshold" : "Within threshold";
  simulator.classList.toggle("is-risk", flagged);
  simulator.style.setProperty("--loss-width", portfolioLoss / Number(shock.max) * 100 + "%");
}

document.querySelector(".sim-inputs").hidden = false;
exposure.addEventListener("input", updateSimulator);
shock.addEventListener("input", updateSimulator);
updateSimulator();

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
