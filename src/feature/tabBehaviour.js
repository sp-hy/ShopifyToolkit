// Fetch setting and apply editor theme
chrome.storage.sync.get("tabBehaviour", function (data) {
  // Fallback to vscode if no default theme has been chosen

  data.tabBehaviour == "Stack" &&
    chrome.runtime.sendMessage({
      type: "ApplyTheme",
      themeName: "tabs",
    });
});
