// Apply main theme
chrome.runtime.sendMessage({
  type: "ApplyTheme",
  themeName: "vscode",
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