// Extension can't access local page variables/context so this snippet is injected and executing
// Gets theme id from Shopify object and opens the code editor for current theme

(function () {
  let injectScript = `
  (function() {
    let shopURL = Shopify.shop;  
    let themeID = Shopify.theme.id;  

    window.open("https://" + shopURL + "/admin/themes/" + themeID + '/editor')
  })();
`;

  let script = document.createElement("script");
  script.textContent = injectScript;
  (document.head || document.documentElement).appendChild(script);
  script.remove();
})();
