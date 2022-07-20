(() => {
  launchTheme = () => {
    let searchIntervalNew = setInterval(() => {
      let hasThemeIframe = document.querySelector(`[title="Online Store"]`).contentDocument.querySelector('[data-diffy-attribute="sidebar"]')
      if (!hasThemeIframe) return;

      clearInterval(searchIntervalNew);

      let path = chrome.extension.getURL('src/themes/vscode-new.css');
      let iframeTo = document.querySelector(`[title="Online Store"]`)
      var cssLink = document.createElement("link") 
      cssLink.href = path
      cssLink .rel = "stylesheet"; 
      cssLink .type = "text/css"; 
      iframeTo.contentWindow.document.body.appendChild(cssLink);
      iframeTo.contentWindow.document.body.querySelector('#app').firstElementChild.setAttribute('p-color-scheme', 'dark')
    }, 500);
  }
  
  launchTheme();
  
  // Detect page change
  let previousUrl = '';
  const observer = new MutationObserver(() => {
    if (location.href !== previousUrl) {
        previousUrl = location.href;
        if (location.href.includes('/themes/') && !location.href.includes('editor')) {
          launchTheme();
          try {
            let iFrame = document.querySelector(`[title="Online Store"]`)      
            iFrame.contentWindow.document.body.querySelector('#app').firstElementChild.setAttribute('p-color-scheme', 'dark')
          } catch (error) {}
        } else {
          try {
            let iFrame = document.querySelector(`[title="Online Store"]`)      
            iFrame.contentWindow.document.body.querySelector('#app').firstElementChild.setAttribute('p-color-scheme', 'light')  
          } catch (error) {}
        }
      }
  });

  const config = {subtree: true, childList: true};
  observer.observe(document, config);
})();
