let searchInterval = setInterval(() => {
  if (!$(".asset-listing-list").length) return;
  clearInterval(searchInterval);

  // Collect asset list
  let $assetList = $("[data-asset-key]");

  // Filter out assets that don't contain code

  // Batch ajax request theme files

  // Some kind progress bar/percentage shown

  // Modify searchbox to switch between asset and code search

  // Take input from search field and show/hide files that do/don't contain the query

  // Output
  console.log($assetList)
}, 500);