let lineWrapInterval = setInterval(() => {
  if (!$(".template-editor-titlebar").length) return;
  clearInterval(lineWrapInterval);

  let injectScript = `
  (function() {
    let editor = document.querySelector(".CodeMirror").CodeMirror;
    editor.setOption('lineWrapping', true)
  })();
  `;

  let script = document.createElement("script");
  script.textContent = injectScript;
  (document.head || document.documentElement).appendChild(script);
  script.remove();
}, 500);
