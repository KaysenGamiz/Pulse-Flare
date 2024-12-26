// Obtén el elemento canvas por su ID
var acumulados = document.getElementById('acumulados').getContext('2d');

// Opciones de la gráfica
var options = {
  scales: {
    y: {
      beginAtZero: true // Comenzar el eje y desde 0
    }
  }
};

// Realiza la solicitud GET a la ruta /cortes/date con los parámetros de fecha
fetch('/cortes/chart-data?date1=2023-08-01&date2=2023-08-31')
  .then(response => response.json())
  .then(chartData => {

    var data = {
        labels: chartData.labels,
        datasets: [{
          label: 'Acumulado Total Sistema',
          data: chartData.data,
          backgroundColor: 'rgba(0, 100, 0, 0.2)', // Color de fondo del área bajo la línea
          borderColor: 'rgba(0, 100, 0, 1)', // Color de la línea
          borderWidth: 2, // Ancho de la línea
          pointBackgroundColor: 'rgba(0, 100, 0, 1)', // Color de fondo de los puntos
          pointBorderColor: '#fff', // Color del borde de los puntos
          pointRadius: 4, // Radio de los puntos
          pointHoverRadius: 6 // Radio de los puntos al pasar el mouse
        },
        {
            label: 'Acumulado Matutino',
            data: chartData.matutino,
            backgroundColor: 'rgba(135, 206, 250, 0.2)', // Color de fondo del área bajo la línea
            borderColor: 'rgba(135, 206, 250, 1)', // Color de la línea
            borderWidth: 2, // Ancho de la línea
            pointBackgroundColor: 'rgba(135, 206, 250, 1)', // Color de fondo de los puntos
            pointBorderColor: '#fff', // Color del borde de los puntos
            pointRadius: 4, // Radio de los puntos
            pointHoverRadius: 6 // Radio de los puntos al pasar el mouse
        },
        {
            label: 'Acumulado Vespertino',
            data: chartData.vespertino,
            backgroundColor: 'rgba(0, 0, 139, 0.2)', // Color de fondo del área bajo la línea
            borderColor: 'rgba(0, 0, 139, 1)', // Color de la línea
            borderWidth: 2, // Ancho de la línea
            pointBackgroundColor: 'rgba(0, 0, 139, 1)', // Color de fondo de los puntos
            pointBorderColor: '#fff', // Color del borde de los puntos
            pointRadius: 4, // Radio de los puntos
            pointHoverRadius: 6 // Radio de los puntos al pasar el mouse
        },
        ]
    };

    // Crea la gráfica de líneas con los datos recibidos
    var myChart = new Chart(acumulados, {
      type: 'line',
      data: data,
      options: options
    });
  })
  .catch(error => {
    console.error(error);
    // Maneja el error de la solicitud
  });
