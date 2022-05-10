let searchInterval = setInterval(() => {
  if (!$(".asset-listing-list").length) return;
  clearInterval(searchInterval);

  // Get asset list
  getAssets();

  // Set loading message
  $("#asset-search")
    .attr("placeholder", "Enhanced search loading...")
    .addClass("search-loading");
  $(".asset-search").addClass("search-loading");
  $("#asset-search").prop('disabled', true);
}, 500);

getAssets = () => {
  // Get Asset list from server
  $.ajax({
    url: window.location.href.split("?")[0] + "/assets.json",
  }).done(function (data) {
    // Filter out assets that aren't in the allowed list
    let allowedExtensions = [".liquid", ".js", ".css", ".scss"];
    let filteredResponse = data.assets.filter((word) =>
      allowedExtensions.some((v) => word.key.includes(v))
    );

    getAssetData(filteredResponse);
  });
};

getAssetData = (filteredResponse) => {
  // Ajax query for each asset URL
  var requests = filteredResponse.map(function (asset) {
    return $.ajax({
      method: "GET",
      url:
        window.location.href.split("?")[0] +
        "/assets.json?asset[key]=" +
        asset.key,
    });
  });

  // Fire once all ajax calls to asset files are complete
  $.when(...requests).then((...responses) => {
    let newResponses = responses.map((item) => {
      return (item = item[0]);
    });

    createSearchField(newResponses);
  });
};

createSearchField = (assetArray) => {
  // Override default search element
  $("#asset-search").replaceWith($("#asset-search").clone());
  $("#asset-search").attr("placeholder", "Search filename / contents...");
  $(".asset-search").removeClass("search-loading");
  $("#asset-search").prop('disabled', false);
  $("#asset-search").on("input", function (e) {
    let searchTerm = e.target.value;

    // Find matches in asset files
    let filtered = assetArray.filter((obj) => 
      Object.values(obj).some((asset) => {
        if ('value' in asset) {
          return asset.value.includes(searchTerm)
        } else {
          console.log('asset failed', asset);
          return false
        }
      })
    );

    // Create list of matched files
    let filteredFiles = filtered.map((item) => (item = item.asset.key));

    filterFileList(filteredFiles, searchTerm);
  });
};

filterFileList = (fileList, searchTerm) => {
  // Get list of assets from DOM
  let assetList = document.querySelectorAll("[data-asset-key]");

  for (var item of assetList) {
    let assetKey = item.getAttribute("data-asset-key");

    // Show file if filename or contents match search term, else hide
    if (
      fileList.includes(assetKey) ||
      assetKey.includes(searchTerm) ||
      searchTerm == ""
    ) {
      item.style.display = "block";
      // Open asset folder if collapsed
      try {
        item.parentNode.parentNode.parentNode.classList.remove("is-collapsed");
      } catch (error) {}
    } else {
      item.style.display = "none";
    }
  }
};
