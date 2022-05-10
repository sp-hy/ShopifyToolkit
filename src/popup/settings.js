document.addEventListener("DOMContentLoaded", function (event) {
  // Locate theme selector
  let themeSetting = document.querySelector(".setting-select");
  // Load previous value
  chrome.storage.sync.get("chosenTheme", function (data) {
    themeSetting.value = data.chosenTheme;
  });
  // Set new value on change
  themeSetting.addEventListener("change", (e) => {
    let chosenTheme = e.target.value;
    chrome.storage.sync.set({ chosenTheme: chosenTheme });
  });

  let tabSetting = document.querySelector(".setting-tab");
  // Load previous value
  chrome.storage.sync.get("tabBehaviour", function (data) {
    tabSetting.value = data.tabBehaviour;
  });
  // Set new value on change
  tabSetting.addEventListener("change", (e) => {
    let tabBehaviour = e.target.value;
    chrome.storage.sync.set({ tabBehaviour: tabBehaviour });
  });

  var checkboxWrap = document.querySelector("#word-wrap");

  checkboxWrap.addEventListener("change", (e) => {
    if (e.target.checked) {
      chrome.storage.sync.set({ wrapChecked: true });
    } else {
      chrome.storage.sync.set({ wrapChecked: false });
    }
  });

  var checkboxWide = document.querySelector("#wide-admin");

  checkboxWide.addEventListener("change", (e) => {
    if (e.target.checked) {
      chrome.storage.sync.set({ wideAdmin: true });
    } else {
      chrome.storage.sync.set({ wideAdmin: false });
    }
  });

  // Load previous value
  chrome.storage.sync.get("wrapChecked", function (data) {
    if (data.wrapChecked) checkboxWrap.setAttribute("checked", "true");
  });

  chrome.storage.sync.get("wideAdmin", function (data) {
    if (data.wideAdmin) checkboxWide.setAttribute("checked", "true");
  });

  let openResourceButton = document.querySelector(".button-resource");
  openResourceButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({
      type: "openResource",
    });
  });

  let openAdmin = document.querySelector(".button-admin");
  openAdmin.addEventListener("click", () => {
    chrome.runtime.sendMessage({
      type: "openAdmin",
    });
  });

  let openThemeEditor = document.querySelector(".button-theme-editor");
  openThemeEditor.addEventListener("click", () => {
    chrome.runtime.sendMessage({
      type: "openThemeEditor",
    });
  });

  let openCodeEditor = document.querySelector(".button-code-editor");
  openCodeEditor.addEventListener("click", () => {
    chrome.runtime.sendMessage({
      type: "openCodeEditor",
    });
  });
});
