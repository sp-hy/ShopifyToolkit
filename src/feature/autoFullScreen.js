let interval = setInterval(() => {
  if (!$(".template-editor-tab-bar__action").length) return;

  clearInterval(interval);

  // Hide fullscreen button
  $(".template-editor-tab-bar__action").hide();

  // Add fullscreen class to body
  $("body").addClass("fullscreen-mode");
}, 500);