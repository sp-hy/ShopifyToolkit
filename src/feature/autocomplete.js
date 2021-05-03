// Store input
let keyBuffer = "";
// Current active word
let focusedWord = -1;
let combinedWords = [];
let combinedValues = [];

let autoCompleteInverval = setInterval(() => {
  if (!$("textarea").length) return;

  clearInterval(autoCompleteInverval);

  // Start event listener logic
  inputHandler();
  // Start mouse event logic
  // mouseHandler();

  affixSuggestionBoxToCursor();
}, 500);

inputHandler = () => {
  document.addEventListener("keydown", function (event) {
    let key = event.key;
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
        }
        break;
      // Regular input
      case key.length == 1:
        if (key.match(/^[A-Za-z ]+$/)) keyBuffer += key;
        key != "1" && keyBuffer.length > 0 && createSuggestion(keyBuffer);
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
  let $activeWord = $("#autocomplete li.active").eq(0).attr("data-word");

  let wordIndex = combinedWords.indexOf($activeWord);
  let wordContents = combinedValues[wordIndex];

  sendInputToEditor(wordContents);
};

createSuggestion = (input) => {
  combinedWords = Object.keys({
    ...liquid,
    ...javascript,
    ...html,
    ...schema,
    ...css,
  });
  combinedValues = Object.values({
    ...liquid,
    ...javascript,
    ...html,
    ...schema,
    ...css,
  });

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

  if (keyBuffer.length) $("#autocomplete").show();
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
};

destroySuggestions = () => {
  keyBuffer = "";
  focusedWord = -1;
  $("#autocomplete").hide();
};

sendInputToEditor = (input) => {
  let editor = document.getElementsByTagName("textarea")[0];

  editor.value = input;
  editor.dispatchEvent(new Event("input"));

  destroySuggestions();
};

let javascript = {
  "if--js": `if (condition) {
  
  }`,
  "if-else--js": `if (condition) {
  
  } else {
    
  }`,
  "console.log()--js": `console.log()`,
  "for--js": `for (let index = 0; index < array.length; index++) {
    const element = array[index];
    
  }`,
};

let liquid = {
  "assign--liquid": "{% assign variable = value %}",
  "if--liquid": `{% if true %}
  
{% endif %}`,
  "if-else--liquid": `{% if true %}
  
{% else %}
  
{% endif %}`,
};

let html = {
  "html--html": "test",
};

let schema = {
  "schema--schema": "test",
};

let css = {
  "css--css": "test",
};
