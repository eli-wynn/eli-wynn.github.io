// ─── GitHub Projects Loader (Animated Donut + Tooltip) ───

const container = document.getElementById("github-projects");

if (container) {

  const PINNED = [
    "Momentum",
    "Pokedex",
    "slackbot",
    "vulnerabilityScanner",
    "dataScienceA4",
    "Chatter",
    "Secrets-Management-Service"
  ];

    const GITHUB_LANG_COLORS = {
    "JavaScript": "#f1e05a",
    "TypeScript": "#3178c6",
    "HTML": "#e34c26",
    "CSS": "#563d7c",
    "Python": "#3572A5",
    "Java": "#b07219",
    "C#": "#178600",
    "C++": "#f34b7d",
    "PHP": "#4F5D95",
    "Ruby": "#701516",
    "Swift": "#F05138",
    "Go": "#00ADD8",
    "Rust": "#dea584",
    "Shell": "#89e051",
    "Vue": "#41b883",
    "React": "#61dafb",
    "Jupyter Notebook": "#DA5B0B",
    "Code": "#8b949e" // Default gray
    };

  async function fetchLanguages(repo) {
    try {
      const res = await fetch(repo.languages_url);
      const data = await res.json();

      const total = Object.values(data).reduce((a, b) => a + b, 0);

      return Object.entries(data)
        .map(([lang, bytes]) => ({
          lang,
          value: bytes / total
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
    } catch {
      return [{ lang: repo.language || "Code", value: 1 }];
    }
  }

  function drawDonutAnimated(canvas, data) {
    const ctx = canvas.getContext("2d");

    const size = 90;
    canvas.width = size;
    canvas.height = size;

    const center = size / 2;
    const radius = size / 2 - 4;
    const innerRadius = radius * 0.55;

    let progress = 0;
    const duration = 700;
    const startTime = performance.now();

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function render(now) {
      const elapsed = now - startTime;
      progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);

      ctx.clearRect(0, 0, size, size);

      let startAngle = -Math.PI / 2;

      data.forEach((slice, i) => {
        const fullAngle = slice.value * Math.PI * 2;
        const angle = fullAngle * eased;

        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, radius, startAngle, startAngle + angle);
        ctx.closePath();

        // Check if language is in index, otherwise default to a soft gray
        const langName = slice.lang;
        ctx.fillStyle = GITHUB_LANG_COLORS[langName] || "#8b949e";
        ctx.fill();

        startAngle += fullAngle;
      });

      // cut out center
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(center, center, innerRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";

      if (progress < 1) {
        requestAnimationFrame(render);
      }
    }

    requestAnimationFrame(render);

    // ─── Tooltip logic ─────────────────────────

    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - center;
      const y = e.clientY - rect.top - center;

      const distance = Math.sqrt(x * x + y * y);

      if (distance < innerRadius || distance > radius) {
        hideTooltip();
        return;
      }

      let angle = Math.atan2(y, x) + Math.PI / 2;
      if (angle < 0) angle += Math.PI * 2;

      let current = 0;

      for (let i = 0; i < data.length; i++) {
        const sliceAngle = data[i].value * Math.PI * 2;

        if (angle >= current && angle <= current + sliceAngle) {
            const color = GITHUB_LANG_COLORS[data[i].lang] || "#7DF9A6";
            
            // Update tooltip style dynamically
            tooltip.style.borderColor = color;
            tooltip.style.color = color;

            showTooltip(
                `${data[i].lang} — ${(data[i].value * 100).toFixed(1)}%`,
                e.clientX,
                e.clientY
            );
            return;
        }

        current += sliceAngle;
      }

      hideTooltip();
    });

    canvas.addEventListener("mouseleave", hideTooltip);
  }

  // ─── Tooltip DOM ─────────────────────────────

  const tooltip = document.createElement("div");
  tooltip.style.position = "fixed";
  tooltip.style.pointerEvents = "none";
  tooltip.style.padding = "6px 10px";
  tooltip.style.fontSize = "11px";
  tooltip.style.fontFamily = "JetBrains Mono, monospace";
  tooltip.style.background = "rgba(8,12,10,0.9)";
  tooltip.style.border = "1px solid rgba(125,249,166,0.3)";
  tooltip.style.color = "#7DF9A6";
  tooltip.style.borderRadius = "3px";
  tooltip.style.opacity = "0";
  tooltip.style.transition = "opacity 0.15s ease";
  tooltip.style.zIndex = "9999";

  document.body.appendChild(tooltip);

  function showTooltip(text, x, y) {
    tooltip.textContent = text;
    tooltip.style.left = x + 12 + "px";
    tooltip.style.top = y + 12 + "px";
    tooltip.style.opacity = "1";
  }

  function hideTooltip() {
    tooltip.style.opacity = "0";
  }

  // ─── Load Projects ───────────────────────────

  async function loadProjects() {
    const CACHE_KEY = "github_projects_cache";
    const CACHE_TIME = 60 * 60 * 1000; // 1 hour

    try {
        let repos;
        const cached = localStorage.getItem(CACHE_KEY);
        const lastFetch = localStorage.getItem(CACHE_KEY + "_time");

        // Check if cache exists and is fresh
        if (cached && lastFetch && (Date.now() - lastFetch < CACHE_TIME)) {
        repos = JSON.parse(cached);
        } else {
        const res = await fetch("https://api.github.com/users/eli-wynn/repos");
        if (!res.ok) throw new Error("Rate limit or API error");
        repos = await res.json();
        
        // Save to cache
        localStorage.setItem(CACHE_KEY, JSON.stringify(repos));
        localStorage.setItem(CACHE_KEY + "_time", Date.now());
        }

        const filtered = repos
        .filter(repo => !repo.fork && PINNED.includes(repo.name))
        .sort((a, b) => PINNED.indexOf(a.name) - PINNED.indexOf(b.name));

        container.innerHTML = ""; // Clear loader

        for (const repo of filtered) {
        const langData = await fetchLanguages(repo);
        renderProjectCard(repo, langData);
        }

    } catch (err) {
        console.error(err);
        container.innerHTML = `
        <div style="text-align:center; padding: 20px; border: 1px dashed #333;">
            <p style="color: #8b949e;">GitHub API limit reached or offline.</p>
            <a href="https://github.com/eli-wynn" style="color:#7DF9A6; text-decoration:none; font-size:12px;">
            View Projects on GitHub →
            </a>
        </div>`;
    }
  }

  function renderProjectCard(repo, langData) {
    const project = document.createElement("div");
    project.className = "project fade-up";
    const canvasId = `chart-${repo.name}`;

    // Generate Legend HTML
    const legendHtml = langData.map(l => {
        const color = GITHUB_LANG_COLORS[l.lang] || "#8b949e";
        return `
        <span style="display:flex; align-items:center; gap:4px; font-size:11px; color:#8b949e;">
            <span style="width:8px; height:8px; border-radius:50%; background:${color};"></span>
            ${l.lang}
        </span>`;
    }).join("");

    project.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:space-between; gap:24px;">
        <div style="flex: 1;">
            <h2 style="margin:0 0 4px 0; font-size: 1.2rem;">${formatName(repo.name)}</h2>
            <p style="font-size: 13px; color: #8b949e; margin-bottom: 12px; line-height: 1.4;">
            ${repo.description || "No description provided."}
            </p>
            
            <div style="display:flex; flex-wrap:wrap; gap:10px; margin-bottom:16px;">
            ${legendHtml}
            </div>

            <div class="project-links">
            <a href="${repo.html_url}" target="_blank"><span>GitHub</span></a>
            ${repo.homepage ? `<a href="${repo.homepage}" target="_blank"><span>Live Demo</span></a>` : ""}
            </div>
        </div>

        <canvas id="${canvasId}" style="flex-shrink:0;"></canvas>
        </div>
    `;

    container.appendChild(project);
    const canvas = document.getElementById(canvasId);
    if (canvas) drawDonutAnimated(canvas, langData);
    if (typeof fadeObserver !== "undefined") fadeObserver.observe(project);
  }

  function formatName(name) {
    return name
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  loadProjects();
}