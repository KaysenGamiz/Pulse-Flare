// URL de tu API
const API_URL = '/cortes/daily-accumulated'; // Asegúrate de que coincida con la ruta de tu servidor

// Referencia al canvas de Chart.js
const ctx = document.getElementById('barChartWeek').getContext('2d');

// Inicializa la gráfica con datos vacíos
let barChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [], // Se llenará dinámicamente con las fechas
        datasets: [
            {
                label: 'Total Ventas por Día',
                data: [], // Se llenará dinámicamente con los valores
                backgroundColor: 'rgba(255, 192, 203, 0.5)',
                borderColor: 'rgba(255, 192, 203, 1)',
                borderWidth: 1
            }
        ]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

// Función para obtener datos de la API
async function fetchAccumulatedData(date) {
    try {
        const response = await fetch(`${API_URL}?date=${date}`);
        if (!response.ok) {
            throw new Error('Error al obtener datos de la API');
        }

        const data = await response.json();

        // Procesa los datos para la gráfica
        const labels = data.map(item => item.dayName); // Usar nombres de los días
        const values = data.map(item => item.totalSistemaSum); // Suma totalSistema por día

        // Actualiza la gráfica con nuevos datos
        updateBarChart(labels, values);
    } catch (error) {
        console.error(error);
        alert('Ocurrió un error al cargar los datos.');
    }
}


// Función para actualizar la gráfica con nuevos datos
function updateBarChart(labels, data) {
    barChart.data.labels = labels; // Actualiza las etiquetas
    barChart.data.datasets[0].data = data; // Actualiza los valores
    barChart.update(); // Redibuja la gráfica
}

// Configurar el valor inicial del selector de fecha
const weekSelector = document.getElementById('weekSelector');
const now = new Date();
const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
weekSelector.value = firstDayOfMonth; // Establecer el valor inicial del input

// Llamar a la API con el mes actual
fetchAccumulatedData(firstDayOfMonth);

// Selector de mes: escuchar cambios y actualizar la gráfica
weekSelector.addEventListener('change', (e) => {
    const selectedDate = e.target.value; // Valor de la fecha seleccionada
    if (selectedDate) {
        fetchAccumulatedData(selectedDate); // Llama a la API con la fecha seleccionada
    }
});
