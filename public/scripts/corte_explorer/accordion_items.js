function createTable(data) {
    const table = document.createElement('table');
    table.classList.add('table');

    const thead = document.createElement('thead');
    const trHeader = document.createElement('tr');

    const thEfectivo = document.createElement('th');
    thEfectivo.textContent = 'Efectivo';

    const thDolares = document.createElement('th');
    thDolares.textContent = 'Dolares';

    const thTarjeta = document.createElement('th');
    thTarjeta.textContent = 'Tarjeta';

    const thRetiro = document.createElement('th');
    thRetiro.textContent = 'Retiro en Efectivo';

    trHeader.appendChild(thEfectivo);
    trHeader.appendChild(thDolares);
    trHeader.appendChild(thTarjeta);
    trHeader.appendChild(thRetiro);

    thead.appendChild(trHeader);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    const trData = document.createElement('tr');

    const tdEfectivo = document.createElement('td');
    // Populate Efectivo data using data.efectivo property
    tdEfectivo.innerHTML = `
        <div id="efectivo_500">500: <span id="valor_500">${data.efectivo['500']}</span></div>
        <div id="efectivo_200">200: <span id="valor_200">${data.efectivo['200']}</span></div>
        <div id="efectivo_100">100: <span id="valor_100">${data.efectivo['100']}</span></div>
        <div id="efectivo_50">50: <span id="valor_50">${data.efectivo['50']}</span></div>
        <div id="efectivo_20">20: <span id="valor_20">${data.efectivo['20']}</span></div>
        <div id="efectivo_10">10: <span id="valor_10">${data.efectivo['10']}</span></div>
        <div id="monedas">Monedas: <span id="valor_monedas">${data.efectivo['monedas']}</span></div>
        <div id="efectivo_total"><b>Total Efectivo</b>: $<span id="valor_total_efectivo">${data.totalEfectivo}</span></div>
    `;

    const tdDolares = document.createElement('td');
    // Populate Dolares data using data.dolares property
    tdDolares.innerHTML = `
        <div id="TC">TC: <span id="valor_tc">${data.dolares.TC}</span></div>
        <div id="efectivo_dolares">Efectivo: <span id="valor_efectivo_dolares">${data.dolares.efectivo}</span></div>
    `;

    const tdTarjeta = document.createElement('td');
    // Populate Tarjeta data using data.tarjeta property
    tdTarjeta.textContent = `$${data.tarjeta}`;

    const tdRetiro = document.createElement('td');
    // Populate Retiro data using data.retiroEnEfectivo property
    tdRetiro.textContent = `$${data.retiroEnEfectivo}`;

    trData.appendChild(tdEfectivo);
    trData.appendChild(tdDolares);
    trData.appendChild(tdTarjeta);
    trData.appendChild(tdRetiro);

    tbody.appendChild(trData);
    table.appendChild(tbody);

    return table;
}

function createTableConceptos(data) {
    const table = document.createElement('table');
    table.classList.add('table');

    const thead = document.createElement('thead');
    const trHeader = document.createElement('tr');

    const thCompras = document.createElement('th');
    thCompras.textContent = 'Compras';

    const thGastos = document.createElement('th');
    thGastos.textContent = 'Gastos';

    const thVales = document.createElement('th');
    thVales.textContent = 'Vales';

    const thDevoluciones = document.createElement('th');
    thDevoluciones.textContent = 'Devoluciones';

    trHeader.appendChild(thCompras);
    trHeader.appendChild(thGastos);
    trHeader.appendChild(thVales);
    trHeader.appendChild(thDevoluciones);

    thead.appendChild(trHeader);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    const trData = document.createElement('tr');

    const tdCompras = document.createElement('td');
    // Populate Compras data using data.comprasEfectivo property
    for (const concepto in data.comprasEfectivo) {
        const divCompra = document.createElement('div');
        divCompra.id = `compra_${concepto}`;
        divCompra.innerHTML = `<span id="concepto_compra_${concepto}">${concepto}</span> - $<span id="valor_compra_${concepto}">${data.comprasEfectivo[concepto]}</span>`;
        tdCompras.appendChild(divCompra);
    }

    const tdGastos = document.createElement('td');
    // Populate Gastos data using data.gastosEfectivo property
    for (const concepto in data.gastosEfectivo) {
        const divGasto = document.createElement('div');
        divGasto.id = `gasto_${concepto}`;
        divGasto.innerHTML = `<span id="concepto_gasto_${concepto}">${concepto}</span> - $<span id="valor_gasto_${concepto}">${data.gastosEfectivo[concepto]}</span>`;
        tdGastos.appendChild(divGasto);
    }

    const tdVales = document.createElement('td');
    // Populate Vales data using data.vales property
    for (const concepto in data.vales) {
        const divVale = document.createElement('div');
        divVale.id = `vale_${concepto}`;
        divVale.innerHTML = `<span id="concepto_vale_${concepto}">${concepto}</span> - $<span id="valor_vale_${concepto}">${data.vales[concepto]}</span>`;
        tdVales.appendChild(divVale);
    }

    const tdDevoluciones = document.createElement('td');
    // Populate Devoluciones data using data.devoluciones property
    for (const concepto in data.devoluciones) {
        const divDevolucion = document.createElement('div');
        divDevolucion.id = `devolucion_${concepto}`;
        divDevolucion.innerHTML = `<span id="concepto_devolucion_${concepto}">${concepto}</span> - $<span id="valor_devolucion_${concepto}">${data.devoluciones[concepto]}</span>`;
        tdDevoluciones.appendChild(divDevolucion);
    }

    trData.appendChild(tdCompras);
    trData.appendChild(tdGastos);
    trData.appendChild(tdVales);
    trData.appendChild(tdDevoluciones);

    tbody.appendChild(trData);
    table.appendChild(tbody);

    return table;
}

function createTableTotales(data) {
    const table = document.createElement('table');
    table.classList.add('table');

    const thead = document.createElement('thead');
    const trHeader = document.createElement('tr');

    const thTotalCorte = document.createElement('th');
    thTotalCorte.textContent = 'Total Corte';

    const thTotalSistema = document.createElement('th');
    thTotalSistema.textContent = 'Total Sistema';

    const thDiferencia = document.createElement('th');
    thDiferencia.textContent = 'Diferencia';

    const thCajero = document.createElement('th');
    thCajero.textContent = 'Cajero';

    trHeader.appendChild(thTotalCorte);
    trHeader.appendChild(thTotalSistema);
    trHeader.appendChild(thDiferencia);
    trHeader.appendChild(thCajero);

    thead.appendChild(trHeader);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    const trData = document.createElement('tr');

    const tdTotalCorte = document.createElement('td');
    tdTotalCorte.innerHTML = `$<span id="valor_total_corte">${data.totalCorte}</span>`;

    const tdTotalSistema = document.createElement('td');
    tdTotalSistema.innerHTML = `$<span id="valor_total_sistema">${data.totalSistema}</span>`;

    const tdDiferencia = document.createElement('td');
    tdDiferencia.innerHTML = `$<span id="valor_total_diferencia">${data.diferencia}</span>`;

    const tdCajero = document.createElement('td');
    tdCajero.textContent = data.cajero;

    trData.appendChild(tdTotalCorte);
    trData.appendChild(tdTotalSistema);
    trData.appendChild(tdDiferencia);
    trData.appendChild(tdCajero);

    tbody.appendChild(trData);
    table.appendChild(tbody);

    return table;
}


function createAccordionItem(data) {
    const accordionItem = document.createElement('div');
    accordionItem.classList.add('accordion-item');

    const header = document.createElement('h2');
    header.classList.add('accordion-header');
    header.id = `heading_${data.RCC}`;

    const button = document.createElement('button');
    button.classList.add('accordion-button', 'collapsed');
    button.type = 'button';
    button.setAttribute('data-bs-toggle', 'collapse');
    button.setAttribute('data-bs-target', `#collapse_${data.RCC}`);
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', `collapse_${data.RCC}`);

    const rccSpan = document.createElement('span');
    rccSpan.id = 'RCC';
    rccSpan.textContent = data.RCC;

    const turnoSpan = document.createElement('span');
    turnoSpan.id = 'Turno';
    turnoSpan.innerHTML = `Turno: <span id="tipo_turno">${turno_check(data.hora)}</span>`;

    const fechaSpan = document.createElement('span');
    fechaSpan.id = 'Fecha';
    fechaSpan.innerHTML = `Fecha: <span id="valor_fecha">${data.fecha}</span>`;

    const horaSpan = document.createElement('span');
    horaSpan.id = 'Hora';
    horaSpan.innerHTML = `Hora: <span id="valor_hora">${data.hora}</span>`;

    button.appendChild(rccSpan);
    button.appendChild(turnoSpan);
    button.appendChild(fechaSpan);
    button.appendChild(horaSpan);
    header.appendChild(button);
    accordionItem.appendChild(header);

    const collapseDiv = document.createElement('div');
    collapseDiv.id = `collapse_${data.RCC}`;
    collapseDiv.classList.add('accordion-collapse', 'collapse');
    collapseDiv.setAttribute('aria-labelledby', `heading_${data.RCC}`);

    const bodyDiv = document.createElement('div');
    bodyDiv.classList.add('accordion-body');

    // Create the table structure and populate the rest of the content as needed
    // ...

    const table = createTable(data);
    const tableConceptos = createTableConceptos(data);
    const tableTotales = createTableTotales(data);

    bodyDiv.appendChild(table);
    bodyDiv.appendChild(tableConceptos);
    bodyDiv.appendChild(tableTotales);

    collapseDiv.appendChild(bodyDiv);
    accordionItem.appendChild(collapseDiv);

    return accordionItem;
}

function insertAccordionItemIntoContainer(accordionItem) {
    const accordionContainer = document.getElementById('accordionCortes');
    accordionContainer.appendChild(accordionItem);
}
