"use strict";


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


const toolLinks =
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
    link.dataset.tool ||
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


toolLinks.forEach(
  link => {

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


        openTool(
          link
        );

      }
    );

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
