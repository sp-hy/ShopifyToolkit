// Extension can't access local page variables/context so this snippet is injected and executing
// Opens /admin page for current store

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
