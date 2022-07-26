// Extension can't access local page variables/context so this snippet is injected and executing
// Opens /admin page for current store

(function () {
  let script = document.createElement("script");
  script.src = chrome.runtime.getURL('src/feature/openAdmin-content.js');
  (document.head || document.documentElement).appendChild(script);
  script.remove();
})();
