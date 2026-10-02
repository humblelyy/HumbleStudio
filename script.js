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
   Scroll direction + smart tool search
========================================================== */

(() => {

  const header =
    document.querySelector(".site-header");

  const desktopSearchWrap =
    document.querySelector(".nav-search");

  const desktopSearch =
    document.getElementById("nav-tool-search");

  const mobileSearch =
    document.getElementById("mobile-tool-search");

  if (!header) {
    return;
  }


  /* ----------------------------------------------------------
     SCROLL DIRECTION
     UP   = hide
     DOWN = show
     TOP  = always show
  ---------------------------------------------------------- */

  let lastScrollY =
    Math.max(
      0,
      window.scrollY || 0
    );

  let scrollTicking =
    false;

  const scrollThreshold =
    8;


  function updateNavbar() {

    const currentScrollY =
      Math.max(
        0,
        window.scrollY || 0
      );

    const difference =
      currentScrollY -
      lastScrollY;


    if (
      currentScrollY <= 20
    ) {

      header.classList.remove(
        "nav-hidden"
      );

    } else if (
      difference > scrollThreshold
    ) {

      /* Scrolling DOWN */
      header.classList.remove(
        "nav-hidden"
      );

    } else if (
      difference < -scrollThreshold
    ) {

      /* Scrolling UP */
      header.classList.add(
        "nav-hidden"
      );

      /* Close the mobile menu when hiding */
      if (
        typeof closeMobileMenu ===
        "function"
      ) {

        closeMobileMenu();

      }

    }


    lastScrollY =
      currentScrollY;

    scrollTicking =
      false;

  }


  window.addEventListener(
    "scroll",
    () => {

      if (scrollTicking) {
        return;
      }

      scrollTicking =
        true;

      window.requestAnimationFrame(
        updateNavbar
      );

    },
    {
      passive: true
    }
  );


  /* ----------------------------------------------------------
     SEARCH
     Searches tool name, description, platforms,
     URL and all visible card text.
  ---------------------------------------------------------- */

  function getToolCards() {

    return Array.from(
      document.querySelectorAll(
        ".tool-card[data-tool]"
      )
    );

  }


  function searchTools(
    rawValue
  ) {

    const query =
      String(
        rawValue || ""
      )
        .trim()
        .toLowerCase();


    const cards =
      getToolCards();


    cards.forEach(
      card => {

        const searchableText =
          [
            card.dataset.tool || "",
            card.dataset.platforms || "",
            card.dataset.description || "",
            card.getAttribute("href") || "",
            card.textContent || ""
          ]
            .join(" ")
            .toLowerCase();


        const matches =
          !query ||
          searchableText.includes(
            query
          );


        card.hidden =
          !matches;

        card.classList.toggle(
          "search-hidden",
          !matches
        );

      }
    );


    /*
      Keep the permanent "Something More"
      card visible even while searching.
    */

    document
      .querySelectorAll(
        ".coming-card"
      )
      .forEach(
        card => {

          card.hidden =
            false;

          card.classList.remove(
            "search-hidden"
          );

        }
      );

  }


  function syncSearch(
    value,
    source
  ) {

    const nextValue =
      String(
        value || ""
      );


    if (
      source !== desktopSearch &&
      desktopSearch
    ) {
      desktopSearch.value =
        nextValue;
    }


    if (
      source !== mobileSearch &&
      mobileSearch
    ) {
      mobileSearch.value =
        nextValue;
    }


    searchTools(
      nextValue
    );

  }


  if (desktopSearch) {

    desktopSearch.addEventListener(
      "input",
      event => {

        syncSearch(
          event.target.value,
          desktopSearch
        );

      }
    );

  }


  if (mobileSearch) {

    mobileSearch.addEventListener(
      "input",
      event => {

        syncSearch(
          event.target.value,
          mobileSearch
        );

      }
    );

  }


  /*
    Make the search field stay expanded
    when it contains text.
  */

  function updateSearchState() {

    if (!desktopSearchWrap || !desktopSearch) {
      return;
    }

    desktopSearchWrap.classList.toggle(
      "is-expanded",
      document.activeElement === desktopSearch ||
      desktopSearch.value.trim() !== ""
    );

  }


  if (desktopSearch) {

    desktopSearch.addEventListener(
      "focus",
      updateSearchState
    );

    desktopSearch.addEventListener(
      "blur",
      updateSearchState
    );

    desktopSearch.addEventListener(
      "input",
      updateSearchState
    );

  }


  /*
    "/" focuses the search.
    ESC clears the search first.
  */

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "/" &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !event.shiftKey
      ) {

        const active =
          document.activeElement;

        if (
          active &&
          (
            active.tagName === "INPUT" ||
            active.tagName === "TEXTAREA" ||
            active.isContentEditable
          )
        ) {
          return;
        }


        if (desktopSearch) {

          event.preventDefault();

          desktopSearch.focus();

        }

        return;

      }


      if (
        event.key === "Escape"
      ) {

        const active =
          document.activeElement;

        if (
          active === desktopSearch ||
          active === mobileSearch
        ) {

          if (desktopSearch) {
            desktopSearch.value = "";
          }

          if (mobileSearch) {
            mobileSearch.value = "";
          }

          searchTools("");

          if (desktopSearch) {
            desktopSearch.blur();
          }

          updateSearchState();

        }

      }

    }
  );


  /*
    If Supabase renders/re-renders tools later,
    search again using the current query.
  */

  document.addEventListener(
    "humble:tools-rendered",
    () => {

      const value =
        desktopSearch
          ? desktopSearch.value
          : "";

      searchTools(
        value
      );

      updateSearchState();

    }
  );


  updateSearchState();
  searchTools("");

})();
