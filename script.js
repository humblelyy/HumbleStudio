"use strict";


/* ==========================================================
   HUMBLE STUDIO PAGE LOADER
========================================================== */

(() => {

  const loader = document.getElementById("humble-loader");
  if (!loader) return;

  const hideLoader = () => {
    loader.classList.add("is-hidden");
    window.setTimeout(() => loader.remove(), 260);
  };

  if (document.readyState === "complete") {
    window.setTimeout(hideLoader, 120);
  } else {
    window.addEventListener("load", () => window.setTimeout(hideLoader, 120), { once: true });
  }

  // Never leave the page covered if a third-party resource is slow.
  window.setTimeout(hideLoader, 2200);

})();


/* ==========================================================
   HUMBLE STUDIO
   PERFORMANCE + NAVIGATION
========================================================== */


/* ==========================================================
   ELEMENTS
========================================================== */

const body =
  document.body;


const transition =
  document.querySelector(
    ".page-transition"
  );


const transitionTitle =
  document.querySelector(
    "#transition-title"
  );


const transitionPercent =
  document.querySelector(
    "#transition-percent"
  );


const transitionFill =
  document.querySelector(
    "#transition-line-fill"
  );


const menuButton =
  document.querySelector(
    ".menu-btn"
  );


const mobileMenu =
  document.querySelector(
    ".mobile-menu"
  );


const mobileLinks =
  document.querySelectorAll(
    ".mobile-menu a"
  );


const revealElements =
  document.querySelectorAll(
    ".reveal"
  );


let toolLinks =
  document.querySelectorAll(
    ".tool-card[data-tool]"
  );


const progressBar =
  document.querySelector(
    ".scroll-progress"
  );


let navigating =
  false;


let transitionTimer =
  null;


let progressTicking =
  false;


/* ==========================================================
   MOBILE MENU
========================================================== */

function closeMobileMenu() {

  if (!menuButton || !mobileMenu) {
    return;
  }


  menuButton.classList.remove(
    "active"
  );


  mobileMenu.classList.remove(
    "open"
  );


  menuButton.setAttribute(
    "aria-expanded",
    "false"
  );

}


function openMobileMenu() {

  if (!menuButton || !mobileMenu) {
    return;
  }


  menuButton.classList.add(
    "active"
  );


  mobileMenu.classList.add(
    "open"
  );


  menuButton.setAttribute(
    "aria-expanded",
    "true"
  );

}


if (menuButton) {

  menuButton.addEventListener(
    "click",
    () => {

      if (
        mobileMenu.classList.contains(
          "open"
        )
      ) {

        closeMobileMenu();

      } else {

        openMobileMenu();

      }

    }
  );

}


mobileLinks.forEach(
  link => {

    link.addEventListener(
      "click",
      closeMobileMenu
    );

  }
);


document.addEventListener(
  "click",
  event => {

    if (
      !mobileMenu ||
      !menuButton
    ) {
      return;
    }


    if (
      mobileMenu.classList.contains(
        "open"
      ) &&
      !mobileMenu.contains(
        event.target
      ) &&
      !menuButton.contains(
        event.target
      )
    ) {

      closeMobileMenu();

    }

  }
);


/* ==========================================================
   SCROLL PROGRESS
========================================================== */

function updateScrollProgress() {

  if (!progressBar) {
    return;
  }


  const scrollTop =
    window.scrollY;


  const maxScroll =
    document.documentElement.scrollHeight -
    window.innerHeight;


  if (maxScroll <= 0) {

    progressBar.style.width =
      "0%";

    return;

  }


  const percent =
    Math.min(
      100,
      Math.max(
        0,
        (scrollTop / maxScroll) * 100
      )
    );


  progressBar.style.width =
    `${percent}%`;

}


function requestScrollUpdate() {

  if (progressTicking) {
    return;
  }


  progressTicking =
    true;


  requestAnimationFrame(
    () => {

      updateScrollProgress();

      progressTicking =
        false;

    }
  );

}


window.addEventListener(
  "scroll",
  requestScrollUpdate,
  {
    passive: true
  }
);


window.addEventListener(
  "resize",
  requestScrollUpdate,
  {
    passive: true
  }
);


updateScrollProgress();


/* ==========================================================
   REVEAL ANIMATIONS
========================================================== */

const revealObserver =
  new IntersectionObserver(
    entries => {

      entries.forEach(
        entry => {

          if (
            !entry.isIntersecting
          ) {
            return;
          }


          entry.target.classList.add(
            "visible"
          );


          revealObserver.unobserve(
            entry.target
          );

        }
      );

    },
    {
      threshold: .08,

      rootMargin:
        "0px 0px -50px 0px"
    }
  );


revealElements.forEach(
  element => {

    revealObserver.observe(
      element
    );

  }
);


/* ==========================================================
   HERO REVEAL
========================================================== */

window.addEventListener(
  "load",
  () => {

    document
      .querySelectorAll(
        ".hero .reveal"
      )
      .forEach(
        element => {

          element.classList.add(
            "visible"
          );

        }
      );

  }
);


/* ==========================================================
   TOOL TRANSITION
========================================================== */

function setTransitionPosition(
  element
) {

  const rect =
    element.getBoundingClientRect();


  const x =
    (
      (rect.left + rect.width / 2) /
      window.innerWidth
    ) * 100;


  const y =
    (
      (rect.top + rect.height / 2) /
      window.innerHeight
    ) * 100;


  transition.style.setProperty(
    "--transition-x",
    `${x}%`
  );


  transition.style.setProperty(
    "--transition-y",
    `${y}%`
  );

}


function resetTransition() {

  if (
    transitionTimer !== null
  ) {

    clearTimeout(
      transitionTimer
    );

    transitionTimer =
      null;

  }


  if (transition) {

    transition.classList.remove(
      "active"
    );

  }


  toolLinks.forEach(
    link => {

      link.classList.remove(
        "is-opening"
      );

    }
  );


  navigating =
    false;


  if (transitionPercent) {

    transitionPercent.textContent =
      "0";

  }


  if (transitionFill) {

    transitionFill.style.width =
      "0%";

  }

}


function animateTransitionCounter() {

  if (
    !transitionPercent ||
    !transitionFill
  ) {
    return;
  }


  let start =
    null;


  const duration =
    720;


  function frame(timestamp) {

    if (start === null) {
      start = timestamp;
    }


    const elapsed =
      timestamp - start;


    const progress =
      Math.min(
        elapsed / duration,
        1
      );


    const eased =
      1 -
      Math.pow(
        1 - progress,
        3
      );


    const value =
      Math.round(
        eased * 100
      );


    transitionPercent.textContent =
      value;


    transitionFill.style.width =
      `${value}%`;


    if (progress < 1) {

      requestAnimationFrame(
        frame
      );

    }

  }


  requestAnimationFrame(
    frame
  );

}


function openTool(
  link
) {

  if (
    navigating ||
    !transition
  ) {
    return;
  }


  const destination =
    link.href;


  if (!destination) {
    return;
  }


  navigating =
    true;


  /* ----------------------------------------------
     Position the opening animation
  ---------------------------------------------- */

  setTransitionPosition(
    link
  );


  /* ----------------------------------------------
     Tool name
  ---------------------------------------------- */

  const toolName =
    (link.dataset.tool || "HUMBLE TOOL").trim() ||
    "HUMBLE TOOL";


  if (transitionTitle) {

    transitionTitle.textContent =
      toolName.toUpperCase();

  }


  /* ----------------------------------------------
     Highlight clicked card
  ---------------------------------------------- */

  link.classList.add(
    "is-opening"
  );


  /* ----------------------------------------------
     Open full screen
  ---------------------------------------------- */

  requestAnimationFrame(
    () => {

      transition.classList.add(
        "active"
      );

      animateTransitionCounter();

    }
  );


  /* ----------------------------------------------
     Redirect after animation
  ---------------------------------------------- */

  transitionTimer =
    window.setTimeout(
      () => {

        window.location.href =
          destination;

      },
      820
    );

}


function bindToolLinks() {

  toolLinks =
    document.querySelectorAll(
      ".tool-card[data-tool]"
    );

  toolLinks.forEach(
    link => {

      if (link.dataset.humbleBound === "true") {
        return;
      }

      link.dataset.humbleBound = "true";

      link.addEventListener(
        "click",
        event => {

          /*
            Allow normal browser behaviour
            for modifier clicks.
          */

          if (
            event.button !== 0 ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey ||
            event.altKey
          ) {

            return;

          }

          event.preventDefault();

          if (navigating) {
            return;
          }

          openTool(link);

        }
      );

    }
  );
}

bindToolLinks();

document.addEventListener(
  "humble:tools-rendered",
  () => {
    bindToolLinks();
  }
);


/* ==========================================================
   BACK BUTTON / BFCACHE FIX
========================================================== */

/*
  pageshow fires when the browser restores
  the page through Back/Forward navigation,
  including bfcache restoration.
*/

window.addEventListener(
  "pageshow",
  event => {

    resetTransition();

    closeMobileMenu();

    updateScrollProgress();

  }
);


/*
  Also clean the screen when the page
  becomes visible again.
*/

document.addEventListener(
  "visibilitychange",
  () => {

    if (
      document.visibilityState ===
      "visible"
    ) {

      resetTransition();

    }

  }
);


/* ==========================================================
   ESCAPE
========================================================== */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape"
    ) {

      closeMobileMenu();

    }

  }
);


/* ==========================================================
   INITIAL PAGE POSITION
========================================================== */

window.addEventListener(
  "load",
  () => {

    if (
      window.location.hash === ""
    ) {

      window.scrollTo(
        0,
        0
      );

    }

  }
);


/* ==========================================================
   IMAGE ERROR SAFETY
========================================================== */

document
  .querySelectorAll("img")
  .forEach(
    image => {

      image.addEventListener(
        "error",
        () => {

          image.classList.add(
            "image-error"
          );

        }
      );

    }
  );


/* ==========================================================
   READY
========================================================== */

document.documentElement.classList.add(
  "js-ready"
);


/* ==========================================================
   COOKIE NOTICE
========================================================== */

(() => {

  const banner = document.getElementById("cookie-banner");
  const accept = document.getElementById("cookie-accept");
  const key = "humble_cookie_notice";

  if (!banner || !accept) return;

  try {
    if (localStorage.getItem(key) !== "accepted") {
      banner.hidden = false;
    }
  } catch {
    banner.hidden = false;
  }

  accept.addEventListener("click", () => {
    try {
      localStorage.setItem(key, "accepted");
    } catch {}
    banner.hidden = true;
  });

})();

/* ==========================================================
   SEMI-NEOBRUTALIST NAV — ACTIVE SECTION
========================================================== */
(() => {
  const navLinks = Array.from(document.querySelectorAll(".desktop-nav a[href^='#']"));
  if (!navLinks.length || !("IntersectionObserver" in window)) return;

  const sections = navLinks
    .map(link => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const setActive = id => {
    navLinks.forEach(link => {
      const active = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  };

  const observer = new IntersectionObserver(entries => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

    if (visible[0]) setActive(visible[0].target.id);
  }, {
    root: null,
    rootMargin: "-20% 0px -55% 0px",
    threshold: [0.01, 0.1, 0.25, 0.5]
  });

  sections.forEach(section => observer.observe(section));

  const initialId = window.location.hash.replace("#", "") || (sections[0] && sections[0].id);
  if (initialId) setActive(initialId);
})();

/* ==========================================================
   NAV SEARCH — SECTION SEARCH + UI CLICK SOUND
========================================================== */
(() => {
  const form = document.querySelector(".nav-search");
  const input = document.querySelector(".nav-search-input");
  if (!form || !input) return;

  const clickSound = new Audio("assets/sounds/nav-click.mp3");
  clickSound.preload = "auto";
  clickSound.volume = 0.42;

  const playClick = () => {
    try {
      clickSound.currentTime = 0;
      const playback = clickSound.play();
      if (playback && typeof playback.catch === "function") {
        playback.catch(() => {
          // Audio is optional; navigation/search must still work.
        });
      }
    } catch (_) {
      // Audio is optional; navigation/search must still work.
    }
  };


  form.addEventListener("pointerdown", event => {
    if (event.target === form) playClick();
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    playClick();

    const query = input.value.trim().toLowerCase();
    if (!query) return;

    const searchable = Array.from(document.querySelectorAll(
      "main h1, main h2, main h3, main p, main .eyebrow, main .tool-card, main .social-card"
    ));

    const match = searchable.find(el =>
      (el.textContent || "").toLowerCase().includes(query)
    );

    if (match) {
      const target = match.closest("section, .tool-card, .social-card") || match;
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });

  document.querySelectorAll(".desktop-nav a, .mobile-menu a, .site-header .brand, .menu-btn")
    .forEach(element => element.addEventListener("click", playClick));
})();


/* ==========================================================
   NAVBAR SCROLL HIDE / SHOW
========================================================== */
(() => {
  const header = document.querySelector(".site-header");
  if (!header) return;

  let lastScrollY = window.scrollY;
  let ticking = false;

  const updateNavbar = () => {
    const currentScrollY = window.scrollY;

    // Always show the navbar at the very top.
    if (currentScrollY <= 12) {
      header.classList.remove("nav-hidden");
      lastScrollY = currentScrollY;
      ticking = false;
      return;
    }

    // Ignore tiny movement to prevent flickering.
    const delta = currentScrollY - lastScrollY;

    if (Math.abs(delta) < 6) {
      ticking = false;
      return;
    }

    if (delta > 0) {
      // Scrolling down -> hide navbar.
      header.classList.add("nav-hidden");
    } else {
      // Scrolling up -> show navbar.
      header.classList.remove("nav-hidden");
    }

    lastScrollY = currentScrollY;
    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  }, { passive: true });

  // Reset correctly when the page is restored.
  window.addEventListener("pageshow", () => {
    lastScrollY = window.scrollY;
    header.classList.remove("nav-hidden");
  });
})();
