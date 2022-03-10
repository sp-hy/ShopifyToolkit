loadScript = (path) => {
  let s = document.createElement('script');
  s.src = chrome.runtime.getURL(path);
  (document.head || document.documentElement).appendChild(s);
}

// loadScript('thirdParty/ace.js');

// loadScript('src/feature/notificationEditorInject.js')
