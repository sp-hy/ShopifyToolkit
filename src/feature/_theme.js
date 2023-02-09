(() => {
  setTheme = (theme) => {
    // Create setInterval to act as a listener until theme editor elements exist
    let searchIntervalNew = setInterval(() => {
      // Locate iframe and sidebar
      let hasThemeIframe = document.querySelector(`main iframe`);

      let frameDocument =
        (hasThemeIframe && hasThemeIframe.contentDocument) || document;

      let hasThemeContent =
        (hasThemeIframe &&
          hasThemeIframe.contentDocument &&
          hasThemeIframe.contentDocument.querySelector(
            '[data-diffy-attribute="sidebar"]'
          )) ||
        document.querySelector('[data-diffy-attribute="sidebar"]');
      if (!hasThemeContent) return;

      // Element found, clear interval
      clearInterval(searchIntervalNew);

      // Inject theme CSS stylesheet into iframe
      let path = chrome.runtime.getURL(`src/themes/${theme}.css`);
      var cssLink = document.createElement("link");
      cssLink.href = path;
      cssLink.rel = "stylesheet";
      cssLink.type = "text/css";
      frameDocument.body.appendChild(cssLink);

      if (theme != "common")
        frameDocument.body
          .querySelector("#app")
          .firstElementChild.setAttribute("p-color-scheme", "dark");
      frameDocument.body.classList.add("dark");
    }, 500);
  };

  getTheme = () => {
    chrome.storage.sync.get("chosenTheme", function (data) {
      // Fallback to vscode if no default theme has been chosen
      let chosenTheme =
        (data.chosenTheme && data.chosenTheme.toLowerCase()) || "vscode";
      chosenTheme != "none" && setTheme(chosenTheme);
      setTheme("common");
    });
  };

  // Detect page change
  let previousUrl = "";
  const observer = new MutationObserver(() => {
    let iframeTo = document.querySelector(`main iframe`);
    let frameDocument = (iframeTo && iframeTo.contentDocument) || document;

    if (location.href !== previousUrl) {
      previousUrl = location.href;
      if (
        location.href.includes("/themes/") &&
        !location.href.includes("editor")
      ) {
        getTheme();
        try {
          chrome.storage.sync.get("chosenTheme", function (data) {
            typeof data.chosenTheme == "undefined" ||
              (data.chosenTheme.toLowerCase() != "none" &&
                frameDocument
                  .querySelector("#app")
                  .firstElementChild.setAttribute("p-color-scheme", "dark"));
            frameDocument.body.classList.add("dark");
          });
        } catch (error) {}
      } else {
        try {
          frameDocument
            .querySelector("#app")
            .firstElementChild.setAttribute("p-color-scheme", "light");
          frameDocument.body.classList.remove("dark");
        } catch (error) {}
      }
    }
  });

  const config = { subtree: true, childList: true };
  observer.observe(document, config);
})();
