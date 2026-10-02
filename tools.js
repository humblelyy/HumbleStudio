(() => {
  "use strict";

  const grid = document.querySelector(".tools-grid");
  const cfg = window.HUMBLE_SUPABASE || {};
  if (!grid) return;

  const fallbackTools = [
    {
      id: "original-humble-studio-tool",
      name: "Humble Studio Tool",
      description: "Discord RPC, editing timer, streaks, community features and Adobe workflow utilities.",
      image_url: "assets/tools/humble-studio-tool.png",
      redirect_url: "https://humblelyy.github.io/HumbleStudioTool/",
      platforms: ["Adobe After Effects", "Adobe Premiere Pro", "Windows", "macOS"],
      accent: "pink",
      sort_order: 1
    },
    {
      id: "original-humble-ae-downgrader",
      name: "Humble AE Downgrader",
      description: "Convert After Effects projects to older versions with the Humble AE Downgrader.",
      image_url: "assets/tools/humble-ae-downgrader.png",
      redirect_url: "https://humblelyy.github.io/HUMBLE-ae-Downgrader/",
      platforms: ["Adobe After Effects", "Windows", "macOS"],
      accent: "cyan",
      sort_order: 2
    }
  ];

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[char]));
  }

  function validHttpUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }

  function renderTools(tools) {
    const list = tools.filter(tool =>
      tool && tool.name && tool.description && tool.image_url && validHttpUrl(tool.redirect_url)
    );

    grid.innerHTML = list.map((tool, index) => {
      const accent = tool.accent === "cyan" ? "cyan-card" : "pink-card";
      const platforms = Array.isArray(tool.platforms) ? tool.platforms : [];
      const platformHtml = platforms.length
        ? `<div class="tool-platforms" aria-label="Works with">${platforms.map(p => `<span class="tool-platform">${esc(p)}</span>`).join("")}</div>`
        : "";

      return `
        <a class="tool-card ${accent} reveal visible" href="${esc(tool.redirect_url)}" data-tool="${esc(tool.name)}" data-platforms="${esc(platforms.join(","))}">
          <div class="tool-thumb">
            <img src="${esc(tool.image_url)}" alt="${esc(tool.name)} thumbnail" loading="lazy" decoding="async">
            <div class="thumb-shine"></div>
            <div class="thumb-overlay"><span>OPEN TOOL</span><b>↗</b></div>
          </div>
          <div class="tool-info">
            <small>${String(index + 1).padStart(2, "0")} / TOOL</small>
            <h3>${esc(tool.name)}</h3>
            <p>${esc(tool.description)}</p>
            ${platformHtml}
            <strong>OPEN ${esc(tool.name).toUpperCase()} <b>↗</b></strong>
          </div>
        </a>
      `;
    }).join("");

    // Intentional permanent teaser. New tools are rendered before it.
    const coming = document.createElement("div");
    coming.className = "coming-card reveal visible";
    coming.innerHTML = `
      <small>${String(list.length + 1).padStart(2, "0")} / NEXT</small>
      <strong>MORE<br>SOON.</strong>
      <span>Something useful is cooking.</span>
    `;
    grid.appendChild(coming);
    document.dispatchEvent(new CustomEvent("humble:tools-rendered"));
  }

  async function loadFromSupabase() {
    const configured = cfg.url && cfg.anonKey && window.supabase && typeof window.supabase.createClient === "function";
    if (!configured) {
      renderTools(fallbackTools);
      return;
    }

    try {
      const client = window.supabase.createClient(cfg.url, cfg.anonKey);
      const { data, error } = await client
        .from("tools")
        .select("id,name,description,image_url,redirect_url,platforms,accent,sort_order,created_at")
        .eq("published", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      renderTools(data || []);
    } catch (error) {
      console.error("HUMBLE STUDIO tools load failed:", error);
      renderTools(fallbackTools);
    }
  }

  window.HUMBLE_RENDER_TOOLS = renderTools;
  loadFromSupabase();
})();
