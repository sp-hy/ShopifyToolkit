// Theme loader
chrome.extension.onMessage.addListener(function (request, sender) {
  if (request.type == "ApplyTheme") {
    chrome.tabs.insertCSS(sender.tab.id, {
      file: `src/themes/${request.themeName}.css`,
    });
  }

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var currentTab = tabs[0].id;
    if (request.type == "openResource") {
      chrome.tabs.executeScript(currentTab, {
        file: "/src/feature/openResource.js",
      });
    }
    if (request.type == "openAdmin") {
      chrome.tabs.executeScript(currentTab, {
        file: "/src/feature/openAdmin.js",
      });
    }
    if (request.type == "openThemeEditor") {
      chrome.tabs.executeScript(currentTab, {
        file: "/src/feature/openThemeEditor.js",
      });
    }
    if (request.type == "openCodeEditor") {
      chrome.tabs.executeScript(currentTab, {
        file: "/src/feature/openCodeEditor.js",
      });
    }
  });
});
