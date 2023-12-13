(() => {
  window.tabsLoaded = false;

  setTabs = (theme) => {
    // Create setInterval to act as a listener until theme editor elements exist
    let tabIntervalListener = setInterval(() => {
      // Locate iframe and sidebar
      let hasThemeIframe = document.querySelector(`main iframe`);

      let frameDocument =
        (hasThemeIframe && hasThemeIframe.contentDocument) || document;

      let hasThemeContent =
        (hasThemeIframe &&
          hasThemeIframe.contentDocument &&
          hasThemeIframe.contentDocument.querySelector(
            '[data-diffy-attribute="sidebar"]'
          )) ||
        document.querySelector('[data-diffy-attribute="sidebar"]');
      if (!hasThemeContent) return;

      // Element found, clear interval
      clearInterval(tabIntervalListener);

      window.tabsLoaded = true;

      // Drag and drop tabs
      dragDropTabs(frameDocument);

      // If stacked tabs is enabled
      if (theme == "tabs") {
        let path = chrome.runtime.getURL(`src/themes/${theme}.css`);
        var cssLink = document.createElement("link");
        cssLink.href = path;
        cssLink.rel = "stylesheet";
        cssLink.type = "text/css";
        frameDocument.body.appendChild(cssLink);
      }
    }, 500);
  };

  getTabs = () => {
    chrome.storage.sync.get("tabBehaviour", function (data) {
      data.tabBehaviour == "Stack" ? setTabs("tabs") : setTabs();
    });
  };

  dragDropTabs = (frame) => {
    setInterval(() => {
      // If no theme iframe content
      if (!frame) return;

      // Get all editor tabs and set draggable attribute
      let tabList = frame.querySelectorAll(
        '[data-diffy-attribute="tablist"] [role="presentation"]'
      );
      tabList.forEach((tab) => {
        tab.setAttribute("draggable", true);
      });

      // Find all tabs that don't have the hasEvent class
      frame
        .querySelectorAll('[draggable="true"]:not(.hasEvent)')
        .forEach((dragg) => {
          dragg.addEventListener("dragstart", (e) => {
            // On drag
            e.target.style.opacity = 0.2;
          });
          dragg.addEventListener("dragover", (e) => {
            // Disable float-back animation
            e.preventDefault();
          });
          dragg.addEventListener("dragend", (e) => {
            // On drop
            e.preventDefault();
            let targetX = e.x;
            let targetY = e.y;
            let moveTo = frame
              .elementFromPoint(targetX, targetY)
              .closest('[role="presentation"]');

            // If tab is being dragged to a tab with a higher index, place after, otherwise place before
            if (moveTo) {
              let indexSelected = Array.from(
                moveTo.parentNode.children
              ).indexOf(moveTo);
              let indexTarget = Array.from(dragg.parentNode.children).indexOf(
                dragg
              );

              if (indexTarget < indexSelected) {
                moveTo.parentNode.insertBefore(dragg, moveTo.nextSibling);
              } else {
                moveTo.parentNode.insertBefore(dragg, moveTo);
              }
            }
            e.target.style.opacity = 1;
          });
          // Add hasEvent class to prevent duplicate listeners
          dragg.classList.add("hasEvent");
        });
    }, 500);
  };

  // Detect page change
  let previousUrl = "";
  const observer2 = new MutationObserver(() => {
    if (location.href !== previousUrl) {
      previousUrl = location.href;
      if (
        location.href.includes("/themes/") &&
        !location.href.includes("editor") && 
        !window.tabsLoaded
      ) {
        console.log('tabs', window.searchLoaded);
        getTabs();
      }
    }
  });

  const config = { subtree: true, childList: true };
  observer2.observe(document, config);
})();
