// Theme loader
chrome.extension.onMessage.addListener(function (request, sender) {
  if (request.type == "ApplyTheme") {
    chrome.tabs.insertCSS(sender.tab.id, {
      file: `src/themes/${request.themeName}.css`,
    });
  }
});
