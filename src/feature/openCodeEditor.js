(function () {
  let injectScript = `
  (function() {
    let shopURL = Shopify.shop;  
    let themeID = Shopify.theme.id;  

    window.open("https://" + shopURL + "/admin/themes/" + themeID)
  })();
`;

  let script = document.createElement("script");
  script.textContent = injectScript;
  (document.head || document.documentElement).appendChild(script);
  script.remove();
})();
