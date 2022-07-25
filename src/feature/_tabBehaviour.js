(() => {
  setTabs = (theme) => {
    let searchIntervalNew = setInterval(() => {
      let hasThemeIframe = document.querySelector(`[title="Online Store"]`)
      if (!hasThemeIframe) return;

      let hasThemeContent = hasThemeIframe.contentDocument.querySelector('[data-diffy-attribute="sidebar"]')
      if (!hasThemeContent) return;

      clearInterval(searchIntervalNew);

      let path = chrome.extension.getURL(`src/themes/${theme}.css`);
      let iframeTo = document.querySelector(`[title="Online Store"]`);
      var cssLink = document.createElement("link");
      cssLink.href = path;
      cssLink.rel = "stylesheet";
      cssLink.type = "text/css";
      iframeTo.contentWindow.document.body.appendChild(cssLink);
    }, 500);
  }

  getTabs = () => {
    chrome.storage.sync.get("tabBehaviour", function (data) {
      data.tabBehaviour == "Stack" &&
        setTabs('tabs');
    });
  }

  // Detect page change
  let previousUrl = '';
  const observer = new MutationObserver(() => {
    if (location.href !== previousUrl) {
      previousUrl = location.href;
      if (location.href.includes('/themes/') && !location.href.includes('editor')) {
        getTabs();
      }
    }
  });

  const config = { subtree: true, childList: true };
  observer.observe(document, config);
})();
