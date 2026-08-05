/* =========================================================
   Niyat Thapa — Portfolio
   Interactive features:
   1. Mobile navigation toggle
   2. Scrollspy (highlights the current section in the nav)
   3. Dynamic copyright year
   4. Scroll-to-top button
   5. Reveal-on-scroll animation (respects prefers-reduced-motion)
   6. Animated count-up for the hero stat strip
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* ---------- 1. Mobile navigation toggle ---------- */
    const navToggle = document.querySelector("#navToggle");
    const navLinks = document.querySelector("#navLinks");

    if (navToggle && navLinks) {
        navToggle.addEventListener("click", function () {
            const isOpen = navLinks.classList.toggle("show");
            navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });

        // Close the mobile menu whenever a nav link is clicked
        navLinks.querySelectorAll(".nav-link").forEach(function (link) {
            link.addEventListener("click", function () {
                navLinks.classList.remove("show");
                navToggle.setAttribute("aria-expanded", "false");
            });
        });
    }

    /* ---------- 2. Scrollspy: highlight active section in nav ---------- */
    const sections = document.querySelectorAll("main section[id]");
    const navLinkEls = document.querySelectorAll(".nav-link");

    function setActiveLink(id) {
        navLinkEls.forEach(function (link) {
            const match = link.getAttribute("href") === "#" + id;
            link.classList.toggle("active", match);
        });
    }

    if ("IntersectionObserver" in window && sections.length) {
        const spy = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        setActiveLink(entry.target.id);
                    }
                });
            },
            { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
        );
        sections.forEach(function (section) { spy.observe(section); });
    }

    /* ---------- 3. Dynamic copyright year ---------- */
    const yearEl = document.querySelector("#year");
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    /* ---------- 4. Scroll-to-top button ---------- */
    const scrollTopBtn = document.querySelector("#scrollTop");
    if (scrollTopBtn) {
        window.addEventListener("scroll", function () {
            scrollTopBtn.classList.toggle("visible", window.scrollY > 500);
        });

        scrollTopBtn.addEventListener("click", function () {
            const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
        });
    }

    /* ---------- 5. Reveal-on-scroll animation ---------- */
    const revealEls = document.querySelectorAll(".reveal");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if ("IntersectionObserver" in window && revealEls.length && !prefersReducedMotion) {
        const reveal = new IntersectionObserver(
            function (entries, observer) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("in-view");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15 }
        );
        revealEls.forEach(function (el) { reveal.observe(el); });
    } else {
        // No IntersectionObserver support, or the user prefers reduced motion:
        // just show everything immediately.
        revealEls.forEach(function (el) { el.classList.add("in-view"); });
    }

    /* ---------- 6. Animated count-up for the hero stat strip ---------- */
    const statEls = document.querySelectorAll(".stat-value");

    function animateCount(el) {
        const target = parseFloat(el.dataset.count);
        const decimals = parseInt(el.dataset.decimals || "0", 10);
        if (isNaN(target)) return;

        const duration = 1100;
        const startTime = performance.now();

        function step(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            el.textContent = (target * eased).toFixed(decimals);
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = target.toFixed(decimals);
            }
        }
        requestAnimationFrame(step);
    }

    if ("IntersectionObserver" in window && statEls.length && !prefersReducedMotion) {
        const statObserver = new IntersectionObserver(
            function (entries, observer) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.textContent = "0";
                        animateCount(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.4 }
        );
        statEls.forEach(function (el) { statObserver.observe(el); });
    }
    // If reduced motion is preferred or IntersectionObserver is unsupported,
    // the static values already in the HTML are left as-is.

});
