let selector = 

// Fetch setting and apply
chrome.storage.sync.get("wideAdmin", function (data) {
  if (data.wideAdmin) applyWidth();
});

applyWidth = () => {
  setInterval(() => {
    let mainContainer = document.querySelector('div[class^="Polaris-Frame__Content"] div[class^="Polaris-Page_"]')
    if (mainContainer){
      mainContainer.style.setProperty('max-width', 'unset', 'important');  
    }

    let appContainer = document.querySelector('._9u-Hv')
    if (appContainer){
      appContainer.style.setProperty('display', 'none', 'important')
    }

    let settingsContainer = document.querySelector('._1e0Kf')
    if (settingsContainer){
      settingsContainer.style.setProperty('width', 'unset', 'important');  
      settingsContainer.style.setProperty('width', '100%', 'important');  

    }

    let themeContainer = document.querySelector('.Polaris-Page_yisnh')
    if (themeContainer){
      themeContainer.style.setProperty('max-width', 'unset', 'important');  
    }
  }, 1000);
};
