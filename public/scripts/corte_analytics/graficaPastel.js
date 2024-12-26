var pastel = document.getElementById('pastel').getContext('2d');
var pastelChart;

var options = {
    responsive: true,
    plugins: {
        legend: {
            labels: {
                font: {
                    size: 16 // Ajusta el tamaño de fuente de las etiquetas (labels) en el gráfico
                }
            }
        },
        tooltip: {
            titleFont: {
                size: 16 // Ajusta el tamaño de fuente del tooltip cuando se muestra el acumulado
            },
            bodyFont: {
                size: 16 // Ajusta el tamaño de fuente del texto dentro del tooltip
            }
        }
    }
};

function graficaPastel(date){

    fetch(`/cortes/accumulated-data?date=${date}`)
    .then(response => response.json())
    .then(pastelData => {
        var data = {
            labels: ['Dolares', 'Efectivo', 'Tarjeta'],
            datasets: [{
                data: [pastelData.dolaresEfectivo, pastelData.totalEfectivo, pastelData.tarjeta],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
            }]
        };

        if (pastelChart) {
            pastelChart.destroy();
        }

        console.log(`Datos:\nDolares: ${pastelData.dolaresEfectivo}\nEfectivo: ${pastelData.totalEfectivo}\nTarjeta: ${pastelData.tarjeta}\nDate: ${date}`)

        pastelChart = new Chart(pastel, {
            type: 'doughnut',
            data: data,
            options: options
        });
    })
    .catch(error => {
        console.error(error);
        // Maneja el error de la solicitud
    });

}

