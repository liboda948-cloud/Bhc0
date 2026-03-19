const app = document.getElementById("app");

const registry = (() => {
  if (!window.__spaModules) window.__spaModules = Object.create(null);
  return window.__spaModules;
})();

const getRoute = () => {
  const raw = window.location.hash || "#/";
  if (!raw.startsWith("#/")) return "/";
  const path = raw.slice(1);
  return path || "/";
};

const setRoute = (path) => {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  window.location.hash = `#${normalized}`;
};

const isInternalNav = (href) => typeof href === "string" && href.startsWith("#/");

const renderLoading = () => {
  if (!app) return;
  app.innerHTML = `<section class="view view-loading" aria-label="加载中"><div class="container"><p class="loading">加载中…</p></div></section>`;
};

const renderError = (message, retry) => {
  if (!app) return;
  const safe = message || "模块加载失败";
  app.innerHTML = `
    <section class="view view-error" aria-label="加载失败">
      <div class="container">
        <h1 class="error-title">加载失败</h1>
        <p class="error-desc">${safe}</p>
        <button class="button button-primary" type="button" id="retryBtn">重试</button>
        <a class="button" href="#/">返回封面</a>
      </div>
    </section>
  `;
  const btn = document.getElementById("retryBtn");
  if (btn) btn.addEventListener("click", retry);
};

const renderHome = ({ mount }) => {
  mount.innerHTML = `
    <section class="landing view" aria-label="主页面">
      <div class="landing-inner">
        <p class="landing-kicker">VISUAL COMMUNICATION DESIGN</p>
        <nav class="landing-nav" aria-label="模块导航">
          <a class="landing-link" href="#/work">WORK</a>
          <a class="landing-link" href="#/about">ABOUT</a>
          <a class="landing-link" href="#/contact">CONTACT</a>
        </nav>
        <p class="landing-caption">留白即内容 · Minimal, but precise.</p>
      </div>
    </section>
  `;
  return null;
};

const encodePath = (path) => {
  try {
    return encodeURI(path);
  } catch {
    return path;
  }
};

const IMAGE_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%221200%22%20height=%22900%22%20viewBox=%220%200%201200%20900%22%3E%3Crect%20width=%221200%22%20height=%22900%22%20fill=%22%23121214%22/%3E%3Crect%20x=%2270%22%20y=%2270%22%20width=%221060%22%20height=%22760%22%20rx=%2248%22%20fill=%22none%22%20stroke=%22%23ffffff%22%20stroke-opacity=%220.10%22%20stroke-width=%223%22/%3E%3C/svg%3E";

const createTaskQueue = (limit = 2) => {
  let active = 0;
  const pending = [];

  const runNext = () => {
    if (active >= limit) return;
    const task = pending.shift();
    if (!task) return;
    active += 1;
    Promise.resolve()
      .then(task)
      .catch(() => {})
      .finally(() => {
        active -= 1;
        runNext();
      });
  };

  return (task) => {
    pending.push(task);
    runNext();
  };
};

const loadImgInto = async (imgEl, src) => {
  const temp = new Image();
  temp.decoding = "async";
  temp.src = src;
  try {
    if (typeof temp.decode === "function") await temp.decode();
  } catch {}
  imgEl.src = src;
  imgEl.classList.add("is-loaded");
  imgEl.removeAttribute("data-src");
};

const setupLazyImages = (mount) => {
  const imgs = Array.from(mount.querySelectorAll("img[data-src]")).filter((el) => el instanceof HTMLImageElement);
  if (imgs.length === 0) return () => {};

  const enqueue = createTaskQueue(2);
  let stopped = false;

  const requestLoad = (img) => {
    const src = img.getAttribute("data-src");
    if (!src) return;
    if (!img.classList.contains("is-loading")) img.classList.add("is-loading");

    enqueue(async () => {
      if (stopped) return;
      const current = img.getAttribute("data-src");
      if (!current) return;
      await loadImgInto(img, current);
      img.classList.remove("is-loading");
    });
  };

  imgs
    .sort((a, b) => (a.getAttribute("data-priority") === "high" ? -1 : 1) - (b.getAttribute("data-priority") === "high" ? -1 : 1))
    .forEach((img) => requestLoad(img));

  return () => {
    stopped = true;
  };
};

const works = [
  {
    title: "针对于盲人的智能调味瓶设计",
    tag: "Product / 工业设计",
    desc: "以可触知信息与交互反馈为核心，提升无障碍使用体验。",
    images: [
      "./针对于盲人的智能调味瓶设计/p1.jpg",
      "./针对于盲人的智能调味瓶设计/p2.jpg",
      "./针对于盲人的智能调味瓶设计/p3.jpg",
      "./针对于盲人的智能调味瓶设计/p4.jpg",
      "./针对于盲人的智能调味瓶设计/p5.jpg",
      "./针对于盲人的智能调味瓶设计/p6.jpg",
    ],
  },
  {
    title: "“稻野原香”大米包装设计",
    tag: "Packaging / 包装",
    desc: "以主视觉与信息层级统一包装体系，强化货架识别。",
    images: [
      "./“稻野原香”大米包装设计/米1.jpg",
      "./“稻野原香”大米包装设计/米2.jpg",
      "./“稻野原香”大米包装设计/米3.jpg",
      "./“稻野原香”大米包装设计/米4.jpg",
      "./“稻野原香”大米包装设计/米5.jpg",
    ],
  },
  {
    title: "松辞白酒包装设计",
    tag: "Packaging / 白酒",
    desc: "以材质与版式秩序建立高级克制的品牌气质。",
    images: [
      "./松辞白酒包装设计/酒1.jpg",
      "./松辞白酒包装设计/酒2.jpg",
      "./松辞白酒包装设计/酒3.jpg",
      "./松辞白酒包装设计/酒4.jpg",
      "./松辞白酒包装设计/酒5.jpg",
    ],
  },
  {
    title: "仙玉叶茶叶包装设计",
    tag: "Packaging / 茶叶",
    desc: "在低饱和中建立质感对比，突出品牌识别与信息层级。",
    images: ["./仙玉叶茶叶包装设计/茶1.jpg", "./仙玉叶茶叶包装设计/茶2.jpg", "./仙玉叶茶叶包装设计/茶3.jpg", "./仙玉叶茶叶包装设计/茶4.jpg"],
  },
  {
    title: "悠悠酸奶包装设计",
    tag: "Packaging / 食品",
    desc: "以简洁信息架构与主视觉统一系列包装表达。",
    images: ["./悠悠酸奶包装设计/奶1.png", "./悠悠酸奶包装设计/奶2.jpg", "./悠悠酸奶包装设计/奶3.jpg"],
  },
];

const renderAbout = ({ mount }) => {
  mount.innerHTML = `
    <section class="section about view" aria-label="关于我">
      <div class="container about-inner">
        <div class="about-left">
          <p class="about-kicker">ABOUT ME</p>
          <h2 class="about-title">关于我</h2>
          <p class="about-text">
            我是一名视觉传达方向的设计学生，偏好克制的视觉表达与清晰的信息层级。擅长以系统化方法组织版式与视觉规范，在品牌、包装、IP与数字界面等方向保持一致性与可延展性。
          </p>
          <p class="about-text">
            我重视“留白即内容”的节奏控制，也关注细节的可读性与落地性。希望通过作品呈现审美、逻辑与执行的统一。
          </p>
          <div class="about-pills" role="list" aria-label="能力标签">
            <div class="pill" role="listitem">品牌视觉</div>
            <div class="pill" role="listitem">包装设计</div>
            <div class="pill" role="listitem">IP形象</div>
            <div class="pill" role="listitem">版式系统</div>
          </div>
        </div>
      </div>
    </section>
  `;

  return null;
};

const renderContact = ({ mount }) => {
  const year = String(new Date().getFullYear());

  mount.innerHTML = `
    <footer class="footer view" aria-label="联系方式">
      <div class="container footer-inner">
        <div class="footer-head">
          <h2 class="section-title">CONTACT</h2>
          <p class="section-desc">保持简洁的联系路径：邮箱优先，其次社交链接与PDF。</p>
        </div>
        <div class="footer-body">
          <a class="footer-link" href="mailto:3341366511@qq.com">3341366511@qq.com</a>
          <a class="footer-link" href="https://www.xiaohongshu.com/user/profile/4273133583" target="_blank" rel="noreferrer">小红书：4273133583</a>
          <a class="footer-link" href="https://www.instagram.com/" target="_blank" rel="noreferrer">Instagram</a>
          <a class="button button-primary" href="./portfolio.pdf" download>下载 PDF</a>
        </div>
      </div>
      <div class="container footer-bottom">
        <p class="fineprint">© ${year}</p>
        <p class="fineprint">Built with restraint.</p>
      </div>
    </footer>
  `;

  return null;
};

const renderNotFound = ({ mount }) => {
  mount.innerHTML = `
    <section class="view view-error" aria-label="页面不存在">
      <div class="container">
        <h1 class="error-title">404</h1>
        <p class="error-desc">页面不存在</p>
        <a class="button button-primary" href="#/">返回封面</a>
      </div>
    </section>
  `;
  return null;
};

const renderWork = ({ mount }) => {
  mount.innerHTML = `
    <section class="section works view" aria-label="作品展示">
      <div class="container">
        <div class="section-head">
          <h2 class="section-title">WORK</h2>
        </div>
        <div class="works-grid" role="list">
          ${works
            .map((w, idx) => {
              const cover = w.images[0] ? encodePath(w.images[0]) : "";
              const title = w.title.replaceAll('"', "&quot;");
              const tag = w.tag.replaceAll('"', "&quot;");
              const priority = idx < 3 ? "high" : "low";
              return `
                <article class="work" role="listitem" tabindex="0" aria-label="打开作品：${title}" data-index="${idx}">
                  <figure class="work-media" aria-hidden="true">
                    <img class="work-image" alt="${title} 封面" loading="lazy" decoding="async" src="${IMAGE_PLACEHOLDER}" data-src="${cover}" data-priority="${priority}" onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%221200%22%20height=%22900%22%20viewBox=%220%200%201200%20900%22%3E%3Crect%20width=%221200%22%20height=%22900%22%20fill=%22%23121214%22/%3E%3Crect%20x=%2270%22%20y=%2270%22%20width=%221060%22%20height=%22760%22%20rx=%2248%22%20fill=%22none%22%20stroke=%22%23ffffff%22%20stroke-opacity=%220.12%22%20stroke-width=%223%22/%3E%3Ctext%20x=%2260%22%20y=%22480%22%20fill=%22%23ffffff%22%20fill-opacity=%220.45%22%20font-family=%22Inter,Arial%22%20font-size=%2244%22%20letter-spacing=%226%22%3EIMAGE%20MISSING%3C/text%3E%3C/svg%3E';" />
                  </figure>
                  <div class="work-overlay">
                    <p class="work-tag">${tag}</p>
                    <h3 class="work-title">${title}</h3>
                    <p class="work-desc">点击查看</p>
                  </div>
                </article>
              `;
            })
            .join("")}
          <article class="work" data-coming-soon="true" tabindex="0" role="listitem" aria-label="尽请期待">
            <figure class="work-media" aria-hidden="true" style="display: flex; align-items: center; justify-content: center; background: var(--n-1);">
              <p style="margin: 0; color: var(--muted-2); font-size: 14px; letter-spacing: 0.2em; text-align: center;">尽请期待<br><br>COMING SOON</p>
            </figure>
            <div class="work-overlay">
              <p class="work-tag">Coming Soon</p>
              <h3 class="work-title">更多作品正在筹备中</h3>
              <p class="work-desc">Stay tuned</p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <div class="lightbox" id="lightbox" hidden>
      <div class="lightbox-backdrop" data-lightbox-close></div>
      <div class="lightbox-dialog" role="dialog" aria-modal="true" aria-label="作品预览">
        <button class="lightbox-close" type="button" data-lightbox-close aria-label="关闭">关闭</button>
        <div class="lightbox-meta">
          <p class="lightbox-tag" id="lightboxTag"></p>
          <h2 class="lightbox-title" id="lightboxTitle"></h2>
          <p class="lightbox-desc" id="lightboxDesc"></p>
          <p class="lightbox-count" id="lightboxCount"></p>
        </div>
        <div class="lightbox-stage">
          <button class="lightbox-nav" type="button" data-lightbox-prev aria-label="上一张">←</button>
          <p class="lightbox-loading" id="lightboxLoading" aria-live="polite" hidden>加载中…</p>
          <img class="lightbox-image" id="lightboxImage" alt="" />
          <button class="lightbox-nav" type="button" data-lightbox-next aria-label="下一张">→</button>
        </div>
      </div>
    </div>
  `;

  const lightbox = mount.querySelector("#lightbox");
  const imgEl = mount.querySelector("#lightboxImage");
  const titleEl = mount.querySelector("#lightboxTitle");
  const tagEl = mount.querySelector("#lightboxTag");
  const descEl = mount.querySelector("#lightboxDesc");
  const countEl = mount.querySelector("#lightboxCount");

  if (!lightbox || !imgEl || !titleEl || !tagEl || !descEl || !countEl) return null;

  const closeTargets = Array.from(lightbox.querySelectorAll("[data-lightbox-close]"));
  const prevBtn = lightbox.querySelector("[data-lightbox-prev]");
  const nextBtn = lightbox.querySelector("[data-lightbox-next]");
  const dialog = lightbox.querySelector(".lightbox-dialog");
  const stage = lightbox.querySelector(".lightbox-stage");
  const loadingEl = lightbox.querySelector("#lightboxLoading");

  let images = [];
  let index = 0;
  let lastFocused = null;
  let stageToken = 0;

  const setStage = () => {
    const total = images.length;
    if (total === 0) return;
    const safeIndex = ((index % total) + total) % total;
    index = safeIndex;

    const token = (stageToken += 1);
    const src = encodePath(images[index]);

    if (stage) stage.classList.add("is-loading");
    if (loadingEl) loadingEl.hidden = false;

    imgEl.onerror = () => {
      imgEl.onerror = null;
      imgEl.src =
        "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%221200%22%20height=%22900%22%20viewBox=%220%200%201200%20900%22%3E%3Crect%20width=%221200%22%20height=%22900%22%20fill=%22%23121214%22/%3E%3Crect%20x=%2270%22%20y=%2270%22%20width=%221060%22%20height=%22760%22%20rx=%2248%22%20fill=%22none%22%20stroke=%22%23ffffff%22%20stroke-opacity=%220.12%22%20stroke-width=%223%22/%3E%3Ctext%20x=%2260%22%20y=%22480%22%20fill=%22%23ffffff%22%20fill-opacity=%220.45%22%20font-family=%22Inter,Arial%22%20font-size=%2244%22%20letter-spacing=%226%22%3EIMAGE%20MISSING%3C/text%3E%3C/svg%3E";
      if (stage) stage.classList.remove("is-loading");
      if (loadingEl) loadingEl.hidden = true;
    };

    const temp = new Image();
    temp.decoding = "async";
    temp.src = src;
    Promise.resolve()
      .then(async () => {
        try {
          if (typeof temp.decode === "function") await temp.decode();
        } catch {}
        if (stageToken !== token) return;
        imgEl.src = src;
        if (stage) stage.classList.remove("is-loading");
        if (loadingEl) loadingEl.hidden = true;
      })
      .catch(() => {
        if (stageToken !== token) return;
        imgEl.src = src;
      });
    countEl.textContent = total > 1 ? `${index + 1} / ${total}` : "";

    const disableNav = total <= 1;
    if (prevBtn) prevBtn.disabled = disableNav;
    if (nextBtn) nextBtn.disabled = disableNav;

    if (total > 1) {
      const nextIndex = ((index + 1) % total + total) % total;
      const prevIndex = ((index - 1) % total + total) % total;
      [nextIndex, prevIndex].forEach((i) => {
        const warm = new Image();
        warm.decoding = "async";
        warm.src = encodePath(images[i]);
      });
    }
  };

  const open = (work, startIndex = 0) => {
    const list = Array.isArray(work?.images) ? work.images : [];
    if (list.length === 0) return;
    images = list;
    index = startIndex;

    titleEl.textContent = work?.title || "";
    tagEl.textContent = work?.tag || "";
    descEl.textContent = work?.desc || "";

    lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    lightbox.hidden = false;
    setStage();

    const focusEl = lightbox.querySelector(".lightbox-close");
    if (focusEl instanceof HTMLElement) focusEl.focus();
  };

  const close = () => {
    lightbox.hidden = true;
    imgEl.removeAttribute("src");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
    lastFocused = null;
    images = [];
    index = 0;
  };

  const go = (dir) => {
    if (images.length <= 1) return;
    index += dir;
    setStage();
  };

  const onPrev = () => go(-1);
  const onNext = () => go(1);

  const onKeydown = (event) => {
    if (lightbox.hidden) return;

    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
      return;
    }

    if (event.key === "Tab" && dialog) {
      const focusable = Array.from(
        dialog.querySelectorAll(
          'button:not([disabled]), a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el instanceof HTMLElement);

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      }
    }
  };

  const onClickWork = (event) => {
    const card = event.target instanceof Element ? event.target.closest(".work") : null;
    if (!card) return;
    if (card.hasAttribute("data-coming-soon")) {
      alert("更多作品正在筹备中，敬请期待！");
      return;
    }
    const idx = Number(card.getAttribute("data-index"));
    if (!Number.isFinite(idx) || !works[idx]) return;
    open(works[idx], 0);
  };

  const onKeyOpen = (event) => {
    if (!(event.target instanceof Element)) return;
    const card = event.target.closest(".work");
    if (!card) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    if (card.hasAttribute("data-coming-soon")) {
      alert("更多作品正在筹备中，敬请期待！");
      return;
    }
    const idx = Number(card.getAttribute("data-index"));
    if (!Number.isFinite(idx) || !works[idx]) return;
    open(works[idx], 0);
  };

  closeTargets.forEach((el) => el.addEventListener("click", close));
  if (prevBtn) prevBtn.addEventListener("click", onPrev);
  if (nextBtn) nextBtn.addEventListener("click", onNext);
  mount.addEventListener("click", onClickWork);
  mount.addEventListener("keydown", onKeyOpen);
  document.addEventListener("keydown", onKeydown);
  const cleanupLazy = setupLazyImages(mount);

  return () => {
    closeTargets.forEach((el) => el.removeEventListener("click", close));
    if (prevBtn) prevBtn.removeEventListener("click", onPrev);
    if (nextBtn) nextBtn.removeEventListener("click", onNext);
    mount.removeEventListener("click", onClickWork);
    mount.removeEventListener("keydown", onKeyOpen);
    document.removeEventListener("keydown", onKeydown);
    cleanupLazy();
    close();
  };
};

registry["/"] = renderHome;
registry["/work"] = renderWork;
registry["/about"] = renderAbout;
registry["/contact"] = renderContact;
registry["/notfound"] = renderNotFound;

let cleanup = null;
let currentRoute = null;

const renderRoute = async () => {
  if (!app) return;

  const route = getRoute();
  currentRoute = route;

  if (cleanup) {
    try {
      cleanup();
    } catch {}
    cleanup = null;
  }

  if (route === "/") {
    cleanup = renderHome({ mount: app, route, navigate: setRoute }) || null;
    app.focus();
    return;
  }

  renderLoading();

  try {
    const mod = registry[route] || registry["/notfound"];
    if (typeof mod !== "function") throw new Error("模块入口缺失");
    cleanup = mod({ mount: app, route, navigate: setRoute }) || null;
    app.focus();
  } catch (e) {
    if (currentRoute !== route) return;
    const msg = e instanceof Error ? e.message : String(e);
    renderError(msg, () => renderRoute());
  }
};

document.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target : null;
  const link = target?.closest("a");
  if (!link) return;
  const href = link.getAttribute("href");
  if (!isInternalNav(href)) return;
  event.preventDefault();
  setRoute(href.slice(1));
});

window.addEventListener("hashchange", renderRoute);

if (!window.location.hash) setRoute("/");
renderRoute();
