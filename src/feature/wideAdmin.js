// Fetch setting and apply
chrome.storage.sync.get("wideAdmin", function (data) {
  if (data.wideAdmin) applyWidth();
});

applyWidth = () => {
  setInterval(() => {
    // Most admin pages
    let mainContainer = document.querySelector(
      'div[class^="Polaris-Frame__Content"] div[class^="Polaris-Page_"]'
    );
    if (mainContainer) {
      mainContainer.style.setProperty("max-width", "unset", "important");
    }

    // App page
    let appContainer = document.querySelector("._9u-Hv");
    if (appContainer) {
      appContainer.style.setProperty("display", "none", "important");
    }

    // Settings page
    let settingsContainer = document.querySelector("._1e0Kf");
    if (settingsContainer) {
      settingsContainer.style.setProperty("width", "unset", "important");
      settingsContainer.style.setProperty("width", "100%", "important");
    }

    // Notification editor
    let editorContainer = document.querySelector(".ilNbO");
    let editor = document.querySelector(".Polaris-Page_yisnh");

    if (editorContainer) {
      editorContainer.style.setProperty("max-width", "100%", "important");
      editorContainer.style.setProperty("width", "100%", "important");
    }
    if (editor) {
      editor.style.setProperty("max-width", "100%", "important");
      editor.style.setProperty("width", "100%", "important");
    }

    // themes page iframe
    let themeIframe = document.querySelector("main iframe");
    if (themeIframe) {
      try {
        let elmnt =
          themeIframe.contentWindow &&
          themeIframe.contentWindow.document.querySelector(
            ".Polaris-Page_yisnh"
          );
        if (elmnt) elmnt.style.setProperty("max-width", "unset", "important");
      } catch (error) {}
    }
  }, 1000);
};
