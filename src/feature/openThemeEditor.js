// Extension can't access local page variables/context so this snippet is injected and executing
// Gets theme id from Shopify object and opens the code editor for current theme

(function () {
  let script = document.createElement("script");
  script.src = chrome.runtime.getURL('src/feature/openThemeEditor-content.js');;
  (document.head || document.documentElement).appendChild(script);
  script.remove();
})();
