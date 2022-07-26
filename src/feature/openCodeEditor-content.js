(function() {
  let shopURL = Shopify.shop;  
  let themeID = Shopify.theme.id;  

  window.open("https://" + shopURL + "/admin/themes/" + themeID)
})();