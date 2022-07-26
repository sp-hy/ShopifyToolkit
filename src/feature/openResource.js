// Extension can't access local page variables/context so this snippet is injected and executing
// Gets resource ID from the __st object, decides what kind of page based on the URL and opens the appropriate admin page

(function () {
  let script = document.createElement("script");
  script.src = chrome.runtime.getURL('src/feature/openResource-content.js');
  (document.head || document.documentElement).appendChild(script);
  script.remove();
})();
