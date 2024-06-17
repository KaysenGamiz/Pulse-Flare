document.addEventListener("DOMContentLoaded", function() {
  mostrarFechaHora();
});

function mostrarFechaHora() {
  // Obtener la referencia a los elementos span
  var fechaElement = document.getElementById('fecha');
  var horaElement = document.getElementById('hora');

  // Obtener la fecha y hora actual
  var fechaActual = new Date();
  fechaHora = fechaActual;

  // Obtener los componentes de fecha y hora
  var dia = fechaActual.getDate();
  var mes = fechaActual.getMonth() + 1; // Los meses comienzan desde 0
  var anio = fechaActual.getFullYear();
  var horas = fechaActual.getHours();
  var minutos = fechaActual.getMinutes();

  // Formatear los componentes como cadena con dos dígitos
  var fechaFormateada = ("0" + dia).slice(-2) + "/" + ("0" + mes).slice(-2) + "/" + anio;
  var horaFormateada = ("0" + horas).slice(-2) + ":" + ("0" + minutos).slice(-2);

  fecha = fechaFormateada;
  hora = horaFormateada;

  // Asignar los valores formateados a los elementos span
  fechaElement.textContent = fechaFormateada;
  horaElement.textContent = horaFormateada;
}

// Impresion
function imprimir(){
  mostrarFechaHora();
  updateDolares();
  calculateTotal();
  calculateTotalConceptoCantidad('ComprasEfectivo', 'totalAmountCompras');
  calculateTotalConceptoCantidad('GastosEfectivo', 'totalAmountGastos');
  calculateTotalConceptoCantidad('Vales', 'totalAmountVales');
  calculateTotalConceptoCantidad('Devoluciones', 'totalAmountDevoluciones');   
  totalCorte = calcularSumaTotal();
  diferencia = calcularDiferencia();
  obtenerComprasEfectivo();
  obtenerGastosEfectivo(); 
  obtenerVales();
  obtenerDevoluciones();

  // Validar variables requeridas
  if (!efectivo.length && !Object.keys(comprasEfectivo).length && !Object.keys(gastosEfectivo).length && !Object.keys(vales).length && !Object.keys(dolares).length && !diferencia) {
    alertDialog("Debe ingresar al menos una de las siguientes variables: efectivo, comprasEfectivo, gastosEfectivo, vales, diferencia o dolares.");
    return;
  }

  if (!totalSistema || !recibido || !cajero) {
    alertDialog("Las variables totalSistema, recibido y cajero son requeridas.");
    return;
  }

// Convertir valores de cada clave a tipo float en comprasEfectivo
const comprasEfectivoFloat = {};
for (const key in comprasEfectivo) {
  comprasEfectivoFloat[key] = parseFloat(comprasEfectivo[key]);
}

// Convertir valores de cada clave a tipo float en gastosEfectivo
const gastosEfectivoFloat = {};
for (const key in gastosEfectivo) {
  gastosEfectivoFloat[key] = parseFloat(gastosEfectivo[key]);
}

// Convertir valores de cada clave a tipo float en vales
const valesFloat = {};
for (const key in vales) {
  valesFloat[key] = parseFloat(vales[key]);
}

// Convertir valores de cada clave a tipo float en devoluciones
const devolucionesFloat = {};
for (const key in devoluciones) {
  devolucionesFloat[key] = parseFloat(devoluciones[key]);
}

// Crear el objeto corteData con las propiedades actualizadas
var corteData = {
  RCC: RCC,
  efectivo: efectivo,
  totalEfectivo: totalEfectivo,
  dolares: dolares,
  retiroEnEfectivo: retiroEnEfectivo,
  tarjeta: tarjeta,
  comprasEfectivo: comprasEfectivoFloat,
  gastosEfectivo: gastosEfectivoFloat,
  vales: valesFloat,
  devoluciones: devolucionesFloat,
  totalCorte: totalCorte,
  totalSistema: parseFloat(totalSistema),
  diferencia: diferencia,
  recibido: recibido,
  cajero: cajero,
  fecha: fecha,
  hora: hora,
  fechaHora: fechaHora
};

  const result = createCorteFromWeb(corteData);
  if(result) {
      console.log("Operación exitosa");
      window.print();
      alertDialog('Corte creado exitosamente');
      location.reload();
  } else {
      console.log("Operación fallida");
      alertDialog('No se pudo completar la generacion del corte, vuelva a intentarlo.');
  }

}

// Event Handler

document.addEventListener('keydown', function(event) {
  if (event.ctrlKey && event.key === 'p') {
    imprimir();
  }
});


function handleEnterKey(event) {
  if (event.keyCode === 13 || event.keyCode === 38 || event.keyCode === 40) {  // 13 es el código de la tecla Enter, 38 es el código de la tecla "flecha arriba" y 40 es el código de la tecla "flecha abajo"
    var inputs = document.getElementsByClassName("input-navigation");
    var currentIndex = Array.from(inputs).indexOf(event.target);
    var nextIndex;

    if (event.keyCode === 38) {  // Tecla "flecha arriba"
      nextIndex = currentIndex - 1;
    } else {  // Tecla "Enter" o "flecha abajo"
      nextIndex = currentIndex + 1;
    }

    if (nextIndex >= 0 && nextIndex < inputs.length) {
      var nextInput = inputs[nextIndex];
      nextInput.focus();
    }

    calculateTotal();
    calculateTotalConceptoCantidad('ComprasEfectivo', 'totalAmountCompras');
    calculateTotalConceptoCantidad('GastosEfectivo', 'totalAmountGastos');
    calculateTotalConceptoCantidad('Vales', 'totalAmountVales');
    calculateTotalConceptoCantidad('Devoluciones', 'totalAmountDevoluciones');   
    calcularSumaTotal();
    obtenerComprasEfectivo();
    obtenerGastosEfectivo(); 
    obtenerVales();
    obtenerDevoluciones();
  }
}



// Seccion de Monedas fraccionarias.

function updateAmount(input, index) {
  var amountSpan = document.getElementById('amount' + index);
  var originalValue = parseFloat(amountSpan.getAttribute('data-original-value')) || 0;
  
  if (input.value === "") {
    amountSpan.textContent = '__________';
    efectivo[originalValue] = 0;
  } else {
    var newValue = parseInt(input.value) * originalValue;
    amountSpan.textContent = isNaN(newValue) ? '__________' : newValue;
    efectivo[originalValue] = isNaN(newValue) ? 0 : parseInt(input.value);
  }
}

function updateMonedas(input) {
  var amountSpan = document.getElementById('amount7');
  amountSpan.textContent = input.value;
  efectivo['monedas'] = input.value === "" ? 0 : parseFloat(input.value);  // Se guarda el valor de las monedas en el arreglo
}

// Update Dlls

function updateDolares() {
  var amountSpan = document.getElementById('amount8');
  var value8 = parseFloat(document.getElementsByName('fname8')[0].value) || 0;
  var value9 = parseFloat(document.getElementsByName('fname9')[0].value) || 0;
  var product = value8 * value9;
  
  dolares = {
    TC: value8,
    efectivo: value9
  };
  
  var formattedProduct = product.toFixed(2);
  amountSpan.textContent = isNaN(formattedProduct) ? '__________' : formattedProduct;
}

// Inputs para concepto - cantidad

function addInput(containerClassName, numericInputIndex) {
  var numericInput = document.getElementsByClassName("numeric-input")[numericInputIndex];
  var currentCount = parseInt(numericInput.value);
  var numberOfInputsToAdd = currentCount;

  if (currentCount <= 1) {
    numberOfInputsToAdd = 1;
  }

  var existingInputs = document.querySelectorAll('[name^="fname"]');
  var lastInputIndex = existingInputs.length > 0 ? parseInt(existingInputs[existingInputs.length - 1].name.replace('fname', '')) : 13;

  for (var i = 0; i < numberOfInputsToAdd; i++) {
    var newInputContainer = document.createElement("div");
    newInputContainer.classList.add("input-container");

    var input1 = document.createElement("input");
    input1.placeholder = "";
    input1.type = "text";
    input1.name = "fname" + (lastInputIndex + (i * 2) + 1);
    input1.style.width = "190px";
    input1.classList.add("input-concepto");
    input1.setAttribute("onkeyup", "handleEnterKey(event)");

    input1.classList.add("input-navigation"); // Agregar la clase "input-navigation"

    var dollarSign = document.createElement("span");
    dollarSign.classList.add("dolar");
    dollarSign.innerText = "$";

    var input2 = document.createElement("input");
    input2.placeholder = "";
    input2.type = "text";
    input2.name = "fname" + (lastInputIndex + (i * 2) + 2);
    input2.style.width = "90px";
    input2.setAttribute("onkeyup", "handleEnterKey(event)");

    input2.classList.add("input-navigation"); // Agregar la clase "input-navigation"

    newInputContainer.appendChild(input1);
    newInputContainer.appendChild(dollarSign);
    newInputContainer.appendChild(input2);

    var containerElement = document.getElementsByClassName(containerClassName)[0];
    containerElement.appendChild(newInputContainer);
  }

  numericInput.value = 1;
}


function removeInput(containerClassName) {
  var containerElement = document.getElementsByClassName(containerClassName)[0];
  var inputContainers = containerElement.getElementsByClassName("input-container");

  // Obtener el valor del input numeric-input
  var numericInput = containerElement.getElementsByClassName("numeric-input")[0];
  var currentCount = parseInt(numericInput.value);

  // Verificar si hay más de un conjunto de inputs
  if (inputContainers.length > 1) {
    // Calcular la cantidad de inputs a eliminar
    var inputsToRemove = Math.min(currentCount, inputContainers.length - 1);

    // Eliminar los inputs correspondientes
    for (var i = 0; i < inputsToRemove; i++) {
      var lastInputContainer = inputContainers[inputContainers.length - 1];
      lastInputContainer.remove();
    }

    // Restar la cantidad de inputs eliminados al valor del input numeric-input, asegurándonos de que no sea menor que 1
    numericInput.value = Math.max(currentCount - inputsToRemove);
    numericInput.value = 1;
  }
}

// Calculate Totales

function calculateTotalConceptoCantidad(containerClassName, totalElementId) {
  var inputs = document.querySelectorAll('.' + containerClassName + ' .input-container input[name^="fname"]');
  var total = Array.from(inputs).reduce(function(sum, input, index) {
    if (index % 2 !== 0) {
      var value = parseFloat(input.value) || 0;
      return sum + value;
    }
    return sum;
  }, 0);

  var totalAmountElement = document.getElementById(totalElementId);
  totalAmountElement.textContent = isNaN(total) ? '___________' : total;
}

function calculateTotal() {
  var total = Object.entries(efectivo).reduce(function(sum, [key, value]) {
    if (key !== "monedas") {
      return sum + (parseInt(key) * value);
    } else {
      return sum + value;
    }
  }, 0);

  var totalAmountElement = document.getElementById('totalAmount');
  totalAmountElement.textContent = isNaN(total) ? '___________' : total;
  totalEfectivo = total;
}

function calcularSumaTotal() {
  var totalAmount = parseFloat(document.getElementById('totalAmount').textContent) || 0;
  var totalAmountCompras = parseFloat(document.getElementById('totalAmountCompras').textContent) || 0;
  var totalAmountGastos = parseFloat(document.getElementById('totalAmountGastos').textContent) || 0;
  var totalAmountVales = parseFloat(document.getElementById('totalAmountVales').textContent) || 0;
  var amount8 = parseFloat(document.getElementById('amount8').textContent) || 0;
  var retiroEfectivoInput = parseFloat(document.querySelector('.RetiroEfectivo input').value) || 0;
  var tarjetaCreditoInput = parseFloat(document.querySelector('.TarjetaCredito input').value) || 0;

  var sumaTotal = totalAmount + totalAmountCompras + totalAmountGastos + totalAmountVales + amount8 + retiroEfectivoInput + tarjetaCreditoInput;
  sumaTotal = parseFloat(sumaTotal.toFixed(2));

  var totalFinalElement = document.querySelector('.SumaTotal .TotalFinal');

  if (!isNaN(sumaTotal)) {
    var formattedSumaTotal = numberWithCommas(sumaTotal);
    totalFinalElement.textContent = formattedSumaTotal;
  } else {
    totalFinalElement.textContent = '_____________';
  }
  return sumaTotal;
}

// Función para formatear el número con comas cada 1000
function numberWithCommas(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


// Guardar Informacion en variables globales concepto - cantidad

function obtenerComprasEfectivo() {
  const comprasEfectivoItems = document.querySelectorAll('li.ComprasEfectivo');

  comprasEfectivo = {}; // Reiniciar la variable global

  comprasEfectivoItems.forEach((item, index) => {
    const conceptoInputs = item.querySelectorAll('.input-container .input-concepto');
    const cantidadInputs = item.querySelectorAll('.input-container input:not(.input-concepto)');

    conceptoInputs.forEach((conceptoInput, i) => {
      const concepto = conceptoInput.value;
      const cantidad = cantidadInputs[i].value;

      // Verificar que los campos no estén vacíos antes de almacenar en el objeto
      if (concepto !== "" && cantidad !== "") {
        comprasEfectivo[concepto] = cantidad;
      }
    });
  });

  if (Object.keys(comprasEfectivo).length === 0) {
    comprasEfectivo = {EMPTY: 0};
  }

}


function obtenerGastosEfectivo() {
  const gastosEfectivoItems = document.querySelectorAll('li.GastosEfectivo');

  gastosEfectivo = {}; // Reiniciar la variable global

  gastosEfectivoItems.forEach((item, index) => {
    const conceptoInputs = item.querySelectorAll('.input-container .input-concepto');
    const cantidadInputs = item.querySelectorAll('.input-container input:not(.input-concepto)');

    conceptoInputs.forEach((conceptoInput, i) => {
      const concepto = conceptoInput.value;
      const cantidad = cantidadInputs[i].value;

      // Verificar que los campos no estén vacíos antes de almacenar en el objeto
      if (concepto !== "" && cantidad !== "") {
        gastosEfectivo[concepto] = cantidad;
      }
    });
  });

  if (Object.keys(gastosEfectivo).length === 0) {
    gastosEfectivo = {EMPTY: 0};
  }

}

function obtenerVales() {
  const valesItems = document.querySelectorAll('li.Vales');

  vales = {}; // Reiniciar la variable global

  valesItems.forEach((item, index) => {
    const conceptoInputs = item.querySelectorAll('.input-container .input-concepto');
    const cantidadInputs = item.querySelectorAll('.input-container input:not(.input-concepto)');

    conceptoInputs.forEach((conceptoInput, i) => {
      const concepto = conceptoInput.value;
      const cantidad = cantidadInputs[i].value;

      // Verificar que los campos no estén vacíos antes de almacenar en el objeto
      if (concepto !== "" && cantidad !== "") {
        vales[concepto] = cantidad;
      }
    });
  });

  if (Object.keys(vales).length === 0) {
    vales = {EMPTY: 0};
  }

}

function obtenerDevoluciones() {
  const devolucionesItems = document.querySelectorAll('li.Devoluciones');

  devoluciones = {}; // Reiniciar la variable global

  devolucionesItems.forEach((item, index) => {
    const conceptoInputs = item.querySelectorAll('.input-container .input-concepto');
    const cantidadInputs = item.querySelectorAll('.input-container input:not(.input-concepto)');

    conceptoInputs.forEach((conceptoInput, i) => {
      const concepto = conceptoInput.value;
      const cantidad = cantidadInputs[i].value;

      // Verificar que los campos no estén vacíos antes de almacenar en la variable global
      if (concepto !== "" && cantidad !== "") {
        devoluciones[concepto] = cantidad;
      }
    });
  });

  if (Object.keys(devoluciones).length === 0) {
    devoluciones = {EMPTY: 0};
  }

}

function calcularDiferencia() {
  var totalSistema = parseFloat(document.getElementsByName("fname38")[0].value); // Obtener el valor de totalSistema y convertirlo a número

  var totalFinal = document.querySelector(".TotalFinal").innerHTML;
  var totalSinComa = totalFinal.replace(",", "");
  var sumaTotal = parseFloat(totalSinComa); // Obtener la suma total del span correspondiente y convertirla a número

  var totalDevoluciones = parseFloat(document.getElementById("totalAmountDevoluciones").textContent); // Obtener el valor de totalAmountDevoluciones y convertirlo a número

  var diferenciaFinal = totalSistema - sumaTotal - totalDevoluciones; // Calcular la diferencia, considerando las devoluciones
  diferenciaFinal = parseFloat(diferenciaFinal.toFixed(2));

  // Actualizar el contenido del span correspondiente según la diferencia
  var sobranteSpan = document.querySelector(".SobrantePlace");
  var faltanteSpan = document.querySelector(".FaltantePlace");

  if (diferenciaFinal < 0) {
    sobranteSpan.textContent = diferenciaFinal * -1;
    faltanteSpan.textContent = "___________";
  } else if (diferenciaFinal > 0) {
    sobranteSpan.textContent = "___________";
    faltanteSpan.textContent = Math.abs(diferenciaFinal);
  } else {
    sobranteSpan.textContent = "___________";
    faltanteSpan.textContent = "0";
  }
  return diferenciaFinal
}

function actualizarTexto(select) {
  var texto = select.value;
  var contenedor = select.parentElement; // Obtener el contenedor padre del campo de entrada
  var spanTexto = contenedor.querySelector("span"); // Buscar el elemento span dentro del contenedor
  spanTexto.textContent = texto;
  if(spanTexto.id === 'textoRecibido') {
    recibido = texto;
  } else {
    cajero = texto;
  }
}

// Validaciones

function validarNumeroInput(event) {
  var input = event.target;
  var inputValue = input.value.trim();

  if (inputValue !== "" && isNaN(inputValue)) {
    alertDialog("Ingresa solo números en el campo");
    input.value = "";
  }
}
