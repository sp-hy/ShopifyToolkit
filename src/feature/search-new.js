function startSearch(){
  let searchIntervalNew = setInterval(() => {
    let frameContent = document.querySelector(`[title="Online Store"]`).contentWindow.document.body.querySelector('[placeholder="Search files..."]')
    if (!frameContent) return;

    clearInterval(searchIntervalNew);

    // Set loading message
    let searchInput = frameContent;
      searchInput.setAttribute("placeholder", "Enhanced search loading...");
      searchInput.closest('[data-diffy-attribute="search"]').classList.add("search-loading");

    let path = chrome.extension.getURL('src/themes/vscode-new.css');
    let iframeTo = document.querySelector(`[title="Online Store"]`)
    var cssLink = document.createElement("link") 
    cssLink.href = path
    cssLink .rel = "stylesheet"; 
    cssLink .type = "text/css"; 
    iframeTo.contentWindow.document.body.appendChild(cssLink);
    iframeTo.contentWindow.document.body.querySelector('#app').firstElementChild.setAttribute('p-color-scheme', 'dark')


    getAssets = (frameContent) => {
      // Get Asset list from server
      $.ajax({
        url: window.location.href.split("?")[0] + "/assets.json",
      }).done(function (data) {
        // Filter out assets that aren't in the allowed list
        let allowedExtensions = [".liquid", ".js", ".css", ".scss"];
        let filteredResponse = data.assets.filter((word) =>
          allowedExtensions.some((v) => word.key.includes(v))
        );

        getAssetData(filteredResponse, frameContent);
      });
    };

    getAssetData = (filteredResponse, frameContent) => {
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

        createSearchField(newResponses, frameContent);
      });
    };

    createSearchField = (assetArray, frameContent) => {
      frameContent.closest('[data-diffy-attribute="search"]').classList.remove("search-loading");
      
      // Override default search element
      let searchParent = frameContent.parentNode;
      const newItem = document.createElement('div');
      newItem.innerHTML = '<input id="liquify-search" placeholder="Enhanced search loading..." autocomplete="off" class="Polaris-TextField__Input_30ock Polaris-TextField__Input--hasClearButton_15k6h search-loading" type="search" aria-labelledby="PolarisTextField2Label PolarisTextField2-Prefix" aria-invalid="false" value="">';
      frameContent.parentNode.replaceChild(newItem.firstElementChild, frameContent);

      let searchInput = searchParent.querySelector('#liquify-search')
      searchInput.setAttribute("placeholder", "Search filename / contents...");
      searchInput.classList.remove("search-loading");
      
      searchInput.addEventListener('input', e => {
        // Open all folders so all files render
        let iFrameDocument = document.querySelector(`[title="Online Store"]`).contentWindow.document.body;
        let collapsibles = iFrameDocument.querySelectorAll('[id^=Collapsible-folder-][aria-hidden="true"]')
  
        collapsibles.forEach(collapsible => {
          collapsible.parentElement.querySelector('button').click()
        });

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
      })
    };

    filterFileList = (fileList, searchTerm) => {
      let iFrameDocument = document.querySelector(`[title="Online Store"]`).contentWindow.document.body;
      let assetList = iFrameDocument.querySelectorAll('[aria-label="File picker"] li[data-diffy-attribute^="fileName-"]');

      for (var item of assetList) {
        let assetKey = item.getAttribute("data-diffy-attribute");
        assetKey = assetKey.split('-')[1];

        // Show file if filename or contents match search term, else hide
        if (assetKey) {
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
      }
    };

    // Get asset list
    getAssets(frameContent);
  }, 500);
}

startSearch();

let previousUrl = '';
const observer = new MutationObserver(function(mutations) {
  if (location.href !== previousUrl) {
      previousUrl = location.href;
      if (location.href.includes('/themes/')) {
        startSearch();
        try {
          let iFrame = document.querySelector(`[title="Online Store"]`)      
          iFrame.contentWindow.document.body.querySelector('#app').firstElementChild.setAttribute('p-color-scheme', 'dark')
        } catch (error) {}
      } else {
        try {
          let iFrame = document.querySelector(`[title="Online Store"]`)      
          iFrame.contentWindow.document.body.querySelector('#app').firstElementChild.setAttribute('p-color-scheme', 'light')  
        } catch (error) {}
      }
    }
});
const config = {subtree: true, childList: true};
observer.observe(document, config);