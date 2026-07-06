function openShortcut(action) {
  chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      world: "MAIN",
      func: (action) => {
        const store = Shopify.shop.replace(/\.myshopify\.com$/, "");
        const adminUrl = (path) => {
          const base = "https://admin.shopify.com/store/" + store;
          if (!path) return base;
          return base + (path.startsWith("/") ? path : "/" + path);
        };

        const themeEditorPreviewPath = () => {
          let previewPath = window.location.pathname;
          const view = new URLSearchParams(window.location.search).get(
            "view"
          );

          if (view) {
            previewPath += "?view=" + view;
          } else {
            const meta = document.querySelector(
              'meta[property="theme:template"]'
            );
            if (meta?.content) {
              const dot = meta.content.indexOf(".");
              if (dot !== -1) {
                previewPath += "?view=" + meta.content.slice(dot + 1);
              }
            } else if (document.body) {
              const templateClasses = [...document.body.classList].filter((c) =>
                c.startsWith("template-")
              );
              templateClasses.sort((a, b) => b.length - a.length);
              const rest = templateClasses[0]?.slice("template-".length);
              const baseTypes = [
                "list-collections",
                "product",
                "collection",
                "page",
                "article",
                "blog",
                "cart",
                "search",
                "index",
              ];
              for (const type of baseTypes) {
                const prefix = type + "-";
                if (rest?.startsWith(prefix)) {
                  previewPath += "?view=" + rest.slice(prefix.length);
                  break;
                }
              }
            }
          }

          return previewPath;
        };

        switch (action) {
          case "admin":
            window.open(adminUrl());
            break;
          case "resource": {
            const resourceID = typeof __st !== "undefined" ? __st.rid : undefined;
            if (resourceID === undefined) return;

            const url = window.location.href;
            let path = "";
            if (url.includes("/products/") || url.includes("%2Fproducts%2F")) {
              path = "/products/";
            } else if (
              url.includes("/collections/") ||
              url.includes("%2Fcollections%2F")
            ) {
              path = "/collections/";
            } else if (url.includes("/pages/") || url.includes("%2Fpages%2F")) {
              path = "/pages/";
            } else if (url.includes("/blogs/") || url.includes("%2Fblogs%2F")) {
              path = "/articles/";
            }

            if (path) window.open(adminUrl(path + resourceID));
            break;
          }
          case "themeEditor": {
            const previewPath = themeEditorPreviewPath();
            const editorUrl =
              "/themes/" +
              Shopify.theme.id +
              "/editor?previewPath=" +
              encodeURIComponent(previewPath);
            window.open(adminUrl(editorUrl));
            break;
          }
          case "codeEditor":
            window.open(adminUrl("/themes/" + Shopify.theme.id));
            break;
          case "sidekick":
            window.open(adminUrl("/sidekick"));
            break;
        }
      },
      args: [action],
    });
  });
}

function copyAction(action) {
  chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
    chrome.scripting
      .executeScript({
        target: { tabId: tab.id },
        world: "MAIN",
        func: (action) => {
          if (typeof Shopify === "undefined" || !Shopify.theme) return null;

          const store = Shopify.shop.replace(/\.myshopify\.com$/, "");
          const adminUrl = (path) => {
            const base = "https://admin.shopify.com/store/" + store;
            if (!path) return base;
            return base + (path.startsWith("/") ? path : "/" + path);
          };

          switch (action) {
            case "themeName":
              return Shopify.theme.name;
            case "themeId":
              return String(Shopify.theme.id);
            case "themePreviewUrl": {
              const url = new URL(window.location.origin + "/");
              url.searchParams.set(
                "preview_theme_id",
                String(Shopify.theme.id)
              );
              return url.href;
            }
            case "themeEditorUrl":
              return adminUrl("/themes/" + Shopify.theme.id + "/editor");
          }
        },
        args: [action],
      })
      .then(([result]) => {
        const text = result?.result;
        if (!text) return;

        navigator.clipboard.writeText(text).then(closeCopyPanel);
      });
  });
}

function openCopyPanel() {
  document.getElementById("copyOverlay").hidden = false;
}

function closeCopyPanel() {
  document.getElementById("copyOverlay").hidden = true;
}

function loadStoreInfo() {
  const storeNameEl = document.getElementById("storeName");
  const themeNameEl = document.getElementById("themeName");
  const unavailable = "n/a";

  chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
    chrome.scripting
      .executeScript({
        target: { tabId: tab.id },
        world: "MAIN",
        func: () => {
          if (typeof Shopify === "undefined") return null;
          return {
            shop: Shopify.shop.replace(/\.myshopify\.com$/, ""),
            themeName: Shopify.theme?.name,
          };
        },
      })
      .then(([result]) => {
        const info = result?.result;
        storeNameEl.textContent = info?.shop || unavailable;
        themeNameEl.textContent = info?.themeName || unavailable;
      })
      .catch(() => {
        storeNameEl.textContent = unavailable;
        themeNameEl.textContent = unavailable;
      });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  loadStoreInfo();
  document
    .querySelector(".button-admin")
    .addEventListener("click", () => openShortcut("admin"));
  document
    .querySelector(".button-resource")
    .addEventListener("click", () => openShortcut("resource"));
  document
    .querySelector(".button-theme-editor")
    .addEventListener("click", () => openShortcut("themeEditor"));
  document
    .querySelector(".button-code-editor")
    .addEventListener("click", () => openShortcut("codeEditor"));
  document
    .querySelector(".button-sidekick")
    .addEventListener("click", () => openShortcut("sidekick"));
  document
    .querySelector(".button-copy-trigger")
    .addEventListener("click", openCopyPanel);
  document
    .querySelector(".copy-panel-close")
    .addEventListener("click", closeCopyPanel);
  document.getElementById("copyOverlay").addEventListener("click", (event) => {
    if (event.target.id === "copyOverlay") closeCopyPanel();
  });
  document
    .querySelector(".button-copy-theme-name")
    .addEventListener("click", () => copyAction("themeName"));
  document
    .querySelector(".button-copy-theme-id")
    .addEventListener("click", () => copyAction("themeId"));
  document
    .querySelector(".button-copy-theme-preview-url")
    .addEventListener("click", () => copyAction("themePreviewUrl"));
  document
    .querySelector(".button-copy-theme-editor-url")
    .addEventListener("click", () => copyAction("themeEditorUrl"));
});
