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
   HUMBLE NAVBAR
   Scroll direction + smart tool search + suggestions
========================================================== */

(() => {
  const header = document.querySelector(".site-header");
  const desktopSearchWrap = document.querySelector(".nav-search");
  const desktopSearch = document.getElementById("nav-tool-search");
  const desktopSuggestions = document.getElementById("nav-search-suggestions");
  const mobileSearchWrap = document.querySelector(".mobile-search");
  const mobileSearch = document.getElementById("mobile-tool-search");
  const mobileSuggestions = document.getElementById("mobile-search-suggestions");

  if (!header) return;

  /* ----------------------------------------------------------
     NAVBAR SCROLL
     UP = hide / DOWN = show / TOP = show
  ---------------------------------------------------------- */
  let lastScrollY = Math.max(0, window.scrollY || 0);
  let scrollTicking = false;
  const threshold = 5;

  function updateNavbar() {
    const current = Math.max(0, window.scrollY || 0);
    const delta = current - lastScrollY;

    if (current <= 20) {
      header.classList.remove("nav-hidden");
    } else if (delta > threshold) {
      header.classList.remove("nav-hidden");
    } else if (delta < -threshold) {
      header.classList.add("nav-hidden");
      if (typeof closeMobileMenu === "function") closeMobileMenu();
    }

    lastScrollY = current;
    scrollTicking = false;
  }

  window.addEventListener("scroll", () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(updateNavbar);
  }, { passive: true });

  /* ----------------------------------------------------------
     SEARCH DATA + SUGGESTIONS
  ---------------------------------------------------------- */
  function getCards() {
    return Array.from(document.querySelectorAll(".tool-card[data-tool]"));
  }

  function getCardData(card) {
    return {
      card,
      name: (card.dataset.tool || card.querySelector("h3")?.textContent || "Tool").trim(),
      platforms: (card.dataset.platforms || "").trim(),
      description: (card.dataset.description || card.querySelector("p")?.textContent || "").trim(),
      href: card.getAttribute("href") || ""
    };
  }

  function searchable(data) {
    return [data.name, data.platforms, data.description, data.href, data.card.textContent || ""]
      .join(" ")
      .toLowerCase();
  }

  function renderSuggestions(container, matches, query) {
    if (!container) return;

    container.replaceChildren();

    if (!query) {
      container.style.display = "none";
      return;
    }

    const limited = matches.slice(0, 5);

    if (!limited.length) {
      const empty = document.createElement("div");
      empty.className = "search-empty";
      empty.textContent = "NO MATCHING TOOLS";
      container.appendChild(empty);
      container.style.display = "block";
      return;
    }

    limited.forEach(data => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "search-suggestion";
      button.setAttribute("role", "option");

      const info = document.createElement("span");
      const name = document.createElement("strong");
      name.textContent = data.name;
      info.appendChild(name);

      if (data.platforms) {
        const platforms = document.createElement("small");
        platforms.textContent = data.platforms.split(",").slice(0, 3).join(" • ");
        info.appendChild(platforms);
      }

      const arrow = document.createElement("span");
      arrow.className = "search-suggestion-arrow";
      arrow.textContent = "↗";

      button.append(info, arrow);

      button.addEventListener("click", () => {
        if (data.card.hidden) data.card.hidden = false;
        data.card.scrollIntoView({ behavior: "smooth", block: "center" });
        closeSuggestions();
        closeMobileMenu();
      });

      container.appendChild(button);
    });

    container.style.display = "block";
  }

  function closeSuggestions() {
    [desktopSuggestions, mobileSuggestions].forEach(container => {
      if (container) {
        container.replaceChildren();
        container.style.display = "none";
      }
    });
    if (desktopSearchWrap) desktopSearchWrap.classList.remove("has-results");
    if (mobileSearchWrap) mobileSearchWrap.classList.remove("has-results");
  }

  function searchTools(value, source) {
    const query = String(value || "").trim().toLowerCase();
    const data = getCards().map(getCardData);

    const matches = data.filter(item => !query || searchable(item).includes(query));

    data.forEach(item => {
      const match = !query || searchable(item).includes(query);
      item.card.hidden = !match;
      item.card.classList.toggle("search-hidden", !match);
    });

    document.querySelectorAll(".coming-card").forEach(card => {
      card.hidden = false;
      card.classList.remove("search-hidden");
    });

    if (desktopSearch && source !== desktopSearch) desktopSearch.value = value;
    if (mobileSearch && source !== mobileSearch) mobileSearch.value = value;

    if (query) {
      renderSuggestions(desktopSuggestions, matches, query);
      renderSuggestions(mobileSuggestions, matches, query);
      if (desktopSearchWrap) desktopSearchWrap.classList.add("has-results");
      if (mobileSearchWrap) mobileSearchWrap.classList.add("has-results");
    } else {
      closeSuggestions();
    }
  }

  function updateSearchState() {
    if (!desktopSearchWrap || !desktopSearch) return;
    desktopSearchWrap.classList.toggle(
      "is-expanded",
      document.activeElement === desktopSearch || desktopSearch.value.trim() !== ""
    );
  }

  function bindSearch(input) {
    if (!input) return;
    input.addEventListener("input", event => {
      searchTools(event.target.value, input);
      updateSearchState();
    });
    input.addEventListener("focus", () => updateSearchState());
    input.addEventListener("blur", () => {
      window.setTimeout(() => {
        if (!document.querySelector(".search-suggestions button:focus")) {
          updateSearchState();
        }
      }, 120);
    });
  }

  bindSearch(desktopSearch);
  bindSearch(mobileSearch);

  document.addEventListener("keydown", event => {
    if (event.key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) {
      const active = document.activeElement;
      if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.isContentEditable)) return;
      if (desktopSearch) {
        event.preventDefault();
        desktopSearch.focus();
      }
      return;
    }

    if (event.key === "Escape") {
      const active = document.activeElement;
      if (active === desktopSearch || active === mobileSearch) {
        if (desktopSearch) desktopSearch.value = "";
        if (mobileSearch) mobileSearch.value = "";
        searchTools("");
        closeSuggestions();
        if (desktopSearch) desktopSearch.blur();
        if (mobileSearch) mobileSearch.blur();
        updateSearchState();
      }
    }
  });

  document.addEventListener("click", event => {
    if (!event.target.closest(".nav-search, .mobile-search")) closeSuggestions();
  });

  document.addEventListener("humble:tools-rendered", () => {
    const value = desktopSearch?.value || mobileSearch?.value || "";
    searchTools(value);
    updateSearchState();
  });

  updateSearchState();
  searchTools("");

  /* ----------------------------------------------------------
     SUBTLE NAV CLICK SOUND
     Uses Web Audio only after a real user gesture.
  ---------------------------------------------------------- */
  let audioContext = null;

  function navClickSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContext) audioContext = new AudioCtx();
      if (audioContext.state === "suspended") audioContext.resume();

      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(720, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(480, audioContext.currentTime + 0.045);
      gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.025, audioContext.currentTime + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.055);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.06);
    } catch (_) {}
  }

  document.querySelectorAll(".desktop-nav a, .mobile-menu a, .menu-btn, .brand").forEach(element => {
    element.addEventListener("click", navClickSound, { passive: true });
  });

})();
