let slimInterval = setInterval(() => {
  if (!$(".template-editor-titlebar").length) return;
  clearInterval(slimInterval);

  let $fileOverview = $(".file-overview");
  let $titlebar = $(".template-editor-titlebar");

  $titlebar.append($fileOverview);
}, 500);
