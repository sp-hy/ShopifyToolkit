(function () {
  const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  let db;

  // Open IndexedDB connection
  const openDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("LiquifyAssetCache", 1);
      request.onerror = (event) => reject("IndexedDB error: " + event.target.error);
      request.onsuccess = (event) => {
        db = event.target.result;
        resolve(db);
      };
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        db.createObjectStore("assets", { keyPath: "id" });
      };
    });
  };

  startExtract = () => {
    if (!window.EXTRACTOR_INJECTED_FLAG || location.href.includes("online-store-web")) {
      window.EXTRACTOR_INJECTED_FLAG = true;
      return false;
    }

    openDB().then(() => {
      chrome.runtime.onMessage.addListener(function (request, sender) {
        if (request.searchReady) getAssetList();
      });

      /*
      {
    "payload": {
        "group": "Toast",
        "payload": {
            "id": "b9e58016-0695-03af-020f-067b7e12441d",
            "duration": 5000,
            "message": "Asset saved"
        },
        "type": "APP::TOAST::SHOW",
        "version": "3.7.2",
        "clientInterface": {
            "name": "@shopify/app-bridge",
            "version": "3.7.2"
        }
    },
    "source": {
        "apiKey": "650f1a14fa979ec5c74d063e968411d4",
        "host": "admin.shopify.com/store/glellie"
    },
    "type": "dispatch"
}
      */
      // Listen for asset save events
      window.addEventListener('message', function(event) {
        if (event.data.type === 'dispatch' && event.data.payload.group === 'Toast') {
          console.log('Event dispatch detected:', event.data);
          if(event.data.payload.payload.message === 'Asset saved') {
            const url = new URL(window.location.href);
            const assetKey = url.searchParams.get('key');
            if (assetKey) {
              console.log('Updating asset in cache:', assetKey);
              const storeInfo = getStoreInfo();
              updateAssetInCache(storeInfo, assetKey)
                .then(() => console.log("Asset cache update process completed"))
                .catch(error => console.error("Failed to update asset cache:", error));
            } else {
              console.log('No asset key found in URL');
            }
          }
        } 
      });
    }).catch(console.error);

    getAssetList = () => {
      const storeInfo = getStoreInfo();
      checkCache(storeInfo).then(cachedData => {
        if (cachedData) {
          console.log('Using cached data');
          chrome.runtime.sendMessage({ data: JSON.stringify(cachedData) });
          // Send a message to reset the search input
          chrome.runtime.sendMessage({ action: "resetSearchInput" });
        } else {
          console.log('Fetching new data');
          fetchAndCacheAssets(storeInfo);
        }
      });
    };

    getStoreInfo = () => {
      const url = new URL(window.location.href);
      const pathParts = url.pathname.split('/');
      const storeIndex = pathParts.indexOf('store');
      const themeIndex = pathParts.indexOf('themes');
      
      return {
        storeName: pathParts[storeIndex + 1],
        themeId: pathParts[themeIndex + 1]
      };
    };

    checkCache = (storeInfo) => {
      return new Promise(resolve => {
        const transaction = db.transaction(["assets"], "readonly");
        const objectStore = transaction.objectStore("assets");
        const request = objectStore.get(`${storeInfo.storeName}_${storeInfo.themeId}`);

        request.onerror = (event) => {
          console.error("Error fetching from IndexedDB:", event.target.error);
          resolve(null);
        };

        request.onsuccess = (event) => {
          const cachedData = event.target.result;
          if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_EXPIRY) {
            resolve(cachedData.assets);
          } else {
            resolve(null);
          }
        };
      });
    };

    fetchAndCacheAssets = (storeInfo) => {
      fetch(window.location.href.split("?")[0] + "/assets.json")
        .then((response) => response.json())
        .then(function (data) {
          if (data.assets) {
            let allowedExtensions = [".liquid", ".js", ".css", ".scss"];
            let filteredResponse = data.assets.filter((word) =>
              allowedExtensions.some((v) => word.key.includes(v) && !word.key.includes('.map'))
            );
            
            // Send initial total count
            chrome.runtime.sendMessage({
              action: "updateLoadingProgress",
              current: 0,
              total: filteredResponse.length
            });
            
            getAssetsContent(filteredResponse).then((assets) => {
              const cacheData = {
                id: `${storeInfo.storeName}_${storeInfo.themeId}`,
                assets: assets,
                timestamp: Date.now()
              };

              const transaction = db.transaction(["assets"], "readwrite");
              const objectStore = transaction.objectStore("assets");
              const request = objectStore.put(cacheData);

              request.onerror = (event) => console.error("Error caching assets:", event.target.error);
              request.onsuccess = () => {
                console.log('Assets cached successfully');
                chrome.runtime.sendMessage({ data: JSON.stringify(assets) });
                // Reset the search input
                chrome.runtime.sendMessage({ action: "resetSearchInput" });
              };
            });
          }
        });
    };

    getAssetsContent = async (filteredResponse) => {
      const result = [];
      let batchSize;
      const rateLimitDelay = 500; // 0.5 second delay between batches
      const totalAssets = filteredResponse.length;

      // Fetch the throttle setting from storage
      await new Promise(resolve => {
        chrome.storage.sync.get("throttleBehaviour", function(data) {
          batchSize = parseInt(data.throttleBehaviour) || 15; // Default to 15 if not set
          resolve();
        });
      });

      const fetchDataWithRetry = async (asset, retryCount = 0) => {
        try {
          const response = await fetch(
            window.location.href.split("?")[0] + "/assets.json?asset[key]=" + asset.key
          );
          
          if (response.ok) {
            const item = await response.json();
            return item;
          } else if (response.status === 429 && retryCount < 5) {
            const retryAfter = parseInt(response.headers.get('Retry-After') || '5');
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
            return fetchDataWithRetry(asset, retryCount + 1);
          }
        } catch (err) {
          console.error(`Failed to fetch asset: ${asset.key}`, err);
        }
        return null;
      };

      for (let i = 0; i < filteredResponse.length; i += batchSize) {
        const batch = filteredResponse.slice(i, i + batchSize);
        const batchPromises = batch.map(asset => fetchDataWithRetry(asset));
        
        const batchResults = await Promise.all(batchPromises);
        result.push(...batchResults.filter(item => item !== null));

        // Send progress update
        chrome.runtime.sendMessage({
          action: "updateLoadingProgress",
          current: Math.min(i + batchSize, totalAssets),
          total: totalAssets
        });

        if (i + batchSize < filteredResponse.length) {
          await new Promise(resolve => setTimeout(resolve, rateLimitDelay));
        }
      }

      return result;
    };

    // Function to update a single asset in the cache
    updateAssetInCache = async (storeInfo, assetKey) => {
      const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

      try {
        const db = await new Promise((resolve, reject) => {
          const request = indexedDB.open("LiquifyAssetCache", 1);
          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve(request.result);
        });

        // Get the current cached data
        const getCachedData = () => new Promise((resolve, reject) => {
          const transaction = db.transaction(["assets"], "readonly");
          const objectStore = transaction.objectStore("assets");
          const request = objectStore.get(`${storeInfo.storeName}_${storeInfo.themeId}`);
          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve(request.result);
        });

        const cachedData = await getCachedData();

        if (cachedData) {
          const updatedAsset = await fetchDataWithRetry({ key: assetKey });
          if (updatedAsset) {
            const assetIndex = cachedData.assets.findIndex(asset => asset.asset.key === assetKey);
            if (assetIndex !== -1) {
              cachedData.assets[assetIndex] = updatedAsset;
            } else {
              cachedData.assets.push(updatedAsset);
            }
            cachedData.timestamp = Date.now();

            // Add a small delay before updating the cache
            await sleep(100);

            // Update the cache with a new transaction
            await new Promise((resolve, reject) => {
              const transaction = db.transaction(["assets"], "readwrite");
              const objectStore = transaction.objectStore("assets");
              const updateRequest = objectStore.put(cachedData);
              updateRequest.onerror = () => reject(updateRequest.error);
              updateRequest.onsuccess = () => resolve();
            });

            console.log("Asset updated in cache:", assetKey);
            showUpdateNotification(assetKey);
          }
        }

        console.log("Asset update process completed successfully");
      } catch (error) {
        console.error("Error updating asset in cache:", error);
      }
    };

    // Function to show a notification when an asset is updated
    showUpdateNotification = (assetKey) => {
      const notification = document.createElement('div');
      notification.textContent = `Cache updated for ${assetKey}`;
      notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #4CAF50;
        color: white;
        padding: 15px;
        border-radius: 5px;
        z-index: 1000;
      `;
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.remove();
      }, 3000);
    };

    // Helper function to fetch a single asset
    fetchDataWithRetry = async (asset, retryCount = 0) => {
      try {
        const response = await fetch(
          window.location.href.split("?")[0] + "/assets.json?asset[key]=" + asset.key
        );
        
        if (response.ok) {
          const item = await response.json();
          return item;
        } else if (response.status === 429 && retryCount < 5) {
          const retryAfter = parseInt(response.headers.get('Retry-After') || '5');
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          return fetchDataWithRetry(asset, retryCount + 1);
        }
      } catch (err) {
        console.error(`Failed to fetch asset: ${asset.key}`, err);
      }
      return null;
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
      ) {
        console.log('URL changed, starting extract');
        startExtract();
      }
    }
  });
  const config = { subtree: true, childList: true };
  observer.observe(document, config);
})();