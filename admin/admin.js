(() => {
  "use strict";

  const cfg = window.HUMBLE_SUPABASE || {};
  const hasConfig = cfg.url && cfg.anonKey && window.supabase;

  const loginView = document.getElementById("login-view");
  const dashboardView = document.getElementById("dashboard-view");
  const loginForm = document.getElementById("login-form");
  const loginMessage = document.getElementById("login-message");

  const form = document.getElementById("tool-form");
  const formMessage = document.getElementById("form-message");

  const toolList = document.getElementById("tool-list");

  const dropZone = document.getElementById("drop-zone");
  const imageInput = document.getElementById("tool-image");
  const imagePreview = document.getElementById("image-preview");

  const togglePassword = document.getElementById("toggle-password");

  const platformList = document.getElementById("platform-list");
  const selectedPlatformList =
    document.getElementById("selected-platform-list");

  const newPlatformInput =
    document.getElementById("new-platform");

  const addPlatformButton =
    document.getElementById("add-platform");


  if (!hasConfig) {
    loginMessage.textContent =
      "Supabase is not configured yet. Add the public URL and anon/publishable key to supabase-config.js.";

    loginMessage.className =
      "message error";

    return;
  }


  const client =
    window.supabase.createClient(
      cfg.url,
      cfg.anonKey
    );


  let selectedImage = null;
  let existingImageUrl = "";
  let editingId = null;

  /*
   * This array controls the order shown
   * on the public website.
   */
  let selectedPlatformOrder = [];


  let platformOptions = [
    "Adobe After Effects",
    "Adobe Premiere Pro",
    "Adobe Photoshop",
    "Adobe Illustrator",
    "Adobe Media Encoder",
    "DaVinci Resolve",
    "Final Cut Pro",
    "CapCut",
    "Blender",
    "Unreal Engine",
    "Windows",
    "macOS"
  ];


  const $ = id =>
    document.getElementById(id);


  /* --------------------------------
     MESSAGE
  -------------------------------- */

  function message(
    target,
    text,
    type = ""
  ) {

    target.textContent = text;

    target.className =
      `message ${type}`.trim();
  }


  /* --------------------------------
     ESCAPE HTML
  -------------------------------- */

  function escapeHtml(value) {

    return String(value ?? "")
      .replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[char]));
  }


  /* --------------------------------
     PLATFORM CHECKBOXES
  -------------------------------- */

  function renderPlatformOptions(
    selected = selectedPlatformOrder
  ) {

    const chosen =
      new Set(
        Array.isArray(selected)
          ? selected
          : []
      );


    platformList.innerHTML =
      platformOptions.map(option => `

        <label>

          <input
            class="platform"
            type="checkbox"
            value="${escapeHtml(option)}"
            ${chosen.has(option) ? "checked" : ""}
          >

          ${escapeHtml(option)}

        </label>

      `).join("");


    /*
     * When a checkbox changes:
     *
     * checked   → add to selected order
     * unchecked → remove from selected order
     */

    platformList
      .querySelectorAll(".platform")
      .forEach(input => {

        input.addEventListener(
          "change",
          () => {

            if (input.checked) {

              if (
                !selectedPlatformOrder.includes(
                  input.value
                )
              ) {

                selectedPlatformOrder.push(
                  input.value
                );

              }

            } else {

              selectedPlatformOrder =
                selectedPlatformOrder.filter(
                  item =>
                    item !== input.value
                );

            }

            renderSelectedPlatformOrder();

          }
        );

      });


    renderSelectedPlatformOrder();
  }


  /* --------------------------------
     SELECTED PLATFORM ORDER
  -------------------------------- */

  function renderSelectedPlatformOrder() {

    if (!selectedPlatformList) return;


    if (!selectedPlatformOrder.length) {

      selectedPlatformList.innerHTML = `

        <div class="selected-platform-empty">

          Select platforms above to arrange their order.

        </div>

      `;

      return;
    }


    selectedPlatformList.innerHTML =
      selectedPlatformOrder.map(
        (platform, index) => `

          <div
            class="selected-platform-item"
            draggable="true"
            data-platform-index="${index}"
          >

            <span class="platform-handle">
              ☰
            </span>

            <span>
              ${escapeHtml(platform)}
            </span>

          </div>

        `
      ).join("");


    setupPlatformDragging();
  }


  /* --------------------------------
     DRAG / DROP PLATFORM ORDER
  -------------------------------- */

  function setupPlatformDragging() {

    const items =
      [
        ...selectedPlatformList
          .querySelectorAll(
            ".selected-platform-item"
          )
      ];


    let draggedIndex = null;


    items.forEach(item => {


      /* DRAG START */

      item.addEventListener(
        "dragstart",
        event => {

          draggedIndex =
            Number(
              item.dataset.platformIndex
            );


          item.classList.add(
            "dragging"
          );


          event.dataTransfer.effectAllowed =
            "move";

          event.dataTransfer.setData(
            "text/plain",
            String(draggedIndex)
          );

        }
      );


      /* DRAG END */

      item.addEventListener(
        "dragend",
        () => {

          item.classList.remove(
            "dragging"
          );

          draggedIndex = null;

        }
      );


      /* DROP */

      item.addEventListener(
        "dragover",
        event => {

          event.preventDefault();

          if (
            draggedIndex === null
          ) {
            return;
          }


          event.dataTransfer.dropEffect =
            "move";

        }
      );


      item.addEventListener(
        "drop",
        event => {

          event.preventDefault();


          const targetIndex =
            Number(
              item.dataset.platformIndex
            );


          if (
            draggedIndex === null ||
            draggedIndex === targetIndex
          ) {

            return;

          }


          const movedPlatform =
            selectedPlatformOrder.splice(
              draggedIndex,
              1
            )[0];


          selectedPlatformOrder.splice(
            targetIndex,
            0,
            movedPlatform
          );


          renderSelectedPlatformOrder();

        }
      );

    });

  }


  /* --------------------------------
     LOAD PLATFORM OPTIONS
  -------------------------------- */

  async function loadPlatformOptions() {

    const { data, error } =
      await client
        .from("platform_options")
        .select("name")
        .eq("active", true)
        .order("sort_order", {
          ascending: true
        })
        .order("name", {
          ascending: true
        });


    if (
      !error &&
      Array.isArray(data) &&
      data.length
    ) {

      platformOptions =
        data.map(
          row => row.name
        );

    }


    renderPlatformOptions();
  }


  /* --------------------------------
     ADD PLATFORM
  -------------------------------- */

  async function addPlatform() {

    const name =
      newPlatformInput.value
        .trim()
        .replace(/\s+/g, " ");


    if (!name) {
      return;
    }


    if (name.length > 60) {

      message(
        formMessage,
        "Platform name must be 60 characters or fewer.",
        "error"
      );

      return;
    }


    if (
      platformOptions.some(
        item =>
          item.toLowerCase() ===
          name.toLowerCase()
      )
    ) {

      message(
        formMessage,
        "That platform already exists.",
        "error"
      );

      return;
    }


    const { error } =
      await client
        .from("platform_options")
        .insert({
          name,
          sort_order:
            platformOptions.length + 1,
          active: true
        });


    if (error) {

      message(
        formMessage,
        error.message,
        "error"
      );

      return;
    }


    platformOptions.push(name);


    /*
     * New platform becomes selected
     * for the current tool.
     *
     * You can drag it anywhere afterward.
     */

    selectedPlatformOrder.push(name);


    renderPlatformOptions(
      selectedPlatformOrder
    );


    newPlatformInput.value = "";


    message(
      formMessage,
      `Added platform: ${name}`,
      "success"
    );
  }


  /* --------------------------------
     RESET FORM
  -------------------------------- */

  function resetForm() {

    editingId = null;

    existingImageUrl = "";

    selectedImage = null;

    selectedPlatformOrder = [];


    form.reset();


    $("tool-published").checked =
      true;


    $("tool-order").value =
      "0";


    $("form-title").textContent =
      "ADD TOOL";


    $("save-tool").textContent =
      "PUBLISH TOOL";


    $("cancel-edit").hidden =
      true;


    imagePreview.hidden =
      true;


    imagePreview.removeAttribute(
      "src"
    );


    renderPlatformOptions(
      selectedPlatformOrder
    );


    message(
      formMessage,
      ""
    );
  }


  /* --------------------------------
     IMAGE PREVIEW
  -------------------------------- */

  function setPreview(file) {

    if (!file) return;


    const allowed = [
      "image/png",
      "image/jpeg",
      "image/webp"
    ];


    if (
      !allowed.includes(
        file.type
      )
    ) {

      throw new Error(
        "Only PNG, JPG and WEBP images are allowed."
      );

    }


    if (
      file.size >
      5 * 1024 * 1024
    ) {

      throw new Error(
        "Image must be 5 MB or smaller."
      );

    }


    selectedImage =
      file;


    imagePreview.src =
      URL.createObjectURL(
        file
      );


    imagePreview.hidden =
      false;
  }


  /* --------------------------------
     UPLOAD IMAGE
  -------------------------------- */

  async function uploadImage(file) {

    const ext =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "jpg";


    const path =
      `${crypto.randomUUID()}.${ext}`;


    const { error } =
      await client.storage
        .from("tools")
        .upload(
          path,
          file,
          {
            cacheControl:
              "31536000",

            upsert:
              false,

            contentType:
              file.type
          }
        );


    if (error) {
      throw error;
    }


    const { data } =
      client.storage
        .from("tools")
        .getPublicUrl(
          path
        );


    return data.publicUrl;
  }


  /* --------------------------------
     STORAGE PATH
  -------------------------------- */

  function storagePathFromPublicUrl(
    url
  ) {

    if (!url) {
      return null;
    }


    const marker =
      "/storage/v1/object/public/tools/";


    const index =
      url.indexOf(marker);


    return index >= 0
      ? decodeURIComponent(
          url.slice(
            index +
            marker.length
          )
        )
      : null;
  }


  /* --------------------------------
     REMOVE OLD IMAGE
  -------------------------------- */

  async function removeStoredImage(
    url
  ) {

    const path =
      storagePathFromPublicUrl(
        url
      );


    if (!path) {
      return;
    }


    const { error } =
      await client.storage
        .from("tools")
        .remove([
          path
        ]);


    if (error) {

      console.warn(
        "Could not remove old tool image:",
        error.message
      );

    }
  }


  /* --------------------------------
     LOAD TOOLS
  -------------------------------- */

  async function loadTools() {

    toolList.innerHTML =
      "<p class='muted'>Loading tools…</p>";


    const { data, error } =
      await client
        .from("tools")
        .select("*")
        .order("sort_order", {
          ascending: true
        })
        .order("created_at", {
          ascending: true
        });


    if (error) {

      message(
        formMessage,
        error.message,
        "error"
      );


      toolList.innerHTML =
        "";


      return;
    }


    if (!data?.length) {

      toolList.innerHTML =
        "<p class='muted'>No tools have been added yet. Run the supplied seed section in supabase-schema.sql to add the original HUMBLE tools.</p>";

      return;
    }


    toolList.innerHTML =
      data.map(tool => `

        <article class="tool-row">

          <img
            src="${escapeHtml(tool.image_url)}"
            alt="${escapeHtml(tool.name)}"
          >


          <div>

            <h3>
              ${escapeHtml(tool.name)}
            </h3>

            <p>
              ${escapeHtml(tool.description)}
            </p>


            <div class="tool-meta">

              ${escapeHtml(
                (tool.platforms || [])
                  .join(" · ")
              )}

              ·

              ${
                tool.published
                  ? "PUBLISHED"
                  : "HIDDEN"
              }

            </div>

          </div>


          <div class="tool-actions">

            <button
              type="button"
              data-edit="${escapeHtml(tool.id)}"
            >
              EDIT
            </button>


            <button
              type="button"
              class="danger"
              data-delete="${escapeHtml(tool.id)}"
            >
              DELETE
            </button>

          </div>

        </article>

      `).join("");


    /* EDIT */

    toolList
      .querySelectorAll(
        "[data-edit]"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          () =>
            editTool(
              button.dataset.edit,
              data
            )
        );

      });


    /* DELETE */

    toolList
      .querySelectorAll(
        "[data-delete]"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          () =>
            deleteTool(
              button.dataset.delete,
              data
            )
        );

      });

  }


  /* --------------------------------
     EDIT TOOL
  -------------------------------- */

  function editTool(
    id,
    data
  ) {

    const tool =
      data.find(
        item =>
          String(item.id) ===
          String(id)
      );


    if (!tool) {
      return;
    }


    editingId =
      id;


    existingImageUrl =
      tool.image_url || "";


    $("tool-name").value =
      tool.name || "";


    $("tool-description").value =
      tool.description || "";


    $("tool-url").value =
      tool.redirect_url || "";


    $("tool-order").value =
      tool.sort_order ?? 0;


    $("tool-published").checked =
      Boolean(tool.published);


    /*
     * IMPORTANT:
     * Load the saved platform order.
     */

    selectedPlatformOrder =
      Array.isArray(tool.platforms)
        ? [...tool.platforms]
        : [];


    renderPlatformOptions(
      selectedPlatformOrder
    );


    if (existingImageUrl) {

      imagePreview.src =
        existingImageUrl;

      imagePreview.hidden =
        false;

    }


    $("form-title").textContent =
      "EDIT TOOL";


    $("save-tool").textContent =
      "UPDATE TOOL";


    $("cancel-edit").hidden =
      false;


    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  }


  /* --------------------------------
     DELETE TOOL
  -------------------------------- */

  async function deleteTool(
    id,
    data
  ) {

    if (
      !confirm(
        "Delete this tool from HUMBLE STUDIO?"
      )
    ) {

      return;

    }


    const tool =
      data.find(
        item =>
          String(item.id) ===
          String(id)
      );


    const { error } =
      await client
        .from("tools")
        .delete()
        .eq("id", id);


    if (error) {

      message(
        formMessage,
        error.message,
        "error"
      );

      return;
    }


    if (tool?.image_url) {

      await removeStoredImage(
        tool.image_url
      );

    }


    if (
      String(editingId) ===
      String(id)
    ) {

      resetForm();

    }


    await loadTools();


    message(
      formMessage,
      "Tool deleted.",
      "success"
    );

  }


  /* --------------------------------
     LOGIN
  -------------------------------- */

  loginForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      message(
        loginMessage,
        "Signing in…"
      );


      const { error } =
        await client.auth
          .signInWithPassword({

            email:
              $("login-email")
                .value
                .trim(),

            password:
              $("login-password")
                .value

          });


      if (error) {

        message(
          loginMessage,
          error.message,
          "error"
        );

      } else {

        message(
          loginMessage,
          ""
        );


        await boot();

      }

    }
  );


  /* --------------------------------
     SIGN OUT
  -------------------------------- */

  $("sign-out").addEventListener(
    "click",
    async () => {

      await client.auth.signOut();


      dashboardView.hidden =
        true;


      loginView.hidden =
        false;


      resetForm();

    }
  );


  /* --------------------------------
     CANCEL EDIT
  -------------------------------- */

  $("cancel-edit").addEventListener(
    "click",
    resetForm
  );


  /* --------------------------------
     REFRESH
  -------------------------------- */

  $("refresh-tools").addEventListener(
    "click",
    loadTools
  );


  /* --------------------------------
     ADD PLATFORM
  -------------------------------- */

  addPlatformButton.addEventListener(
    "click",
    addPlatform
  );


  newPlatformInput.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Enter"
      ) {

        event.preventDefault();

        addPlatform();

      }

    }
  );


  /* --------------------------------
     SHOW / HIDE PASSWORD
  -------------------------------- */

  togglePassword.addEventListener(
    "click",
    () => {

      const input =
        $("login-password");


      const show =
        input.type === "password";


      input.type =
        show
          ? "text"
          : "password";


      togglePassword.textContent =
        show
          ? "HIDE"
          : "SHOW";

    }
  );


  /* --------------------------------
     IMAGE INPUT
  -------------------------------- */

  imageInput.addEventListener(
    "change",
    event => {

      try {

        setPreview(
          event.target.files[0]
        );


        message(
          formMessage,
          ""
        );

      } catch (error) {

        imageInput.value =
          "";


        message(
          formMessage,
          error.message,
          "error"
        );

      }

    }
  );


  /* --------------------------------
     DRAG IMAGE
  -------------------------------- */

  [
    "dragenter",
    "dragover"
  ].forEach(type => {

    dropZone.addEventListener(
      type,
      event => {

        event.preventDefault();

        dropZone.classList.add(
          "dragover"
        );

      }
    );

  });


  [
    "dragleave",
    "drop"
  ].forEach(type => {

    dropZone.addEventListener(
      type,
      event => {

        event.preventDefault();

        dropZone.classList.remove(
          "dragover"
        );

      }
    );

  });


  dropZone.addEventListener(
    "drop",
    event => {

      const file =
        event.dataTransfer.files[0];


      try {

        setPreview(file);


        message(
          formMessage,
          ""
        );

      } catch (error) {

        message(
          formMessage,
          error.message,
          "error"
        );

      }

    }
  );


  /* --------------------------------
     SAVE TOOL
  -------------------------------- */

  form.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      message(
        formMessage,
        "Saving…"
      );


      try {

        const name =
          $("tool-name")
            .value
            .trim();


        const description =
          $("tool-description")
            .value
            .trim();


        const redirectUrl =
          new URL(
            $("tool-url")
              .value
              .trim()
          );


        if (
          ![
            "http:",
            "https:"
          ].includes(
            redirectUrl.protocol
          )
        ) {

          throw new Error(
            "Redirect link must use HTTP or HTTPS."
          );

        }


        if (
          !editingId &&
          !selectedImage
        ) {

          throw new Error(
            "A tool image is required."
          );

        }


        let imageUrl =
          existingImageUrl;


        if (selectedImage) {

          imageUrl =
            await uploadImage(
              selectedImage
            );

        }


        /*
         * IMPORTANT:
         *
         * Save the custom selected
         * platform order.
         */

        const payload = {

          name,

          description,

          image_url:
            imageUrl,

          redirect_url:
            redirectUrl.toString(),

          platforms:
            [...selectedPlatformOrder],

          published:
            $("tool-published")
              .checked,

          sort_order:
            Number(
              $("tool-order").value
            ) || 0

        };


        const result =
          editingId

            ? await client
                .from("tools")
                .update(payload)
                .eq(
                  "id",
                  editingId
                )

            : await client
                .from("tools")
                .insert(
                  payload
                );


        if (result.error) {
          throw result.error;
        }


        /*
         * Remove old image only
         * when a new image was uploaded.
         */

        if (
          editingId &&
          selectedImage &&
          existingImageUrl &&
          existingImageUrl !== imageUrl
        ) {

          await removeStoredImage(
            existingImageUrl
          );

        }


        message(
          formMessage,
          editingId
            ? "Tool updated."
            : "Tool published.",
          "success"
        );


        resetForm();


        await loadTools();

      } catch (error) {

        message(
          formMessage,
          error.message ||
            "Could not save tool.",
          "error"
        );

      }

    }
  );


  /* --------------------------------
     BOOT
  -------------------------------- */

  async function boot() {

    const { data } =
      await client.auth
        .getSession();


    if (data.session) {

      loginView.hidden =
        true;

      dashboardView.hidden =
        false;


      await loadPlatformOptions();

      await loadTools();

    } else {

      loginView.hidden =
        false;

      dashboardView.hidden =
        true;

    }

  }


  /*
   * Initial platform render
   */

  renderPlatformOptions();


  /*
   * Start application
   */

  boot();

})();
