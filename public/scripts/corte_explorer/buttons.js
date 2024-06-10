var input_by_RCC = document.getElementById('input_by_RCC');
var button_input_by_RCC = document.getElementById('boton_input_by_RCC');

var input_between_RCC_1 = document.getElementById('input_between_RCC_1');
var input_between_RCC_2 = document.getElementById('input_between_RCC_2');
var button_input_between_RCC = document.getElementById('boton_input_between_RCC');

var input_by_date = document.getElementById('input_by_date');
var button_input_by_date = document.getElementById('boton_input_by_date');

var input_between_dates_1 = document.getElementById('input_between_dates_1');
var input_between_dates_2 = document.getElementById('input_between_dates_2');
var button_input_between_dates = document.getElementById('boton_input_between_dates');

// By RCC
button_input_by_RCC.addEventListener('click', function() {
    var rcc = input_by_RCC.value;
    get_corte_by_RCC(rcc);
});

// Between RCC
button_input_between_RCC.addEventListener('click', function() {
    var rcc_1 = input_between_RCC_1.value;
    var rcc_2 = input_between_RCC_2.value;
    get_cortes_between_RCCs(rcc_1, rcc_2);
});

// By Date
button_input_by_date.addEventListener('click', function() {
    var date = input_by_date.value;
    get_corte_by_date(date);
});

// Between Dates
button_input_between_dates.addEventListener('click', function() {
    var date_1 = input_between_dates_1.value;
    var date_2 = input_between_dates_2.value;
    get_cortes_between_dates(date_1, date_2);
});

function delete_accordion_items() {
    const accordionContainer = document.getElementById('accordionCortes');
    accordionContainer.innerHTML = ''; // Elimina el contenido actual

    const emptyDiv = document.createElement('div');
    emptyDiv.classList.add('accordion'); // Agrega las clases de Bootstrap según necesites
    emptyDiv.id = 'accordionCortes';

    accordionContainer.appendChild(emptyDiv); // Agrega el div vacío
}