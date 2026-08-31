const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];

document.addEventListener("DOMContentLoaded", () => {
  const reveal = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    }, {threshold:.12});
    reveal.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i * 45, 250)}ms`;
      io.observe(el);
    });
  } else reveal.forEach(el => el.classList.add("visible"));

  const menuBtn = $(".menu-btn");
  const menu = $(".mobile-menu");
  if (menuBtn && menu) {
    menuBtn.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    $$(".mobile-menu a").forEach(a => a.addEventListener("click", () => {
      menu.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
    }));
  }

  // Smooth transition for the external Humble Studio Tool link.
  const transition = $(".page-transition");
  $$(".tool-card[href]").forEach(card => {
    card.addEventListener("click", event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const href = card.href;
      if (!href) return;
      event.preventDefault();

      const title = card.dataset.tool || "Humble Studio Tool";
      const label = $(".transition-card span");
      if (label) label.textContent = `OPENING ${title.toUpperCase()}...`;

      transition.classList.add("is-leaving");
      setTimeout(() => window.location.href = href, 560);
    });
  });
});


// Scroll progress bar.
(() => {
  const bar = document.querySelector(".scroll-progress");
  if (!bar) return;

  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? (window.scrollY / max) * 100 : 0;
    bar.style.width = `${progress}%`;
  };
  window.addEventListener("scroll", update, {passive:true});
  window.addEventListener("resize", update);
  update();
})();

// Small 3D tilt on desktop tool cards.
(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (window.matchMedia("(pointer: coarse)").matches) return;

  document.querySelectorAll(".tool-card").forEach(card => {
    card.addEventListener("pointermove", e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      card.style.transform =
        `perspective(900px) rotateX(${(-y * 3).toFixed(2)}deg) rotateY(${(x * 3).toFixed(2)}deg) translateY(-5px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
})();
