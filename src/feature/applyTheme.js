// Fetch setting and apply editor theme
chrome.storage.sync.get("chosenTheme", function (data) {
  // Fallback to vscode if no default theme has been chosen
  let chosenTheme = data.chosenTheme || "vscode";

  data.chosenTheme != "none" &&
    chrome.runtime.sendMessage({
      type: "ApplyTheme",
      themeName: chosenTheme.toLowerCase(),
    });
});

// Apply icon theme
chrome.runtime.sendMessage({
  type: "ApplyTheme",
  themeName: "icons",
});

// Apply slimUI theme
chrome.runtime.sendMessage({
  type: "ApplyTheme",
  themeName: "slimUI",
});

// Apply autocomplete theme
chrome.runtime.sendMessage({
  type: "ApplyTheme",
  themeName: "autoComplete",
});
