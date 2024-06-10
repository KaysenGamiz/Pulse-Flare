var body = document.querySelector('body');

function alertDialog(alertText) {
  var modalBg = document.createElement('div');
  modalBg.classList.add('modal-bg');

  var dialog = document.createElement('div');
  dialog.classList.add('dialog');

  var dialogTitle = document.createElement('div');
  dialogTitle.classList.add('dialog-title');
  dialogTitle.innerHTML = '<p>Hoja de Corte</p>';

  var dialogContent = document.createElement('div');
  dialogContent.classList.add('dialog-content');

  var dialogText = document.createElement('div');
  dialogText.classList.add('dialog-text-content');
  dialogText.innerHTML = `<div>${alertText}</div>`;

  var dialogFooter = document.createElement('div');
  dialogFooter.classList.add('dialog-footer');
  dialogFooter.innerHTML = '<button class="button-14 dialog-send">OK</button>';

  dialog.appendChild(dialogTitle);
  dialogContent.appendChild(dialogText);
  dialog.appendChild(dialogContent);
  dialog.appendChild(dialogFooter);

  modalBg.appendChild(dialog);
  body.appendChild(modalBg);

  modalBg.classList.add('bg-active');

  var modalSendButtons = document.querySelectorAll('.dialog-send');
  modalSendButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      body.removeChild(modalBg);
    });
  });
}
