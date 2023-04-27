chrome.storage.sync.get("fontSizeSetting", function (data) {
  let fontSize = 12

  if (data.fontSizeSetting)
    fontSize = data.fontSizeSetting;

  (() => {
    injectFont = () => {
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

        // Inject CSS stylesheet into iframe
        let css = document.createElement('style');
        css.type = 'text/css';
        css.textContent = `.ͼ1 .cm-line, [data-diffy-attribute] span {
          font-size: ${fontSize}px !important;
        }`

        frameDocument.body.appendChild(css);
      }, 500);
    };

    // Detect page change
    let previousUrl = "";
    const observer = new MutationObserver(() => {
      if (location.href !== previousUrl) {
        previousUrl = location.href;
        if (
          location.href.includes("/themes/") &&
          !location.href.includes("editor")
        )
          injectFont();
      }
    });

    const config = { subtree: true, childList: true };
    observer.observe(document, config);
  })();
});