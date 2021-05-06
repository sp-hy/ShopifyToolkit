(function () {
  let injectScript = `
  (function() {
    let shopURL = Shopify.shop;  
    window.open("https://" + shopURL + '/admin/');
  })();
`;

  let script = document.createElement("script");
  script.textContent = injectScript;
  (document.head || document.documentElement).appendChild(script);
  script.remove();
})();
