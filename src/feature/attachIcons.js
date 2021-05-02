let iconInterval = setInterval(() => {
  if (!$(".template-editor-tab-filename").length) return;

  // Get list of file elements
  let fileList = document.querySelectorAll(".asset-listing-theme-file");

  // Apply icon classes to file elements
  for (let file of fileList) {
    let fileName = file.querySelector("span");
    let fileIcon = file.querySelector("svg");

    switch (true) {
      case fileName.innerText.includes(".json"):
        fileIcon.style.fill = "orange";
        fileIcon.style.display = "inline";
        break;
      case fileName.innerText.includes(".js") ||
        fileName.innerText.includes(".js.liquid"):
        fileIcon.parentNode.classList.add("is-js");
        fileIcon.style.display = "none";
        break;
      case fileName.innerText.includes(".scss") ||
        fileName.innerText.includes(".scss.liquid"):
        fileIcon.parentNode.classList.add("is-scss");
        fileIcon.style.display = "none";
        break;
      case fileName.innerText.includes(".css") ||
        fileName.innerText.includes(".css.liquid"):
        fileIcon.parentNode.classList.add("is-css");
        fileIcon.style.display = "none";
        break;
      case fileName.innerText.includes(".liquid"):
        fileIcon.style.fill = "rgb(140, 190, 70)";
        fileIcon.style.display = "inline";
        break;
    }
  }

  // Get list of open tabs
  let tabList = document.querySelectorAll(".template-editor-tab-filename");

  // Apply icon classes tabs
  for (let tab of tabList) {
    switch (true) {
      case tab.innerText.includes(".json"):
        tab.classList.add("is-json");
        break;
      case tab.innerText.includes(".js") ||
        tab.innerText.includes(".js.liquid"):
        tab.classList.add("is-js");
        break;
      case tab.innerText.includes(".scss") ||
        tab.innerText.includes(".scss.liquid"):
        tab.classList.add("is-scss");
        break;
      case tab.innerText.includes(".css") ||
        tab.innerText.includes(".css.liquid"):
        tab.classList.add("is-css");
        break;
      case tab.innerText.includes(".liquid"):
        tab.classList.add("is-liquid");
        break;
    }
  }
}, 500);
