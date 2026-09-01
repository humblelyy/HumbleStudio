/* ==========================================================
   HUMBLE STUDIO
   MAIN JAVASCRIPT
========================================================== */

"use strict";


/* ==========================================================
   ELEMENTS
========================================================== */

const body =
  document.body;


const transition =
  document.querySelector(".page-transition");


const transitionTitle =
  document.querySelector("#transition-title");


const transitionLabel =
  document.querySelector("#transition-label");


const menuButton =
  document.querySelector(".menu-btn");


const mobileMenu =
  document.querySelector(".mobile-menu");


const mobileLinks =
  document.querySelectorAll(".mobile-menu a");


const revealElements =
  document.querySelectorAll(".reveal");


const toolLinks =
  document.querySelectorAll(
    ".tool-card[data-tool]"
  );


const progressBar =
  document.querySelector(".scroll-progress");


/* ==========================================================
   STATE
========================================================== */

let navigating = false;

let ticking = false;


/* ==========================================================
   MOBILE MENU
========================================================== */

function openMobileMenu() {

  if (!menuButton || !mobileMenu) {
    return;
  }


  menuButton.classList.add("active");

  mobileMenu.classList.add("open");

  menuButton.setAttribute(
    "aria-expanded",
    "true"
  );

}


function closeMobileMenu() {

  if (!menuButton || !mobileMenu) {
    return;
  }


  menuButton.classList.remove("active");

  mobileMenu.classList.remove("open");

  menuButton.setAttribute(
    "aria-expanded",
    "false"
  );

}


function toggleMobileMenu() {

  if (!mobileMenu) {
    return;
  }


  if (mobileMenu.classList.contains("open")) {

    closeMobileMenu();

  } else {

    openMobileMenu();

  }

}


if (menuButton) {

  menuButton.addEventListener(
    "click",
    toggleMobileMenu
  );

}


mobileLinks.forEach(link => {

  link.addEventListener(
    "click",
    closeMobileMenu
  );

});


document.addEventListener(
  "click",
  event => {

    if (!mobileMenu || !menuButton) {
      return;
    }


    const clickedInsideMenu =
      mobileMenu.contains(event.target);


    const clickedButton =
      menuButton.contains(event.target);


    if (
      mobileMenu.classList.contains("open") &&
      !clickedInsideMenu &&
      !clickedButton
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


  const documentHeight =
    document.documentElement.scrollHeight -
    window.innerHeight;


  if (documentHeight <= 0) {

    progressBar.style.width = "0%";

    return;

  }


  const percentage =
    Math.min(
      100,
      Math.max(
        0,
        (scrollTop / documentHeight) * 100
      )
    );


  progressBar.style.width =
    `${percentage}%`;

}


function requestScrollUpdate() {

  if (ticking) {
    return;
  }


  ticking = true;


  requestAnimationFrame(() => {

    updateScrollProgress();

    ticking = false;

  });

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
   REVEAL ON SCROLL
========================================================== */

const revealObserver =
  new IntersectionObserver(
    entries => {

      entries.forEach(entry => {

        if (!entry.isIntersecting) {
          return;
        }


        entry.target.classList.add(
          "visible"
        );


        revealObserver.unobserve(
          entry.target
        );

      });

    },
    {
      threshold: .08,

      rootMargin:
        "0px 0px -40px 0px"
    }
  );


revealElements.forEach(element => {

  revealObserver.observe(
    element
  );

});


/* ==========================================================
   HERO IMMEDIATE REVEAL
========================================================== */

window.addEventListener(
  "load",
  () => {

    document
      .querySelectorAll(
        ".hero .reveal"
      )
      .forEach(element => {

        element.classList.add(
          "visible"
        );

      });

  }
);


/* ==========================================================
   SMOOTH TOOL REDIRECT
========================================================== */

function getToolPosition(element) {

  const rect =
    element.getBoundingClientRect();


  return {

    x:
      rect.left +
      rect.width / 2,

    y:
      rect.top +
      rect.height / 2

  };

}


function startToolTransition(
  link
) {

  if (!transition) {
    return false;
  }


  const destination =
    link.href;


  if (!destination) {
    return false;
  }


  navigating = true;


  /* -----------------------------------------------
     Find actual clicked card position
  ------------------------------------------------ */

  const position =
    getToolPosition(link);


  const x =
    (position.x /
      window.innerWidth) *
    100;


  const y =
    (position.y /
      window.innerHeight) *
    100;


  transition.style.setProperty(
    "--transition-x",
    `${x}%`
  );


  transition.style.setProperty(
    "--transition-y",
    `${y}%`
  );


  /* -----------------------------------------------
     Set transition title
  ------------------------------------------------ */

  const toolName =
    link.dataset.tool ||
    "HUMBLE TOOL";


  if (transitionTitle) {

    transitionTitle.textContent =
      toolName.toUpperCase();

  }


  if (transitionLabel) {

    transitionLabel.textContent =
      "OPENING";

  }


  /* -----------------------------------------------
     Lift clicked card
  ------------------------------------------------ */

  link.classList.add(
    "is-opening"
  );


  /* -----------------------------------------------
     Start animation
  ------------------------------------------------ */

  requestAnimationFrame(() => {

    transition.classList.add(
      "active"
    );

  });


  /* -----------------------------------------------
     Redirect
  ------------------------------------------------ */

  window.setTimeout(
    () => {

      window.location.assign(
        destination
      );

    },
    720
  );


  return true;

}


toolLinks.forEach(link => {

  link.addEventListener(
    "click",
    event => {

      /*
        Only intercept normal left-click.

        Ctrl/Cmd/Shift/Alt click should continue
        to behave like a normal browser link.
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


      /*
        If navigation is already happening,
        don't trigger it twice.
      */

      if (navigating) {

        event.preventDefault();

        return;

      }


      event.preventDefault();


      startToolTransition(
        link
      );

    }
  );

});


/* ==========================================================
   RESET TRANSITION
========================================================== */

function resetTransition() {

  if (transition) {

    transition.classList.remove(
      "active"
    );

  }


  toolLinks.forEach(link => {

    link.classList.remove(
      "is-opening"
    );

  });


  navigating = false;

}


/*
  VERY IMPORTANT:

  pageshow fires when returning with
  the mobile/desktop browser back button.

  This prevents the transition screen
  from remaining stuck.
*/

window.addEventListener(
  "pageshow",
  () => {

    resetTransition();

  }
);


/*
  Handle browser back/forward navigation.
*/

window.addEventListener(
  "popstate",
  () => {

    resetTransition();

  }
);


/*
  Also reset when the page becomes visible again.
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
   ESCAPE KEY
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
   PREVENT STUCK HASH POSITION
========================================================== */

window.addEventListener(
  "load",
  () => {

    /*
      If the page was opened normally,
      don't force the browser into an old
      scroll position.
    */

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
   IMAGE ERROR HANDLING
========================================================== */

document
  .querySelectorAll("img")
  .forEach(image => {

    image.addEventListener(
      "error",
      () => {

        image.classList.add(
          "image-error"
        );

      }
    );

  });


/* ==========================================================
   FINAL INITIALIZATION
========================================================== */

document.documentElement.classList.add(
  "js-ready"
);
