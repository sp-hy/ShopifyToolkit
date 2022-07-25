(() => {
  setTheme = (theme) => {
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

      if (theme != 'common')
        iframeTo.contentWindow.document.body.querySelector('#app').firstElementChild.setAttribute('p-color-scheme', 'dark');
    }, 500);
  }

  getTheme = () => {
    chrome.storage.sync.get("chosenTheme", function (data) {
      // Fallback to vscode if no default theme has been chosen
      let chosenTheme = data.chosenTheme.toLowerCase() || "vscode";
      chosenTheme != "none" &&
        setTheme(chosenTheme);
      setTheme('common');
    });
  }

  // Detect page change
  let previousUrl = '';
  const observer = new MutationObserver(() => {
    if (location.href !== previousUrl) {
      previousUrl = location.href;
      if (location.href.includes('/themes/') && !location.href.includes('editor')) {
        getTheme();
        try {
          let iFrame = document.querySelector(`[title="Online Store"]`)
          chrome.storage.sync.get("chosenTheme", function (data) {
            data.chosenTheme.toLowerCase() != "none" &&
              iFrame && iFrame.contentWindow.document.body.querySelector('#app').firstElementChild.setAttribute('p-color-scheme', 'dark')
          });
        } catch (error) { }
      } else {
        try {
          let iFrame = document.querySelector(`[title="Online Store"]`)
          iFrame && iFrame.contentWindow.document.body.querySelector('#app').firstElementChild.setAttribute('p-color-scheme', 'light')
        } catch (error) { }
      }
    }
  });

  const config = { subtree: true, childList: true };
  observer.observe(document, config);
})();
