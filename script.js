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


  const transitionTitle =
    transition?.querySelector(
      ".transition-card strong"
    );


  const transitionLabel =
    transition?.querySelector(
      ".transition-card span"
    );


  const progress =
    document.querySelector(".scroll-progress");


  const revealElements =
    document.querySelectorAll(".reveal");


  const toolLinks =
    document.querySelectorAll(".tool-link");


  let navigating = false;

  let scrollTicking = false;



  /* =======================================================
     MOBILE MENU
  ======================================================== */

  if (
    menuButton &&
    mobileMenu
  ) {

    menuButton.addEventListener(
      "click",
      () => {

        const isOpen =
          mobileMenu.classList.toggle(
            "open"
          );


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

      }
    );


    const mobileLinks =
      mobileMenu.querySelectorAll(
        "a"
      );


    mobileLinks.forEach(
      link => {

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

          }
        );

      }
    );

  }



  /* =======================================================
     REVEAL ANIMATIONS
  ======================================================== */

  const reducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;


  if (
    reducedMotion ||
    !("IntersectionObserver" in window)
  ) {

    revealElements.forEach(
      element => {

        element.classList.add(
          "visible"
        );

      }
    );

  } else {

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
          root: null,

          rootMargin:
            "0px 0px -50px 0px",

          threshold:
            0.08
        }
      );


    revealElements.forEach(
      element => {

        revealObserver.observe(
          element
        );

      }
    );

  }



  /* =======================================================
     SCROLL PROGRESS
  ======================================================== */

  function updateProgress() {

    if (!progress) {
      return;
    }


    const documentHeight =
      document.documentElement.scrollHeight;


    const windowHeight =
      window.innerHeight;


    const maxScroll =
      documentHeight -
      windowHeight;


    if (
      maxScroll <= 0
    ) {

      progress.style.width =
        "0%";

      return;

    }


    const currentScroll =
      window.scrollY;


    const percentage =
      (
        currentScroll /
        maxScroll
      ) * 100;


    const safePercentage =
      Math.min(
        100,
        Math.max(
          0,
          percentage
        )
      );


    progress.style.width =
      `${safePercentage}%`;

  }


  function requestProgressUpdate() {

    if (scrollTicking) {
      return;
    }


    scrollTicking = true;


    requestAnimationFrame(
      () => {

        updateProgress();

        scrollTicking = false;

      }
    );

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

  toolLinks.forEach(
    link => {

      link.addEventListener(
        "click",
        event => {


          /*
            Keep normal browser behaviour for:

            Ctrl + click
            Cmd + click
            Shift + click
            Alt + click
            Middle mouse button
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


          if (!transition) {
            return;
          }


          if (navigating) {

            event.preventDefault();

            return;

          }


          event.preventDefault();


          navigating = true;



          /* ---------------------------------------------
             DESTINATION
          ---------------------------------------------- */

          const destination =
            link.href;



          /* ---------------------------------------------
             TOOL NAME
          ---------------------------------------------- */

          const toolName =
            link.dataset.tool ||
            "HUMBLE TOOL";


          if (transitionTitle) {

            transitionTitle.textContent =
              toolName.toUpperCase();

          }


          if (transitionLabel) {

            transitionLabel.textContent =
              "OPENING TOOL";

          }



          /* ---------------------------------------------
             CARD ANIMATION
          ---------------------------------------------- */

          link.classList.add(
            "is-opening"
          );



          /* ---------------------------------------------
             ACTIVATE SCREEN
          ---------------------------------------------- */

          requestAnimationFrame(
            () => {

              transition.classList.add(
                "active"
              );

            }
          );



          /* ---------------------------------------------
             REDIRECT
          ---------------------------------------------- */

          window.setTimeout(
            () => {

              window.location.assign(
                destination
              );

            },
            850
          );

        }
      );

    }
  );



  /* =======================================================
     RESET TRANSITION
     
     Important for mobile/desktop Back button.
  ======================================================== */

  function resetTransition() {

    if (transition) {

      transition.classList.remove(
        "active"
      );

      transition.setAttribute(
        "aria-hidden",
        "true"
      );

    }


    toolLinks.forEach(
      link => {

        link.classList.remove(
          "is-opening"
        );

      }
    );


    navigating = false;

  }



  /* =======================================================
     PAGE SHOW
     
     Fixes browser back/forward cache.
  ======================================================== */

  window.addEventListener(
    "pageshow",
    () => {

      resetTransition();

      updateProgress();

    }
  );



  /* =======================================================
     PAGE HIDE
  ======================================================== */

  window.addEventListener(
    "pagehide",
    () => {

      resetTransition();

    }
  );



  /* =======================================================
     POP STATE
  ======================================================== */

  window.addEventListener(
    "popstate",
    () => {

      resetTransition();

    }
  );



  /* =======================================================
     HASH LINKS
  ======================================================== */

  document
    .querySelectorAll(
      'a[href^="#"]'
    )
    .forEach(
      link => {

        link.addEventListener(
          "click",
          () => {

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

      }
    );



  /* =======================================================
     LOAD
  ======================================================== */

  window.addEventListener(
    "load",
    () => {

      resetTransition();

      updateProgress();

    }
  );


})();
