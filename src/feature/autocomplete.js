// Store input
let keyBuffer = "";
// Current active word
let focusedWord = -1;
let combinedWords = [];
let combinedValues = [];
let validInputKeys = `qwertyuiopasdfghjklzxcvbnm[]{};|':",./<>?~1234567890-=_+/*-`;

let autoCompleteInverval = setInterval(() => {
  if (!$("textarea").length) return;

  clearInterval(autoCompleteInverval);

  // Build autocomplete library from arrays
  createAutocompleteLibrary();

  // Start event listener logic
  inputHandler();

  affixSuggestionBoxToCursor();
}, 500);

mouseHandler = () => {
  $("[data-word]").each(function (index) {
    $(this).on("click", (e) => {
      let wordIndex = combinedWords.indexOf(e.currentTarget.dataset.word);
      let wordContents = combinedValues[wordIndex];
      sendInputToCodeMirror(wordContents);
    });
  });
};

inputHandler = () => {
  window.addEventListener("click", () => {
    keyBuffer = "";
    destroySuggestions();
  });

  document.addEventListener("keydown", function (event) {
    let key = event.key.toLowerCase();
    switch (true) {
      // Toggle active selection
      case key == "`":
        event.preventDefault();
        createSuggestion(keyBuffer);
        toggleActiveSelection();
        break;
      // Select active
      case key == "1":
        if (focusedWord > -1 && keyBuffer.length > 0) {
          event.preventDefault();
          activateSelected();
          break;
        }
      // Regular input
      case key.length == 1:
        if (validInputKeys.indexOf(key) !== -1) keyBuffer += key;
        keyBuffer.length > 0 && createSuggestion(keyBuffer);
        break;
      // Backspace hit
      case key == "Backspace":
        keyBuffer = keyBuffer.slice(0, -1);
        createSuggestion(keyBuffer);
        break;
      default:
        destroySuggestions();
    }
  });
};

affixSuggestionBoxToCursor = () => {
  // Fix autocomplete div to codemirror cursor position
  setInterval(() => {
    try {
      let cursorTop = $(".CodeMirror-cursor")[0].getBoundingClientRect().y;
      let cursorLeft = $(".CodeMirror-cursor")[0].getBoundingClientRect().x;

      $("#autocomplete").css({
        top: cursorTop + 18 + "px",
        left: cursorLeft + "px",
      });
    } catch (error) {}
  }, 100);
};

toggleActiveSelection = () => {
  // Get current autocomplete list
  let $words = $("#autocomplete li");

  if (focusedWord > $words.length - 2) {
    focusedWord = 0;
  } else {
    focusedWord++;
  }
  // Add active class to element
  $words.eq(focusedWord).addClass("active");
};

activateSelected = () => {
  // Pull word name from data attribute
  let $activeWord = $("#autocomplete li.active").eq(0).attr("data-word");
  // Get infex of word from combined word array
  let wordIndex = combinedWords.indexOf($activeWord);
  // Get word value from combined value array
  let wordContents = combinedValues[wordIndex];
  // Send word input to editor
  sendInputToCodeMirror(wordContents);
};

createAutocompleteLibrary = () => {
  combinedWords = Object.keys({
    ...liquid,
    ...javascript,
    ...jQuery,
    ...html,
    ...schema,
    ...css,
  });
  combinedValues = Object.values({
    ...liquid,
    ...javascript,
    ...jQuery,
    ...html,
    ...schema,
    ...css,
  });
};

createSuggestion = (input) => {
  // Take the input and look for matches
  let filteredWords = filterWords(input, combinedWords);

  createSuggestionBox(filteredWords, input);
};

filterWords = (input, combinedWords) => {
  // Filter out non-matches
  let filteredWords = combinedWords.filter((word) => {
    return word.substr(0, input.length).toLowerCase() == input.toLowerCase();
  });

  return filteredWords;
};

createSuggestionBox = (combinedWords, input) => {
  let $autoComplete = '<ul id="autocomplete"></ul>';

  if ($("#autocomplete").length == 0) $("body").prepend($autoComplete);
  $("#autocomplete").empty();

  if (keyBuffer.length && combinedWords.length) $("#autocomplete").show();
  else $("#autocomplete").hide();

  combinedWords.map((word) => {
    let snippetType = word.split("--")[1];
    let shownWord = word.split("--")[0];

    // Create list item element and add to autocomplete list
    let $wordElement =
      "<li data-word=" +
      word +
      "><span data-type=" +
      snippetType +
      "></span><span class='input-highlight'>" +
      input +
      "</span><span>" +
      shownWord.slice(input.length) +
      "</span></li>";

    $("#autocomplete").append($wordElement);
  });
  mouseHandler();
};

destroySuggestions = () => {
  keyBuffer = "";
  focusedWord = -1;
  $("#autocomplete").hide();
};

sendInputToCodeMirror = (snippet) => {
  // As this script doesn't have access to the page context,
  // create a script that will be injected and execured on the page

  // Format string to json to avoid mutliline string issues
  let formatted = JSON.stringify(snippet);

  // Send script to page, call native CodeMirror function to replace
  // the last typed characters with the snippet
  let injectScript = `
  (function() {
    let editor = document.querySelector(".CodeMirror").CodeMirror;
    let doc = editor.getDoc();
    let cursor = doc.getCursor(); // gets the line number in the cursor position
    let line = doc.getLine(cursor.line); // get the line contents
    let from = { // create a new object to avoid mutation of the original selection
      line: cursor.line,
      ch: cursor.ch - ${keyBuffer.length}
    }
    let to = { // create a new object to avoid mutation of the original selection
      line: cursor.line,
      ch: cursor.ch
    }
    doc.replaceRange(${formatted}, from, to); 
  })();
  `;

  let script = document.createElement("script");
  script.textContent = injectScript;
  (document.head || document.documentElement).appendChild(script);
  script.remove();

  destroySuggestions();
};

let javascript = {
  "alert--js": `alert('alert')`,
  "if--js": `if (condition) {
  
}`,
  "if-else--js": `if (condition) {
  
} else {
    
}`,
  "console.log()--js": `console.log()`,
  "for--js": `for (let index = 0; index < array.length; index++) {
    const element = array[index];
}`,
  "function--js": `function name(params) {
  
}`,
  "function-es6--js": `functionName = () => {

}`,
  "array--js": "let arr = [];",
  "object--js": "let obj = {};",
  "try-catch--js": `try {
  
} catch (error) {
  
}`,
  "for--js": `for (let index = 0; index < array.length; index++) {
  const element = array[index];
}`,
  "while--js": `while (condition) {
  
}`,
  "setTimeout--js": `setTimeout(() => {
  
}, 100);`,
  "setInterval--js": `setTimeout(() => {
  
}, 100);`,
  "document--js": `document`,
  "forEach--js": `array.forEach(element => {
  
});`,
  "switch--js": `switch (key) {
  case value:
    
    break;

  default:
    break;
}`,
  "includes--js": `includes('string')`,
  "addEventListener--js": `document.addEventListener('type', e => {})`,
  "push--js": `push()`,
  "slice--js": `slice(0,1)`,
  "map--js": `map(item => return item * 2);`,
  "filter--js": "filter(item => item.length > 1)",
  "appendChild()--js": `appendChild()`,
  "childNodes--js": `childNodes`,
  "classList--js": `classList`,
  "className--js": `className`,
  "click()==--js": `click()`,
  "cloneNode()--js": `cloneNode()`,
  "closest()--js": `closest()`,
  "contains()--js": `contains()`,
  "firstChild--js": `firstChild`,
  "children--js": `children`,
  "firstElementChild--js": `firstElementChild`,
  "focus()--js": `focus()`,
  "getAttribute()--js": `getAttribute()`,
  "getAttributeNode()--js": `getAttributeNode()`,
  "hasAttribute()--js": `hasAttribute()`,
  "hasChildNodes()()--js": `hasChildNodes()()`,
  "innerHTML--js": `innerHTML`,
  "innerText--js": `innerText`,
  "insertAdjacentElement()--js": `insertAdjacentElement()`,
  "insertAdjacentHTML()--js": `insertAdjacentHTML()`,
  "insertAdjacentText()--js": `insertAdjacentText()`,
  "insertBefore()--js": `insertBefore()`,
  "isEqualNode()--js": `isEqualNode()`,
  "isSameNode()--js": `isSameNode()`,
  "lastChild--js": `lastChild`,
  "lastElementChild--js": `lastElementChild`,
  "matches()--js": `matches()`,
  "nextSibling--js": `nextSibling`,
  "nextElementSibling--js": `nextElementSibling`,
  "offsetHeight--js": `offsetHeight`,
  "offsetWidth--js": `offsetWidth`,
  "offsetLeft--js": `offsetLeft`,
  "offsetTop--js": `offsetTop`,
  "outerHTML--js": `children`,
  "outerText--js": `outerText`,
  "parentNode--js": `parentNode`,
  "parentElement--js": `parentElement`,
  "previousSibling	--js": `previousSibling	`,
  "previousElementSibling--js": `previousElementSibling`,
  "remove()--js": `remove()`,
  "removeAttribute()--js": `removeAttribute()`,
  "removeAttributeNode()--js": `removeAttributeNode()`,
  "removeChild()--js": `removeChild()`,
  "removeEventListener()--js": `removeEventListener()`,
  "replaceChild()--js": `replaceChild()`,
  "scrollHeight--js": `scrollHeight`,
  "scrollLeft--js": `scrollLeft`,
  "scrollTop--js": `scrollTop`,
  "scrollWidth--js": `scrollWidth`,
  "setAttribute()--js": `setAttribute()`,
  "setAttributeNode()--js": `setAttributeNode()`,
  "style--js": `style`,
  "textContent--js": `textContent`,
  "toString()--js": `toString()`,
};

let jQuery = {
  "jQuery--jq": `test`,
};

let liquid = {
  "assign--liquid": "{% assign variable = value %}",
  "break--liquid": "{% break variable = value %}",
  "continue--liquid": "{% continue variable = value %}",

  "if--liquid": `{% if true %}
  
{% endif %}`,
  "if-else--liquid": `{% if true %}
  
{% else %}
  
{% endif %}`,
  "raw--liquid": `{% raw %}raw{% raw %}`,
  "unless--liquid": `{% unless variable == 'this' %}
  
{% endunless %}`,
  "case--liquid": `{% case variable %}
{% when 'one' %}
  Variable is one
{% when 'two' %}
  Variable is one
{% else %}
  Variable is neither
{% endcase %}`,
  "for--liquid": `{% for product in collection.products %}
  {{ product.title }}
{% endfor %}`,
  "capture--liquid": `{% capture capture %}
  {% product.url %}
{% endcapture %}

{% capture %}`,
  "include--liquid": `{% include 'snippet' %}`,
  "render--liquid": `{% render 'snippet' %}`,
  "comment--liquid": `{% comment %}Comment{% endcomment %}`,
  "| asset_url--liquid": `| asset_url`,
  "| asset_img_url--liquid": `| asset_img_url: '300x'`,
  "| file_img_url--liquid": `| file_img_url: '300x'`,
  "| camelize--liquid": `| camelize`,
  "| capitalize--liquid": `| capitalize`,
  "| default_pagination--liquid": `| default_pagination`,
  "| global_asset_url--liquid": `| global_asset_url`,
  "| handleize--liquid": `| handleize`,
  "| img_tag--liquid": `| img_tag`,
  "| link_to--liquid": `| link_to`,
  "| money_with_currency--liquid": `| money_with_currency`,
  "| money_without_currency--liquid": `| money_without_currency`,
  "| money--liquid": `| money`,
  "| product_img_url--liquid": `| product_img_url`,
  "| img_url--liquid": `| img_url: '100x100'`,
  "| json--liquid": `| json`,
  "| sort_by--liquid": `| sort_by`,
  "| weight_with_unit--liquid": `| weight_with_unit`,
  "| downcase--liquid": `| downcase`,
  "| upcase--liquid": `| upcase`,
  "| strip_html--liquid": `| strip_html`,
  "| strip_newlines--liquid": `| strip_newlines`,
  "| split--liquid": `| split: ' '`,
  "| replace--liquid": `| replace: 'this', 'that'`,
  "| remove--liquid": `| remove: 'string to remove'`,
  "blogs['handle'].variable--liquid": `blogs["handle"].variable`,
  "blog.id--liquid": `blog.id`,
  "blog.handle--liquid": `blog.handle`,
  "blog.title--liquid": `blog.title`,
  "blog.articles--liquid": `blog.articles`,
  "blog.articles_count--liquid": `blog.articles_count`,
  "blog.url--liquid": `blog.url`,
  "blog.comments_enabled?--liquid": `blog.comments_enabled?`,
  "blog.moderated?--liquid": `blog.moderated?`,
  "blog.next_article--liquid": `blog.next_article`,
  "blog.previous_article--liquid": `blog.previous_article`,
  "blog.all_tags--liquid": `blog.all_tags`,
  "article.author--liquid": `article.author`,
  "article.comments--liquid": `article.comments`,
  "article.comments_count--liquid": `article.comments_count`,
  "article.comments_enabled?--liquid": `article.comments_enabled?`,
  "article.comment_post_url--liquid": `article.comment_post_url`,
  "article.content--liquid": `article.content`,
  "article.created_at--liquid": `article.created_at`,
  "article.excerpt--liquid": `article.excerpt`,
  "article.excerpt_or_content--liquid": `article.excerpt_or_content`,
  "article.handle--liquid": `article.handle`,
  "article.id--liquid": `article.id`,
  "article.image--liquid": `article.image`,
  "article.image.alt--liquid": `article.image.alt`,
  "article.image.src--liquid": `article.image.src`,
  "article.moderated?--liquid": `article.moderated?`,
  "article.published_at--liquid": `article.published_at`,
  "article.tags--liquid": `article.tags`,
  "article.updated_at--liquid": `article.updated_at`,
  "article.url--liquid": `article.url`,
  "article.user--liquid": `article.user`,
  "article.user.account_owner--liquid": `article.user.account_owner`,
  "article.user.bio--liquid": `article.user.bio`,
  "article.user.email--liquid": `article.user.email`,
  "article.user.first_name--liquid": `article.user.first_name`,
  "article.user.homepage--liquid": `article.user.homepage`,
  "article.user.image--liquid": `article.user.image`,
  "article.user.last_name--liquid": `article.user.last_name`,
  "address.name--liquid": `address.name`,
  "address.first_name--liquid": `address.first_name`,
  "address.last_name--liquid": `address.last_name`,
  "address.address1--liquid": `address.address1`,
  "address.address2--liquid": `address.address2`,
  "address.street--liquid": `address.street`,
  "address.company--liquid": `address.company`,
  "address.city--liquid": `address.city`,
  "address.province--liquid": `address.province`,
  "address.province_code--liquid": `address.province_code`,
  "address.zip--liquid": `address.zip`,
  "address.country--liquid": `address.country`,
  "address.country_code--liquid": `address.country_code`,
  "address.phone--liquid": `address.phone`,
  "cart.attributes--liquid": `cart.attributes`,
  "cart.currency--liquid": `cart.currency`,
  "cart.item_count--liquid": `cart.item_count`,
  "cart.items--liquid": `cart.items`,
  "cart.note--liquid": `cart.note`,
  "cart.original_total_price--liquid": `cart.original_total_price`,
  "cart.total_discount--liquid": `cart.total_discount`,
  "cart.total_price--liquid": `cart.total_price`,
  "cart.total_weight--liquid": `cart.total_weight`,
  "gift_card.balance--liquid": `gift_card.balance`,
  "gift_card.code--liquid": `gift_card.code`,
  "gift_card.currency--liquid": `gift_card.currency`,
  "gift_card.customer--liquid": `gift_card.customer`,
  "gift_card.enabled--liquid": `gift_card.enabled`,
  "gift_card.expired--liquid": `gift_card.expired`,
  "gift_card.expires_on--liquid": `gift_card.expires_on`,
  "gift_card.initial_value--liquid": `gift_card.initial_value`,
  "gift_card.product--liquid": `gift_card.product`,
  "gift_card.properties--liquid": `gift_card.properties`,
  "gift_card.url--liquid": `gift_card.url`,
  "currency.name--liquid": `currency.name`,
  "currency.iso_code--liquid": `currency.iso_code`,
  "currency.symbol--liquid": `currency.symbol`,
  "checkout.applied_gift_cards--liquid": `checkout.applied_gift_cards`,
  "checkout.attributes--liquid": `checkout.attributes`,
  "checkout.billing_address--liquid": `checkout.billing_address`,
  "checkout.buyer_accepts_marketing--liquid": `checkout.buyer_accepts_marketing`,
  "checkout.customer--liquid": `checkout.customer`,
  "checkout.discount_applications--liquid": `checkout.discount_applications`,
  "checkout.discounts--liquid": `checkout.discounts`,
  "checkout.discounts_amount--liquid": `checkout.discounts_amount`,
  "checkout.discounts_savings--liquid": `checkout.discounts_savings`,
  "checkout.email--liquid": `checkout.email`,
  "checkout.gift_cards_amount--liquid": `checkout.gift_cards_amount`,
  "checkout.id--liquid": `checkout.id`,
  "checkout.line_items--liquid": `checkout.line_items`,
  "checkout.name--liquid": `checkout.name`,
  "checkout.note--liquid": `checkout.note`,
  "checkout.order--liquid": `checkout.order`,
  "checkout.order_id--liquid": `checkout.order_id`,
  "checkout.order_name--liquid": `checkout.order_name`,
  "checkout.order_number--liquid": `checkout.order_number`,
  "checkout.requires_shipping--liquid": `checkout.requires_shipping`,
  "checkout.shipping_address--liquid": `checkout.shipping_address`,
  "checkout.shipping_method--liquid": `checkout.shipping_method`,
  "checkout.shipping_methods--liquid": `checkout.shipping_methods`,
  "checkout.shipping_price--liquid": `checkout.shipping_price`,
  "checkout.subtotal_price--liquid": `checkout.subtotal_price`,
  "checkout.tax_lines--liquid": `checkout.tax_lines`,
  "checkout.tax_price--liquid": `checkout.tax_price`,
  "checkout.total_price--liquid": `checkout.total_price`,
  "checkout.transactions--liquid": `checkout.transactions`,
  "shipping_method.handle--liquid": `shipping_method.handle`,
  "shipping_method.original_price--liquid": `shipping_method.original_price`,
  "shipping_method.price--liquid": `shipping_method.price`,
  "shipping_method.title--liquid": `shipping_method.title`,
  "comment.id--liquid": `comment.id`,
  "comment.author--liquid": `comment.author`,
  "comment.created_at--liquid": `comment.created_at`,
  "comment.updated_at--liquid": `comment.updated_at`,
  "comment.email--liquid": `comment.email`,
  "comment.content--liquid": `comment.content`,
  "comment.status--liquid": `comment.status`,
  "comment.url--liquid": `comment.url`,
  "collections['handle'].variable--liquid": `collections['handle'].variable`,
  "collection.all_products_count--liquid": `collection.all_products_count`,
  "collection.all_tags--liquid": `collection.all_tags`,
  "collection.all_types--liquid": `collection.all_types`,
  "collection.all_vendors--liquid": `collection.all_vendors`,
  "collection.current_type--liquid": `collection.current_type`,
  "collection.current_vendor--liquid": `collection.current_vendor`,
  "collection.default_sort_by--liquid": `collection.default_sort_by`,
  "collection.description--liquid": `collection.description`,
  "collection.handle--liquid": `collection.handle`,
  "collection.id--liquid": `collection.id`,
  "collection.image--liquid": `collection.image`,
  "collection.next_product--liquid": `collection.next_product`,
  "collection.previous_product--liquid": `collection.previous_product`,
  "collection.products--liquid": `collection.products`,
  "collection.products_count--liquid": `collection.products_count`,
  "collection.published_at--liquid": `collection.published_at`,
  "collection.sort_by--liquid": `collection.sort_by`,
  "collection.sort_options--liquid": `collection.sort_options`,
  "collection.template_suffix--liquid": `collection.template_suffix`,
  "collection.title--liquid": `collection.title`,
  "collection.tags--liquid": `collection.tags`,
  "collection.url--liquid": `collection.url`,
  "page['handle'].variable--liquid": `page['handle'].variable`,
  "page.author--liquid": `page.author`,
  "page.content--liquid": `page.content`,
  "page.handle--liquid": `page.handle`,
  "page.id--liquid": `page.id`,
  "page.published_at--liquid": `page.published_at`,
  "page.template_suffix--liquid": `page.template_suffix`,
  "page.title--liquid": `page.title`,
  "page.url--liquid": `page.url`,
  "product_option.name--liquid": `product_option.name`,
  "product_option.position--liquid": `product_option.position`,
  "product_option.selected_value--liquid": `product_option.selected_value`,
  "product_option.values--liquid": `product_option.values`,
  "routes.account_addresses_url--liquid": `routes.account_addresses_url`,
  "routes.account_url--liquid": `routes.account_url`,
  "routes.account_login_url--liquid": `routes.account_login_url`,
  "routes.account_logout_url--liquid": `routes.account_logout_url`,
  "routes.account_recover_url--liquid": `routes.account_recover_url`,
  "routes.account_register_url--liquid": `routes.account_register_url`,
  "routes.all_products_collection_url--liquid": `routes.all_products_collection_url`,
  "routes.cart_url--liquid": `routes.cart_url`,
  "routes.cart_add_url--liquid": `routes.cart_add_url`,
  "routes.cart_change_url--liquid": `routes.cart_change_url`,
  "routes.cart_clear_url--liquid": `routes.cart_clear_url`,
  "routes.collections_url--liquid": `routes.collections_url`,
  "routes.product_recommendations_url--liquid": `routes.product_recommendations_url`,
  "routes.root_url--liquid": `routes.root_url`,
  "routes.search_url--liquid": `routes.search_url`,
  "section.blocks--liquid": `section.blocks`,
  "section.id--liquid": `section.id`,
  "section.settings--liquid": `section.settings`,
  "image.alt--liquid": `image.alt`,
  "image.aspect_ratio--liquid": `image.aspect_ratio`,
  "image.attached_to_variant?--liquid": `image.attached_to_variant?`,
  "image.height--liquid": `image.height`,
  "image.id--liquid": `image.id`,
  "image.position--liquid": `image.position`,
  "image.product_id--liquid": `image.product_id`,
  "image.src--liquid": `image.src`,
  "image.variants--liquid": `image.variants`,
  "image.width--liquid": `image.width`,
  "customer.accepts_marketing--liquid": `customer.accepts_marketing`,
  "customer.addresses--liquid": `customer.addresses`,
  "customer.addresses_count--liquid": `customer.addresses_count`,
  "customer.default_address--liquid": `customer.default_address`,
  "customer.email--liquid": `customer.email`,
  "customer.first_name--liquid": `customer.first_name`,
  "customer.has_account--liquid": `customer.has_account`,
  "customer.id--liquid": `customer.id`,
  "customer.last_name--liquid": `customer.last_name`,
  "customer.last_order--liquid": `customer.last_order`,
  "customer.name--liquid": `customer.name`,
  "customer.orders--liquid": `customer.orders`,
  "customer.orders_count--liquid": `customer.orders_count`,
  "customer.phone--liquid": `customer.phone`,
  "customer.tags--liquid": `customer.tags`,
  "customer.customer-tax_exempt--liquid": `customer.customer-tax_exempt`,
  "customer.total_spent--liquid": `customer.total_spent`,
  "customer_address.first_name--liquid": `customer_address.first_name`,
  "customer_address.last-name--liquid": `customer_address.last-name`,
  "customer_address.address1--liquid": `customer_address.address1`,
  "customer_address.address2--liquid": `customer_address.address2`,
  "customer_address.street--liquid": `customer_address.street`,
  "customer_address.company--liquid": `customer_address.company`,
  "customer_address.city--liquid": `customer_address.city`,
  "customer_address.province--liquid": `customer_address.province`,
  "customer_address.province_code--liquid": `customer_address.province_code`,
  "customer_address.zip--liquid": `customer_address.zip`,
  "customer_address.country--liquid": `customer_address.country`,
  "customer_address.country_code--liquid": `customer_address.country_code`,
  "customer_address.phone--liquid": `customer_address.phone`,
  "customer_address.id--liquid": `customer_address.id`,
  "discount_allocation.amount--liquid": `discount_allocation.amount`,
  "discount_allocation.discount_application--liquid": `discount_allocation.discount_application`,
  "discount_application.target_selection--liquid": `discount_application.target_selection`,
  "discount_application.target_type--liquid": `discount_application.target_type`,
  "discount_application.title--liquid": `discount_application.title`,
  "discount_application.total_allocated_amount--liquid": `discount_application.total_allocated_amount`,
  "discount_application.type--liquid": `discount_application.type`,
  "discount_application.value--liquid": `discount_application.value`,
  "discount_application.value_type--liquid": `discount_application.value_type`,
  "fulfillment.tracking_company--liquid": `fulfillment.tracking_company`,
  "fulfillment.tracking_number--liquid": `fulfillment.tracking_number`,
  "fulfillment.tracking_url--liquid": `fulfillment.tracking_url`,
  "fulfillment.fulfillment_line_items--liquid": `fulfillment.fulfillment_line_items`,
  "fulfillment.item_count--liquid": `fulfillment.item_count`,
  "line_item.discount_allocations--liquid": `line_item.discount_allocations`,
  "line_item.final_line_price--liquid": `line_item.final_line_price`,
  "line_item.final_price--liquid": `line_item.final_price`,
  "line_item.fulfillment--liquid": `line_item.fulfillment`,
  "line_item.fulfillment_service--liquid": `line_item.fulfillment_service`,
  "line_item.gift_card--liquid": `line_item.gift_card`,
  "line_item.grams--liquid": `line_item.grams`,
  "line_item.key--liquid": `line_item.key`,
  "line_item.image--liquid": `line_item.image`,
  "line_item.line_price--liquid": `line_item.line_price`,
  "line_item.message--liquid": `line_item.message`,
  "line_item.original_line_price--liquid": `line_item.original_line_price`,
  "line_item.original_price--liquid": `line_item.original_price`,
  "line_item.price--liquid": `line_item.price`,
  "line_item.product--liquid": `line_item.product`,
  "line_item.product_id--liquid": `line_item.product_id`,
  "line_item.properties--liquid": `line_item.properties`,
  "line_item.quantity--liquid": `line_item.quantity`,
  "line_item.requires_shipping--liquid": `line_item.requires_shipping`,
  "line_item.sku--liquid": `line_item.sku`,
  "line_item.successfully_fulfilled_quantity--liquid": `line_item.successfully_fulfilled_quantity`,
  "line_item.taxable--liquid": `line_item.taxable`,
  "line_item.title--liquid": `line_item.title`,
  "line_item.url--liquid": `line_item.url`,
  "line_item.total_discount--liquid": `line_item.total_discount`,
  "line_item.variant--liquid": `line_item.variant`,
  "line_item.variant_id--liquid": `line_item.variant_id`,
  "line_item.vendor--liquid": `line_item.vendor`,
  "all_products['handle'].variable--liquid": `all_products['handle'].variable`,
  "product.available--liquid": `product.available`,
  "product.collections--liquid": `product.collections`,
  "product.compare_at_price_max--liquid": `product.compare_at_price_max`,
  "product.compare_at_price_min--liquid": `product.compare_at_price_min`,
  "product.compare_at_price_varies--liquid": `product.compare_at_price_varies`,
  "product.content--liquid": `product.content`,
  "product.created_at--liquid": `product.created_at`,
  "product.description--liquid": `product.description`,
  "product.featured_image--liquid": `product.featured_image`,
  "product.featured_media--liquid": `product.featured_media`,
  "product.first_available_variant--liquid": `product.first_available_variant`,
  "product.handle--liquid": `product.handle`,
  "product.gift_card?--liquid": `product.gift_card?`,
  "product.has_only_default_variant--liquid": `product.has_only_default_variant`,
  "product.id--liquid": `product.id`,
  "product.images--liquid": `product.images`,
  "product.options--liquid": `product.options`,
  "product.options_with_values--liquid": `product.options_with_values`,
  "product.price--liquid": `product.price`,
  "product.price_max--liquid": `product.price_max`,
  "product.price_min--liquid": `product.price_min`,
  "product.price_varies--liquid": `product.price_varies`,
  "product.published_at--liquid": `product.published_at`,
  "product.selected_variant--liquid": `product.selected_variant`,
  "product.selected_or_first_available_variant--liquid": `product.selected_or_first_available_variant`,
  "product.tags--liquid": `product.tags`,
  "product.template_suffix--liquid": `product.template_suffix`,
  "product.title--liquid": `product.title`,
  "product.type--liquid": `product.type`,
  "product.url--liquid": `product.url`,
  "product.variants--liquid": `product.variants`,
  "product.vendor--liquid": `product.vendor`,
  "variant.available--liquid": `variant.available`,
  "variant.barcode--liquid": `variant.barcode`,
  "variant.compare_at_price--liquid": `variant.compare_at_price`,
  "variant.id--liquid": `variant.id`,
  "variant.image--liquid": `variant.image`,
  "variant.incoming--liquid": `variant.incoming`,
  "variant.inventory_management--liquid": `variant.inventory_management`,
  "variant.inventory_policy--liquid": `variant.inventory_policy`,
  "variant.next_incoming_date--liquid": `variant.next_incoming_date`,
  "variant.inventory_quantity--liquid": `variant.inventory_quantity`,
  "variant.option1--liquid": `variant.option1`,
  "variant.option2--liquid": `variant.option2`,
  "variant.option3--liquid": `variant.option3`,
  "variant.price--liquid": `variant.price`,
  "variant.requires_shipping--liquid": `variant.requires_shipping`,
  "variant.selected--liquid": `variant.selected`,
  "variant.sku--liquid": `variant.sku`,
  "variant.taxable--liquid": `variant.taxable`,
  "variant.title--liquid": `variant.title`,
  "variant.unit_price--liquid": `variant.unit_price`,
  "variant.unit_price_measurement--liquid": `variant.unit_price_measurement`,
  "variant.url--liquid": `variant.url`,
  "variant.weight--liquid": `variant.weight`,
  "variant.weight_unit--liquid": `variant.weight_unit`,
  "variant.weight_in_unit--liquid": `variant.weight_in_unit`,
  "linklists['handle'].variable--liquid": `linklists['handle'].variable`,
  "linklist.title--liquid": `linklist.title`,
  "linklist.handle--liquid": `linklist.handle`,
  "linklist.links--liquid": `linklist.links`,
  "linklist.object--liquid": `linklist.object`,
  "linklist.levels--liquid": `linklist.levels`,
  "link.active--liquid": `link.active`,
  "link.child_active--liquid": `link.child_active`,
  "link.child_current--liquid": `link.child_current`,
  "link.current--liquid": `link.current`,
  "link.levels--liquid": `link.levels`,
  "link.links--liquid": `link.links`,
  "link.object--liquid": `link.object`,
  "link.title--liquid": `link.title`,
  "link.type--liquid": `link.type`,
  "link.url--liquid": `link.url`,
  "shop.address--liquid": `shop.address`,
  "shop.collections_count--liquid": `shop.collections_count`,
  "shop.currency--liquid": `shop.currency`,
  "shop.description--liquid": `shop.description`,
  "shop.domain--liquid": `shop.domain`,
  "shop.email--liquid": `shop.email`,
  "shop.enabled_currencies--liquid": `shop.enabled_currencies`,
  "shop.enabled_locales--liquid": `shop.enabled_locales`,
  "shop.enabled_payment_types--liquid": `shop.enabled_payment_types`,
  "shop.metafields--liquid": `shop.metafields`,
  "shop.money_format--liquid": `shop.money_format`,
  "shop.money_with_currency_format--liquid": `shop.money_with_currency_format`,
  "shop.name--liquid": `shop.name`,
  "shop.password_message--liquid": `shop.password_message`,
  "shop.permanent_domain--liquid": `shop.permanent_domain`,
  "shop.phone--liquid": `shop.phone`,
  "shop.policies--liquid": `shop.policies`,
  "shop.privacy_policy--liquid": `shop.privacy_policy`,
  "shop.refund_policy--liquid": `shop.refund_policy`,
  "shop.shipping_policy--liquid": `shop.shipping_policy`,
  "shop.terms_of_service--liquid": `shop.terms_of_service`,
  "shop.products_count--liquid": `shop.products_count`,
  "shop.taxes-included--liquid": `shop.taxes-included`,
  "shop.types--liquid": `shop.types`,
  "shop.url--liquid": `shop.url`,
  "shop.secure_url--liquid": `shop.secure_url`,
  "shop.vendors--liquid": `shop.vendors`,
  "shop_locale.endonym_name--liquid": `shop_locale.endonym_name`,
  "shop_locale.iso_code--liquid": `shop_locale.iso_code`,
  "shop_locale.name--liquid": `shop_locale.name`,
  "shop_locale.primary--liquid": `shop_locale.primary`,
  "shop_locale.root_url--liquid": `shop_locale.root_url`,
  "tax_line.title--liquid": `tax_line.title`,
  "tax_line.price--liquid": `tax_line.price`,
  "tax_line.rate--liquid": `tax_line.rate`,
  "tax_line.rate_percentage--liquid": `tax_line.rate_percentage`,
  "order.attributes--liquid": `order.attributes`,
  "order.billing_address--liquid": `order.billing_address`,
  "order.cancelled--liquid": `order.cancelled`,
  "order.cancelled_at--liquid": `order.cancelled_at`,
  "order.cancel_reason--liquid": `order.cancel_reason`,
  "order.cancel_reason_label--liquid": `order.cancel_reason_label`,
  "order.created_at--liquid": `order.created_at`,
  "order.customer--liquid": `order.customer`,
  "order.customer_url--liquid": `order.customer_url`,
  "order.discount_applications--liquid": `order.discount_applications`,
  "order.email--liquid": `order.email`,
  "order.financial_status--liquid": `order.financial_status`,
  "order.financial_status_label--liquid": `order.financial_status_label`,
  "order.fulfillment_status--liquid": `order.fulfillment_status`,
  "order.fulfillment_status_label--liquid": `order.fulfillment_status_label`,
  "order.line_items--liquid": `order.line_items`,
  "order.location--liquid": `order.location`,
  "order.order_status_url--liquid": `order.order_status_url`,
  "order.name--liquid": `order.name`,
  "order.note--liquid": `order.note`,
  "order.order_number--liquid": `order.order_number`,
  "order.phone--liquid": `order.phone`,
  "order.shipping_address--liquid": `order.shipping_address`,
  "order.shipping_methods--liquid": `order.shipping_methods`,
  "order.shipping_price--liquid": `order.shipping_price`,
  "order.subtotal_price--liquid": `order.subtotal_price`,
  "order.tags--liquid": `order.tags`,
  "order.tax_lines--liquid": `order.tax_lines`,
  "order.tax_price--liquid": `order.tax_price`,
  "order.total_discounts--liquid": `order.total_discounts`,
  "order.total_net_amount--liquid": `order.total_net_amount`,
  "order.total_price--liquid": `order.total_price`,
  "order.total_refunded_amount--liquid": `order.total_refunded_amount`,
  "order.transactions--liquid": `order.transactions`,
  "paginate.current_page--liquid": `paginate.current_page`,
  "paginate.current_offset--liquid": `paginate.current_offset`,
  "paginate.items--liquid": `paginate.items`,
  "paginate.parts--liquid": `paginate.parts`,
  "paginate.next--liquid": `paginate.next`,
  "paginate.previous--liquid": `paginate.previous`,
  "paginate.page_size--liquid": `paginate.page_size`,
  "paginate.pages--liquid": `paginate.pages`,
  "search.performed--liquid": `search.performed`,
  "search.results--liquid": `search.results`,
  "search.results_count--liquid": `search.results_count`,
  "search.terms--liquid": `search.terms`,
  "search.types--liquid": `search.types`,
  "recommendations.performed--liquid": `recommendations.performed`,
  "recommendations.products_count--liquid": `recommendations.products_count`,
  "recommendations.products--liquid": `recommendations.products`,
  "template--liquid": `template`,
  "template.directory--liquid": `template.directory`,
  "template.name--liquid": `template.name`,
  "template.suffix--liquid": `template.suffix`,
  "transaction.id--liquid": `transaction.id`,
  "transaction.amount--liquid": `transaction.amount`,
  "transaction.name--liquid": `transaction.name`,
  "transaction.status--liquid": `transaction.status`,
  "transaction.status_label--liquid": `transaction.status_label`,
  "transaction.created_at--liquid": `transaction.created_at`,
  "transaction.receipt--liquid": `transaction.receipt`,
  "transaction.kind--liquid": `transaction.kind`,
  "transaction.gateway--liquid": `transaction.gateway`,
  "transaction.payment_details--liquid": `transaction.payment_details`,
};

let css = {
  "color--css": "color",
  "cursor--css": "cursor",
  "filter--css": "filter",
  "float--css": "float",
  "letter-spacing--css": "letter-spacing",
  "line-height--css": "line-height",
  "list-style--css": "list-style",
  "list-style-image--css": "list-style-image",
  "overflow--css": "overflow",
  "text-align--css": "text-align",
  "text-decoration--css": "text-decoration",
  "align-items--css": "align-items",
  "vertical-align--css": "vertical-align",
  "background-color--css": "background-color",
  "background-image--css": "background-image",
  "background-position--css": "background-position",
  "background-repeat--css": "background-repeat",
  "display--css": "display",
  "width--css": "width",
  "height--css": "height",
  "min-width--css": "min-width",
  "min-height--css": "min-height",
  "max-width--css": "max-width",
  "max-height--css": "max-height",
  "margin--css": "margin",
  "margin-left--css": "margin-left",
  "margin-right--css": "margin-right",
  "margin-top--css": "margin-top",
  "margin-bottom--css": "margin-bottom",
  "padding-left--css": "padding-left",
  "padding-right--css": "padding-right",
  "padding-top--css": "padding-top",
  "padding-bottom--css": "padding-bottom",
  "padding--css": "padding",
  "border--css": "border",
  "border-left--css": "border-left",
  "border-right--css": "border-right",
  "border-top--css": "border-top",
  "border-bottom--css": "border-bottom",
  "border-color--css": "border-color",
  "border-width--css": "border-width",
  "border-style--css": "border-style",
  "border-radius--css": "border-radius",
  "font--css": "font",
  "visibility--css": "visibility",
  "font-family--css": "font-family",
  "font-style--css": "font-style",
  "font-weight--css": "font-weight",
  "position--css": "position",
  "z-index--css": "z-index",
};

let html = {
  "p--html": "<p></p>",
  "div--html": "<div></div>",
  "span--html": "<span></span>",
  "img--html": `<img class="" src="" alt="">`,
  "hr--html": "<hr></hr>",
  "h1--html": "<h1></h1>",
  "h2--html": "<h2></h2>",
  "h3--html": "<h3></h3>",
  "h4--html": "<h4></h4>",
  "h6--html": "<h6></h6>",
  "h6--html": "<h6></h6>",
  "ul--html": `<ul>
  <li></li>
</ul>`,
  "ol--html": `<ol>
  <li></li>
</ol>`,
  "a--html": `<a href=""></a>`,
  "table--html": `<table>
  <tr>
    <th>1</th>
  </tr>
  <tr>
    <td>2</td>
  </tr>
  <tr>
    <td>3</td>
  </tr>
</table>`,
  "label--html": `<label for=""></label>`,
  "button--html": `<button></button>`,
  "link--html": `<link rel="stylesheet" href="">`,
  "html:5--html": `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
  </head>
  <body>

  </body>
</html>`,
  "comment--html": `<!--  -->`,
  "br--html": `</br>`,
  "head--html": `<head></head>`,
  "header--html": `<header></header>`,
  "main--html": `<main></main>`,
  "nav--html": `<nav></nav>`,
  "aside--html": `<aside></aside>`,
  "footer--html": `<footer></footer>`,
  "li--html": `<li></li>`,
  "comment--html": `<!--  -->`,
  "body--html": `body`,
  "i--html": "<i></i>",
  "b--html": "<b></b>",
  "s--html": "<s></s>",
  "querySelector--js": `querySelector('')`,
  "getElementByIdAll--js": `getElementByIdAll('')`,
  "getElementsByTagName--js": `getElementsByTagName('')`,
  "getElementsByName--js": `getElementsByName('')`,
  "getElementsByClassName--js": `getElementsByClassName('')`,
  "getElementById--js": `getElementById('')`,
  "DOMContentLoaded--js": `window.addEventListener('DOMContentLoaded', (event) => {
    console.log('ready');
});`,
};

let schema = {
  "schema-text--schema": `{
    "type": "text",
    "id": "id",
    "label": "text",
    "default": "value",
    "info": "text",
    "placeholder": "text"
}`,
  "schema-textarea--schema": `{
   "type": "textarea",
   "id": "id",
   "label": "text",
   "default": "value",
   "info": "text",
   "placeholder": "text"
}`,
  "schema-radio--schema": `{
  "type": "radio",
  "id": "id",
  "label": "text",
  "options": [
    { "value": "one", "label": "Radio one" },
    { "value": "two", "label": "Radio two" }
  ],
  "default": "one",
  "info": "text"
}`,
  "schema-select--schema": `{
  "type": "select",
  "id": "id",
  "label": "text",
  "options": [
    {
      "group": "value",
      "value": "value",
      "label": "text"
    },
    {
      "group": "value",
      "value": "value",
      "label": "text"
    }
  ],
  "default": "value",
  "info": "text"
}`,
  "schema-checkbox--schema": `{
  "type": "checkbox",
  "id": "id",
  "label": "text",
  "default": false,
  "info": "text"
}`,
  "schema-range--schema": `{
  "type": "range",
  "id": "id",
  "min": value,
  "max": value,
  "step": value,
  "unit": "text",
  "label": "text",
  "default": value
}`,
  "schema-number--schema": `{ 
  "type": "number",   
  "id": "id", 
  "label": "text",    
  "default": value  
}`,
  "schema-color-picker--schema": `{
  "type":      "color",
  "id":        "id",
  "label":     "text",
  "default":   "value",
  "info":      "text"
}`,
  "schema-font-picker--schema": `{
  "type": "font_picker",
  "label": "text",
  "id": "id",
  "info": "text",
  "default": "helvetica_n4"
}`,
  "schema-collection-selector--schema": `{
  "type": "collection",
  "id": "id",
  "label": "text",
  "info": "text"
}`,
  "schema-product-selector--schema": `{
  "type": "product",
  "id": "id",
  "label": "text",
  "info": "text"
}`,
  "schema-blog-selector--schema": `{
  "type": "blog",
  "id": "id",
  "label": "text",
  "info": "text"
}`,
  "schema-page-selector--schema": `{
  "type": "page",
  "id": "id",
  "label": "text",
  "info": "text"
}`,
  "schema-menu-selector-link-list--schema": `{
  "type": "link_list",
  "id": "id",
  "label": "text",
  "info": "text"
}`,
  "schema-url--schema": `{
  "id": "banner_call_to_action",
  "type": "url",
  "label": "Banner button link"
}`,
  "schema-video-url--schema": `{
  "id": "video_url",
  "type": "video_url",
  "label": "Video URL",
  "accept": ["youtube", "vimeo"],
  "default": "https://www.youtube.com/watch?v=_9VUPq3SxOc",
  "info": "text",
  "placeholder": "text"
}`,
  "schema-richtext--schema": `{
  "type": "richtext",
  "id": "column_richtext",
  "label": "text",
  "default": "<p>Default <em>richtext</em> <a href=\"https://example.com/\">content</a></p>"
}`,
  "schema-html--schema": `{
  "type": "html",
  "id": "html_area",
  "label": "Custom HTML",
  "default": "<div><p>Some HTML content</p></div>"
}`,
  "schema-article--schema": `{
  "type": "article",
  "id": "featured_article",
  "label": "Article to feature on the home page"
}`,
  "schema-image-picker--schema": `{
  "type": "image_picker",
  "id": "logo",
  "label": "Logo image"
}`,
  "schema-header--schema": `{
  "type": "header",
  "content": "text",
  "info": "text"
}`,
  "schema-paragraph--schema": `{
  "type": "paragraph",
  "content": "text"
}`,
};
