(() => {
  window.iconsLoaded = false;

  attachIcons = () => {
    // Create setInterval to act as a listener until theme editor elements exist
    let iconIntervalListener = setInterval(() => {
      // Locate iframe and sidebar
      let hasThemeIframe = document.querySelector(`main iframe`);

      let frameDocument =
        (hasThemeIframe && hasThemeIframe.contentDocument) || document;

      let hasSidebar =
        (hasThemeIframe &&
          hasThemeIframe.contentDocument &&
          hasThemeIframe.contentDocument.querySelector(
            '[data-diffy-attribute="sidebar"]'
          )) ||
        document.querySelector('[data-diffy-attribute="sidebar"]');
      if (!hasSidebar) return;

      // Element found, clear interval
      clearInterval(iconIntervalListener);

      window.iconsLoaded = true;

      // Inject icon CSS stylesheet into iframe
      let path = chrome.runtime.getURL("src/themes/icons.css");
      var cssLink = document.createElement("link");
      cssLink.href = path;
      cssLink.rel = "stylesheet";
      cssLink.type = "text/css";

      frameDocument.body.appendChild(cssLink);

      setInterval(() => {
        // Locate iframe and file list

        let fileList = frameDocument.querySelectorAll(
          '[aria-label="File picker"] li[data-diffy-attribute^="fileName-"]'
        );
        // Apply icon classes to file elements
        for (let file of fileList) {
          let fileIcon = file.querySelector("svg");

          switch (true) {
            case file.getAttribute("data-diffy-attribute").includes(".json"):
              fileIcon.style.fill = "orange";
              fileIcon.style.display = "inline";
              break;
            case file.getAttribute("data-diffy-attribute").includes(".js") ||
              file.getAttribute("data-diffy-attribute").includes(".js.liquid"):
              fileIcon.parentNode.classList.add("is-js");
              fileIcon.style.display = "none";
              break;
            case file.getAttribute("data-diffy-attribute").includes(".scss") ||
              file
                .getAttribute("data-diffy-attribute")
                .includes(".scss.liquid"):
              fileIcon.parentNode.classList.add("is-scss");
              fileIcon.style.display = "none";
              break;
            case file.getAttribute("data-diffy-attribute").includes(".css") ||
              file.getAttribute("data-diffy-attribute").includes(".css.liquid"):
              fileIcon.parentNode.classList.add("is-css");
              fileIcon.style.display = "none";
              break;
            case file.getAttribute("data-diffy-attribute").includes(".liquid"):
              fileIcon.style.fill = "rgb(140, 190, 70)";
              fileIcon.style.display = "inline";
              break;
          }
        }
      }, 500);

      setInterval(() => {
        let tabList = frameDocument.querySelectorAll(
          '[data-diffy-attribute="tablist"] [data-diffy-attribute]'
        );

        // Apply icon classes tabs
        for (let tab of tabList) {
          switch (true) {
            case tab.getAttribute("data-diffy-attribute").includes(".json"):
              tab.classList.add("is-json");
              break;
            case tab.getAttribute("data-diffy-attribute").includes(".js") ||
              tab.getAttribute("data-diffy-attribute").includes(".js.liquid"):
              tab.classList.add("is-js");
              break;
            case tab.getAttribute("data-diffy-attribute").includes(".scss") ||
              tab.getAttribute("data-diffy-attribute").includes(".scss.liquid"):
              tab.classList.add("is-scss");
              break;
            case tab.getAttribute("data-diffy-attribute").includes(".css") ||
              tab.getAttribute("data-diffy-attribute").includes(".css.liquid"):
              tab.classList.add("is-css");
              break;
            case tab.getAttribute("data-diffy-attribute").includes(".liquid"):
              tab.classList.add("is-liquid");
              break;
          }
        }
      }, 500);
    }, 500);
  };

  // Detect page change
  let previousUrl = "";
  const observer = new MutationObserver(() => {
    if (location.href !== previousUrl) {
      previousUrl = location.href;
      if (
        location.href.includes("/themes/") &&
        !location.href.includes("editor") &&
        !window.iconsLoaded
      )
        attachIcons();
    }
  });

  const config = { subtree: true, childList: true };
  observer.observe(document, config);
})();
