(function () {
  startExtract = () => {
    if (
      !window.EXTRACTOR_INJECTED_FLAG ||
      location.href.includes("online-store-web")
    ) {
      window.EXTRACTOR_INJECTED_FLAG = true;
      return false;
    }

    chrome.runtime.onMessage.addListener(function (request, sender) {
      if (request.searchReady) getAssetList();
    });

    getAssetList = () => {
      fetch(window.location.href.split("?")[0] + "/assets.json")
        .then((response) => response.json())
        .then(function (data) {
          if (data.assets) {
            // Filter out assets that aren't in the allowed list
            let allowedExtensions = [".liquid", ".js", ".css", ".scss"];
            let filteredResponse = data.assets.filter((word) =>
              allowedExtensions.some((v) => word.key.includes(v))
            );
            getAssetsContent(filteredResponse).then((data) => {
              let assetJSON = JSON.stringify(data);

              chrome.runtime.sendMessage({ data: assetJSON });
            });
          }
        });
    };

    getAssetsContent = async (filteredResponse) => {
      const result = [];
      // Batch request all valid asset files asynchronously, then add them to the results array
      const datas = filteredResponse.map((asset) => {
        try {
          return fetch(
            window.location.href.split("?")[0] +
              "/assets.json?asset[key]=" +
              asset.key
          )
            .then((response) => response.json())
            .then((item) => {
              result.push(item);
            })
            .catch((err) => {
              return null;
            });
        } catch (error) {
          // Handle failed/blocked requests
          return null;
        }
      });
      return Promise.all(datas).then(() => result);
    };
  };

  // On load begin search
  startExtract();

  // Detect page change
  let previousUrl = "";
  const observer = new MutationObserver(() => {
    if (location.href !== previousUrl) {
      previousUrl = location.href;
      if (
        location.href.includes("/themes/") &&
        !location.href.includes("editor")
      )
        startExtract();
    }
  });
  const config = { subtree: true, childList: true };
  observer.observe(document, config);
})();
