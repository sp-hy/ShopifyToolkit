chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "updateLoadingUI") {
    updateSearchInput(request.message);
  } else if (request.action === "resetSearchInput") {
    resetSearchInput();
  }
});

function updateSearchInput(message) {
  // Try to find the search input
  let searchInput = document.querySelector('.Polaris-TextField__Input') || 
                    document.querySelector('input[placeholder="Search"]') ||
                    document.querySelector('input[type="search"]');

  if (searchInput) {
    // Update the placeholder with the progress message
    searchInput.placeholder = message;

    // Ensure the input is disabled while loading
    searchInput.disabled = true;

    // Add a loading class to the parent element for styling
    let searchContainer = searchInput.closest('[data-diffy-attribute="search"]');
    if (searchContainer) {
      searchContainer.classList.add('search-loading');
    }
  } else {
    // If we can't find the search input immediately, try again after a short delay
    setTimeout(() => updateSearchInput(message), 500);
  }
}

function resetSearchInput() {
  let searchInput = document.querySelector('.Polaris-TextField__Input') || 
                    document.querySelector('input[placeholder="Search"]') ||
                    document.querySelector('input[type="search"]');

  if (searchInput) {
    searchInput.placeholder = 'Search filename / contents...';
    searchInput.disabled = false;
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));

    // Remove the loading class from the parent element
    let searchContainer = searchInput.closest('[data-diffy-attribute="search"]');
    if (searchContainer) {
      searchContainer.classList.remove('search-loading');
    }
  }
}