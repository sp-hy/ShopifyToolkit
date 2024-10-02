chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (sender.tab) {
    chrome.tabs.sendMessage(sender.tab.id, request);
  }
  if (request.action === "debugStorage") {
    debugStorage();
  }
  if (request.action === "updateLoadingProgress") {
    updateLoadingUI(request.current, request.total);
  }
  if (request.action === "resetSearchInput") {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "resetSearchInput" });
      }
    });
  }
  if (request.action === "clearCurrentStore") {
    clearCurrentStoreStorage(request.key, sendResponse);
    return true;  // Indicates we want to send a response asynchronously
  } else if (request.action === "clearAllStorage") {
    clearAllStorage(sendResponse);
    return true;
  } else if (request.action === "viewStorage") {
    viewStorage(sendResponse);
    return true;
  }
});

function debugStorage() {
  const request = indexedDB.open("LiquifyAssetCache", 1);
  request.onerror = (event) => console.error("IndexedDB error:", event.target.error);
  request.onsuccess = (event) => {
    const db = event.target.result;
    const transaction = db.transaction(["assets"], "readonly");
    const objectStore = transaction.objectStore("assets");
    const request = objectStore.getAll();

    request.onerror = (event) => console.error("Error fetching from IndexedDB:", event.target.error);
    request.onsuccess = (event) => {
      console.log('All IndexedDB storage items:', event.target.result);
    };
  };
}

function updateLoadingUI(current, total) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "updateLoadingUI",
        message: `Loading Assets... ${current} out of ${total} assets`
      });
    }
  });
}

function clearCurrentStoreStorage(key, sendResponse) {
  const request = indexedDB.open("LiquifyAssetCache", 1);
  request.onerror = (event) => sendResponse({success: false, error: event.target.error.toString()});
  request.onsuccess = (event) => {
    const db = event.target.result;
    if (!db.objectStoreNames.contains("assets")) {
      console.log('No assets object store found');
      sendResponse({success: true, message: "No data to clear for current store"});
      return;
    }
    const transaction = db.transaction(["assets"], "readwrite");
    const objectStore = transaction.objectStore("assets");
    const deleteRequest = objectStore.delete(key);

    deleteRequest.onerror = (event) => sendResponse({success: false, error: event.target.error.toString()});
    deleteRequest.onsuccess = () => {
      console.log(`Storage cleared for key: ${key}`);
      sendResponse({success: true, message: "Storage cleared for current store"});
    };

    transaction.oncomplete = () => {
      db.close();
      console.log("Transaction completed and database closed");
    };
  };
}

function clearAllStorage(sendResponse) {
  const request = indexedDB.open("LiquifyAssetCache", 1);
  request.onerror = (event) => sendResponse({success: false, error: event.target.error.toString()});
  request.onsuccess = (event) => {
    const db = event.target.result;
    if (!db.objectStoreNames.contains("assets")) {
      console.log('No assets object store found');
      sendResponse({success: true, message: "No data to clear"});
      return;
    }
    const transaction = db.transaction(["assets"], "readwrite");
    const objectStore = transaction.objectStore("assets");
    const clearRequest = objectStore.clear();

    clearRequest.onerror = (event) => sendResponse({success: false, error: event.target.error.toString()});
    clearRequest.onsuccess = () => {
      console.log("All storage cleared successfully");
      sendResponse({success: true, message: "All storage cleared"});
    };

    transaction.oncomplete = () => {
      db.close();
      console.log("Transaction completed and database closed");
    };
  };
}

function viewStorage(sendResponse) {
  const request = indexedDB.open("LiquifyAssetCache", 1);
  request.onerror = (event) => sendResponse({success: false, error: event.target.error.toString()});
  request.onsuccess = (event) => {
    const db = event.target.result;
    const transaction = db.transaction(["assets"], "readonly");
    const objectStore = transaction.objectStore("assets");
    const getAllRequest = objectStore.getAll();

    getAllRequest.onerror = (event) => sendResponse({success: false, error: event.target.error.toString()});
    getAllRequest.onsuccess = (event) => sendResponse({success: true, data: event.target.result});
  };
}

// You can call this function when needed, for example:
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "debugStorage") {
    debugStorage();
  }
});
