var dateInput = document.getElementById('dateInput');
var dateBtn = document.getElementById('sendDate');

dateBtn.addEventListener('click', () => {
    var selectedDate = dateInput.value;
    graficaPastel(selectedDate);
    enviarDatosParaAnalisis(selectedDate);
});

function enviarDatosParaAnalisis(date) {
    fetch(`/cortes/accumulated-data?date=${date}`)
    .then(response => response.json())
    .then(pastelData => {
        var data = {
            "Dolares": pastelData.dolaresEfectivo,
            "Efectivo": pastelData.totalEfectivo,
            "Tarjeta": pastelData.tarjeta,
            "Date": date
        };

        return fetch('/analisis', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('gpt-analysis').innerHTML = data.analysis;
    })
    .catch(error => {
        console.error('Error al enviar datos para análisis:', error);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('dateInput');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const formattedDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
    dateInput.value = formattedDate;
    graficaPastel(dateInput.value);
});
