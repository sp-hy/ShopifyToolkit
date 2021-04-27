let slimInterval = setInterval(() => {
  if (!$(".template-editor-titlebar").length) return;
  clearInterval(slimInterval);

  let $fileOverview = $(".file-overview");
  let $titlebar = $(".template-editor-titlebar");

  $titlebar.append($fileOverview);

  // Apply slimUI theme
  chrome.runtime.sendMessage({
    type: "ApplyTheme",
    themeName: "slimUI",
  });
}, 500);