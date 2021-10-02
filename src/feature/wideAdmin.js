let selector = 'div[class^="Polaris-Frame__Content"] div[class^="Polaris-Page_"]'

// Fetch setting and apply
chrome.storage.sync.get("wideAdmin", function (data) {
  if (data.wideAdmin) applyWidth();
});

applyWidth = () => {
  setInterval(() => {
    if (selector){
      let pageContent = document.querySelector(selector)
      pageContent.style.setProperty('max-width', 'unset', 'important');  
    }
  }, 1000);
};
