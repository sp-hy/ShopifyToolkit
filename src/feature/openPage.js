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
          case "themeEditor":
            window.open(adminUrl("/themes/" + Shopify.theme.id + "/editor"));
            break;
          case "codeEditor":
            window.open(adminUrl("/themes/" + Shopify.theme.id));
            break;
        }
      },
      args: [action],
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
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
});
