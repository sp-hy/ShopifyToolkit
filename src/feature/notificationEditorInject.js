let interval = setInterval(() => {
  if (!document.querySelector("textarea")) return;
  if (window.location.href.indexOf("email_templates") < 0) return

  document.querySelector('#email_template_body_html').style.whiteSpace = "nowrap";
  
  if (!document.querySelector(".ace_editor")){
    let vanillaEditor = document.querySelector('#PolarisTextField3');
    let editor = ace.edit(vanillaEditor);

    // Set editor dimensions
    // document.querySelector('.ui-layout').style.maxWidth = "unset";
    document.querySelector('.ace_editor').style.height = "60vh";
    document.querySelector('.ace_editor').parentElement.style.display = "inline";
    document.querySelector('.ace_print-margin').style.display = "none";
    
    // Set editor mode to twig language (most compatible syntax hightlighting with liquid)
    editor.session.setMode("ace/mode/twig");

    // Force enable save button
    setInterval(() => {
      let saveButton = document.querySelector('#edit_email_template .btn-disabled');
      saveButton && saveButton.classList.remove('btn-disabled');
    }, 500);

    // Set editor title
    let editorTitle = document.querySelector('[for="email_template_body_html"]');
    if(editorTitle)
      editorTitle.innerText = 'Email body (HTML) [Liquify Enhanced]';

    // Create a clone text area and assign the original Shopify textarea editor ID/Name to it
    // Necessary as the save won't work correctly due to the way the ACE editor modifies the textarea
    // let cloneEditor = document.createElement("textarea");
    // let editorContainer = document.querySelector(".Polaris-Connected_wopc9");
    // cloneEditor.setAttribute('id', 'email_template_body_html');
    // cloneEditor.setAttribute('name', 'email_template[body_html]');
    // cloneEditor.style.display = "none";
    // editorContainer.append(cloneEditor);

    // Clone current ace editor content to clone textarea onload and focus out
    // let cloneElement = document.querySelector('#email_template_body_html');
    // let aceTextArea = document.querySelector('.ace_editor');

    // if (cloneElement)
    //  cloneEditor.value = editor.getValue();

    // aceTextArea.addEventListener('focusout', event => {
    //   // if (cloneElement)
    //   //  cloneEditor.value = editor.getValue();
    // })

    // Resize editor
    setTimeout(() => {
      editor.resize();
    }, 2000);
    
  };
}, 500);