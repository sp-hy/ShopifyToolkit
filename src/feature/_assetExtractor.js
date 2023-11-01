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
      chrome.storage.sync.get("throttleBehaviour", function (data) {
        if (request.searchReady) getAssetList(data.throttleBehaviour);
      });
    });

    getAssetList = (throttle) => {
      fetch(window.location.href.split("?")[0] + "/assets.json")
        .then((response) => response.json())
        .then(function (data) {
          if (data.assets) {
            // Filter out assets that aren't in the allowed list
            let allowedExtensions = [".liquid", ".js", ".css", ".scss"];
            let filteredResponse = data.assets.filter((word) =>
              allowedExtensions.some((v) => word.key.includes(v))
            );

            filteredResponse = data.assets.filter((word) =>
              allowedExtensions.some((v) => (word.key.includes(v) && !word.key.includes('.map')))
            );
            
            getAssetsContent(filteredResponse, throttle).then((data) => {
              let assetJSON = JSON.stringify(data);

              chrome.runtime.sendMessage({ data: assetJSON });
            });
          }
        });
    };

    getAssetsContent = async (filteredResponse, throttle) => {
      const result = [];
      const requestLimit = throttle || 50; // Maximum requests per second
      const requestQueue = [];
      const requestInterval = 1000 / requestLimit; // Calculate the interval between requests
    
      const fetchDataWithRateLimit = async (asset) => {
        try {
          const response = await fetch(
            window.location.href.split("?")[0] + "/assets.json?asset[key]=" + asset.key
          );
    
          if (response.ok) {
            const item = await response.json();
            result.push(item);
          }
        } catch (err) {
          // Handle failed/blocked requests
        }
      };
    
      for (const asset of filteredResponse) {
        const promise = fetchDataWithRateLimit(asset);
        requestQueue.push(promise);
    
        if (requestQueue.length >= requestLimit) {
          // Wait for the current batch of requests to complete
          await Promise.all(requestQueue);
          requestQueue.length = 0;
    
          // Introduce a delay before starting the next batch
          await new Promise((resolve) => setTimeout(resolve, requestInterval));
        }
      }
    
      // Wait for any remaining requests to complete
      await Promise.all(requestQueue);
    
      return result;
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
