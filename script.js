const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];

document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;

  // Reveal-on-scroll. Keep the observer lightweight and avoid per-element delays on phones.
  const reveal = $$(".reveal");

  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.08,
      rootMargin: "0px 0px -30px 0px"
    });

    reveal.forEach((el, i) => {
      if (!coarsePointer) {
        el.style.transitionDelay = `${Math.min(i * 35, 180)}ms`;
      }
      io.observe(el);
    });
  } else {
    reveal.forEach(el => el.classList.add("visible"));
  }

  // Mobile menu.
  const menuBtn = $(".menu-btn");
  const menu = $(".mobile-menu");

  if (menuBtn && menu) {
    const closeMenu = () => {
      menu.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
    };

    menuBtn.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });

    $$(".mobile-menu a").forEach(a => {
      a.addEventListener("click", closeMenu);
    });
  }

  // Tool page transition.
  const transition = $(".page-transition");

  const resetPageTransition = () => {
    if (!transition) return;
    transition.classList.remove("is-leaving", "is-entering");
    transition.setAttribute("aria-hidden", "true");
  };

  const openTool = (card, event) => {
    if (!transition) return;

    // Let browser shortcuts / new-tab gestures work normally.
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    ) return;

    const href = card.href;
    if (!href) return;

    event.preventDefault();

    const title = card.dataset.tool || "Humble Studio Tool";
    const label = $(".transition-card span");

    if (label) {
      label.textContent = `OPENING ${title.toUpperCase()}...`;
    }

    transition.setAttribute("aria-hidden", "false");
    transition.classList.add("is-leaving");

    // Give the animation enough time to be visible without making navigation feel slow.
    window.setTimeout(() => {
      window.location.assign(href);
    }, 420);
  };

  $$(".tool-card[href]").forEach(card => {
    card.addEventListener("click", event => openTool(card, event));
  });

  // IMPORTANT:
  // Safari/Chrome/Firefox can restore this page from the back-forward cache.
  // The old .is-leaving class would otherwise remain visible after pressing Back.
  window.addEventListener("pageshow", resetPageTransition);
  window.addEventListener("popstate", resetPageTransition);
  window.addEventListener("pagehide", () => {
    // Do not keep the overlay in the cached page.
    resetPageTransition();
  });

  // Reset after browser restores a page from history.
  resetPageTransition();
});

// Scroll progress bar — throttled with requestAnimationFrame for smoother scrolling.
(() => {
  const bar = document.querySelector(".scroll-progress");
  if (!bar) return;

  let ticking = false;

  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0
      ? Math.min(100, Math.max(0, (window.scrollY / max) * 100))
      : 0;

    bar.style.width = `${progress}%`;
    ticking = false;
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  update();
})();

// Small 3D tilt only on desktop. Never attach pointermove handlers to touch devices.
(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (window.matchMedia("(pointer: coarse)").matches) return;

  document.querySelectorAll(".tool-card").forEach(card => {
    let raf = 0;

    card.addEventListener("pointermove", e => {
      if (raf) return;

      raf = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;

        card.style.transform =
          `perspective(900px) rotateX(${(-y * 3).toFixed(2)}deg) rotateY(${(x * 3).toFixed(2)}deg) translateY(-5px)`;

        raf = 0;
      });
    }, { passive: true });

    card.addEventListener("pointerleave", () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      card.style.transform = "";
    });
  });
})();
