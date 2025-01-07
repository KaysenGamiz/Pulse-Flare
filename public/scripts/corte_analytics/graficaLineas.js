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

// Inicializa la gráfica con datos vacíos
var myChart = new Chart(acumulados, {
  type: 'line',
  data: {
    labels: [],
    datasets: []
  },
  options: options
});

// Función para actualizar la gráfica
function updateChart(startDate, endDate) {
  fetch(`/cortes/chart-data?date1=${startDate}&date2=${endDate}`)
    .then(response => response.json())
    .then(chartData => {
      // Actualiza los datos de la gráfica existente
      myChart.data.labels = chartData.labels;
      myChart.data.datasets = [
        {
          label: 'Acumulado Total Sistema',
          data: chartData.data,
          backgroundColor: 'rgba(0, 100, 0, 0.2)',
          borderColor: 'rgba(0, 100, 0, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(0, 100, 0, 1)',
          pointBorderColor: '#fff',
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: 'Acumulado Matutino',
          data: chartData.matutino,
          backgroundColor: 'rgba(135, 206, 250, 0.2)',
          borderColor: 'rgba(135, 206, 250, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(135, 206, 250, 1)',
          pointBorderColor: '#fff',
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: 'Acumulado Vespertino',
          data: chartData.vespertino,
          backgroundColor: 'rgba(0, 0, 139, 0.2)',
          borderColor: 'rgba(0, 0, 139, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(0, 0, 139, 1)',
          pointBorderColor: '#fff',
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ];

      // Actualiza la gráfica
      myChart.update();
    })
    .catch(error => {
      console.error(error);
      // Maneja el error de la solicitud
    });
}

// Al cargar la página, carga los datos del mes actual
const current_date = new Date();
const startOfMonth = new Date(current_date.getFullYear(), current_date.getMonth(), 1);
const formattedStartOfMonth = formatDate(startOfMonth);
const endOfMonth = new Date(current_date.getFullYear(), current_date.getMonth() + 1, 0);
const formattedEndOfMonth = formatDate(endOfMonth);

// Cargar datos iniciales
updateChart(formattedStartOfMonth, formattedEndOfMonth);

// Agregar evento al botón "Aplicar Filtros"
document.querySelector('.btn-primary').addEventListener('click', function () {
  const startDate = document.getElementById('lineChartStartDate').value;
  const endDate = document.getElementById('lineChartEndDate').value;

  if (!startDate || !endDate) {
    alert('Por favor, selecciona ambas fechas.');
    return;
  }

  // Actualiza la gráfica con los filtros seleccionados
  updateChart(startDate, endDate);
});
