document.addEventListener('DOMContentLoaded', function(){
    var modalBg = document.querySelector('.modal-bg');
    var modalSend = document.querySelector('.modal-send');
    var input = document.querySelector('.input-rcc');
    modalBg.classList.add('bg-active');

    async function processRCCValue() {
        var rccValue = input.value.trim(); // Se elimina cualquier espacio en blanco al inicio y al final
        var regex = /^RCC\d{4}$/;

        var valueInDB = await validateRCCinDB(rccValue);
        console.log("Value in db", valueInDB);

        if (!regex.test(rccValue) || valueInDB === true) {
          alertDialog("Por favor, ingresa un texto válido para el RCC.");
          return; // Se detiene el proceso si el valor del RCC está vacío
        }
        var spanRCC = document.querySelector('.idCorte');        
        RCC = rccValue;
        spanRCC.innerHTML = RCC;
        console.log("Valor del RCC:", RCC);
        modalBg.classList.remove("bg-active");
    }

    modalSend.addEventListener("click", processRCCValue);
    input.addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        processRCCValue();
    }
    });

});
