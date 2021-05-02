document.addEventListener("DOMContentLoaded", function (event) {
  // Locate theme selector
  let themeSetting = document.querySelector('.setting-theme')

  // Load previous value
  chrome.storage.sync.get('chosenTheme', function (data) {
    themeSetting.value = data.chosenTheme
  });

  // Set new value on change
  themeSetting.addEventListener('change', e => {
    let chosenTheme = e.target.value
    chrome.storage.sync.set({ chosenTheme: chosenTheme });
  })
});
