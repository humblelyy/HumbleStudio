/* =========================================================
   HUMBLE STUDIO
   Lightweight / mobile-friendly JavaScript
========================================================= */

(() => {

  "use strict";


  /* =======================================================
     ELEMENTS
  ======================================================== */

  const menuButton =
    document.querySelector(".menu-btn");

  const mobileMenu =
    document.querySelector(".mobile-menu");

  const transition =
    document.querySelector(".page-transition");

  const progress =
    document.querySelector(".scroll-progress");

  const revealElements =
    document.querySelectorAll(".reveal");

  const toolLinks =
    document.querySelectorAll(".tool-link");


  /* =======================================================
     MOBILE MENU
  ======================================================== */

  if (menuButton && mobileMenu) {

    menuButton.addEventListener("click", () => {

      const isOpen =
        mobileMenu.classList.toggle("open");

      menuButton.classList.toggle(
        "active",
        isOpen
      );

      menuButton.setAttribute(
        "aria-expanded",
        String(isOpen)
      );

      menuButton.setAttribute(
        "aria-label",
        isOpen
          ? "Close menu"
          : "Open menu"
      );

    });


    /*
      Close mobile menu when clicking a link.
    */

    mobileMenu
      .querySelectorAll("a")
      .forEach(link => {

        link.addEventListener(
          "click",
          () => {

            mobileMenu.classList.remove(
              "open"
            );

            menuButton.classList.remove(
              "active"
            );

            menuButton.setAttribute(
              "aria-expanded",
              "false"
            );

            menuButton.setAttribute(
              "aria-label",
              "Open menu"
            );

          }
        );

      });

  }


  /* =======================================================
     REVEAL ANIMATIONS
     IntersectionObserver is much lighter than
     listening to scroll for every element.
  ======================================================== */

  const reduceMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;


  if (
    reduceMotion ||
    !("IntersectionObserver" in window)
  ) {

    revealElements.forEach(element => {
      element.classList.add("visible");
    });

  } else {

    const observer =
      new IntersectionObserver(
        entries => {

          entries.forEach(entry => {

            if (!entry.isIntersecting) {
              return;
            }

            entry.target.classList.add(
              "visible"
            );

            observer.unobserve(
              entry.target
            );

          });

        },
        {
          root: null,
          rootMargin: "0px 0px -60px 0px",
          threshold: 0.08
        }
      );


    revealElements.forEach(element => {
      observer.observe(element);
    });

  }


  /* =======================================================
     SCROLL PROGRESS
     
     Uses requestAnimationFrame so the browser
     doesn't get hammered by scroll events.
  ======================================================== */

  let ticking = false;


  function updateProgress() {

    if (!progress) {
      return;
    }


    const documentHeight =
      document.documentElement.scrollHeight -
      window.innerHeight;


    if (documentHeight <= 0) {

      progress.style.width = "0%";

      return;

    }


    const amount =
      (window.scrollY / documentHeight) * 100;


    progress.style.width =
      `${Math.min(100, Math.max(0, amount))}%`;

  }


  function requestProgressUpdate() {

    if (ticking) {
      return;
    }


    ticking = true;


    requestAnimationFrame(() => {

      updateProgress();

      ticking = false;

    });

  }


  window.addEventListener(
    "scroll",
    requestProgressUpdate,
    {
      passive: true
    }
  );


  window.addEventListener(
    "resize",
    requestProgressUpdate,
    {
      passive: true
    }
  );


  updateProgress();


  /* =======================================================
     TOOL PAGE TRANSITIONS
  ======================================================== */

  let navigating = false;


  if (transition) {

    toolLinks.forEach(link => {

      link.addEventListener(
        "click",
        event => {

          /*
            Don't interfere with:
            - Ctrl click
            - Cmd click
            - middle mouse
            - Shift click
          */

          if (
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey ||
            event.button !== 0
          ) {

            return;

          }


          const destination =
            link.href;


          if (!destination) {
            return;
          }


          /*
            Only animate normal external
            navigation.
          */

          event.preventDefault();


          if (navigating) {
            return;
          }


          navigating = true;


          const toolName =
            link.dataset.tool ||
            "HUMBLE TOOL";


          const transitionName =
            transition.querySelector(
              ".transition-card strong"
            );


          const transitionLabel =
            transition.querySelector(
              ".transition-card span"
            );


          if (transitionName) {

            transitionName.textContent =
              toolName
                .replace(
                  "Humble ",
                  "HUMBLE "
                )
                .toUpperCase();

          }


          if (transitionLabel) {

            transitionLabel.textContent =
              "OPENING TOOL";

          }


          transition.classList.add(
            "active"
          );


          /*
            Small delay gives the animation
            enough time to actually appear.
          */

          window.setTimeout(() => {

            window.location.href =
              destination;

          }, 350);

        }
      );

    });


    /*
      IMPORTANT:
      If the user presses Back on mobile
      or desktop, never leave the transition
      overlay stuck on screen.
    */

    window.addEventListener(
      "pageshow",
      () => {

        transition.classList.remove(
          "active"
        );

        navigating = false;

      }
    );


    window.addEventListener(
      "pagehide",
      () => {

        transition.classList.remove(
          "active"
        );

      }
    );

  }


  /* =======================================================
     FIX HASH NAVIGATION
  ======================================================== */

  document
    .querySelectorAll(
      'a[href^="#"]'
    )
    .forEach(link => {

      link.addEventListener(
        "click",
        () => {

          /*
            Closing the mobile menu is enough.
            Browser handles the actual hash.
          */

          if (
            mobileMenu &&
            menuButton
          ) {

            mobileMenu.classList.remove(
              "open"
            );

            menuButton.classList.remove(
              "active"
            );

            menuButton.setAttribute(
              "aria-expanded",
              "false"
            );

          }

        }
      );

    });


  /* =======================================================
     PREVENT DOUBLE TAP ZOOM ON BUTTON-LIKE UI
     ======================================================== */

  document.addEventListener(
    "touchstart",
    () => {},
    {
      passive: true
    }
  );


  /* =======================================================
     CLEAN UP TRANSITION WHEN PAGE IS RESTORED
     FROM BROWSER CACHE
  ======================================================== */

  if (transition) {

    window.addEventListener(
      "popstate",
      () => {

        transition.classList.remove(
          "active"
        );

        navigating = false;

      }
    );

  }

})();
