let autoCompleteInverval = setInterval(() => {
  if (!$("textarea").length) return;

  clearInterval(autoCompleteInverval);

  // Store input
  let keyBuffer = "";

  // Listen for key input
  document.addEventListener("keydown", function (event) {
    if (event.key.length == 1) keyBuffer += event.key;
    if (event.key == "Backspace") keyBuffer = keyBuffer.slice(0, -1);
    if (event.key == "Escape") keyBuffer = "";

    console.log(event);
    console.log("buffer", keyBuffer);
  });
});
