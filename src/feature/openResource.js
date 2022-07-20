(function () {
  let injectScript = `
    (function() {
      let resourceID = __st.rid;
      let shopURL = Shopify.shop;  

      let productPath = "/admin/products/";
      let collectionPath = "/admin/collections/";
      let blogPath = "/admin/articles/";
      let pagePath = "/admin/pages/";
      let path = "";

      let url = window.location.href;

      switch (true) {
        case url.includes("/products/") || url.includes("%2Fproducts%2F"):
          path = productPath;
          break;
        case url.includes("/collections/") || url.includes("%2Fcollections%2F"):
          path = collectionPath;
          break;
        case url.includes("/pages/") || url.includes("%2Fpages%2F"):
          path = pagePath;
          break;
        case url.includes("/blogs/") || url.includes("%2Fblogs%2F"):
          path = blogPath;
          break;
      }
      typeof resourceID != 'undefined' && window.open("https://" + shopURL + path + resourceID);
    })();
  `;

  let script = document.createElement("script");
  script.textContent = injectScript;
  (document.head || document.documentElement).appendChild(script);
  script.remove();
})();
