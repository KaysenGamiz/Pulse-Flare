function get_corte_by_RCC(rcc){
    console.log("print desde funcion:", rcc)

    fetch(`/cortes/rcc/${rcc}`)
    .then(res => res.json())
    .then(data => {
        var item = createAccordionItem(data);
        insertAccordionItemIntoContainer(item);
    })
    .catch(error => {
        console.error('Error:', error);
    })

}

function get_cortes_between_RCCs(rcc1, rcc2){
    console.log("print desde funcion:", rcc1, rcc2)

    fetch(`/cortes/rcc?rcc1=${rcc1}&rcc2=${rcc2}`)
    .then(res => res.json())
    .then(data => {
        console.log('Datos recibidos:', data);
        if (Array.isArray(data)) {
            // Si data es un arreglo, iterar sobre cada objeto en el arreglo
            data.forEach(item => {
                var accordionItem = createAccordionItem(item);
                insertAccordionItemIntoContainer(accordionItem);
            });
        } else {
            // Si data no es un arreglo, procesar solo una vez
            var accordionItem = createAccordionItem(data);
            insertAccordionItemIntoContainer(accordionItem);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    })
}

function get_corte_by_date(date){
    console.log("print desde funcion:", date)

    fetch(`/cortes/date/${date}`)
    .then(res => res.json())
    .then(data => {
        console.log('Datos recibidos:', data);
        if (Array.isArray(data)) {
            // Si data es un arreglo, iterar sobre cada objeto en el arreglo
            data.forEach(item => {
                var accordionItem = createAccordionItem(item);
                insertAccordionItemIntoContainer(accordionItem);
            });
        } else {
            // Si data no es un arreglo, procesar solo una vez
            var accordionItem = createAccordionItem(data);
            insertAccordionItemIntoContainer(accordionItem);
        }
        
    })
    .catch(error => {
        console.error('Error:', error);
    })

}

function get_cortes_between_dates(date1, date2){
    console.log("print desde funcion:", date1, date2)

    fetch(`/cortes/date?date1=${date1}&date2=${date2}`)
    .then(res => res.json())
    .then(data => {
        console.log('Datos recibidos:', data);
        if (Array.isArray(data)) {
            // Si data es un arreglo, iterar sobre cada objeto en el arreglo
            data.forEach(item => {
                var accordionItem = createAccordionItem(item);
                insertAccordionItemIntoContainer(accordionItem);
            });
        } else {
            // Si data no es un arreglo, procesar solo una vez
            var accordionItem = createAccordionItem(data);
            insertAccordionItemIntoContainer(accordionItem);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    })

}
