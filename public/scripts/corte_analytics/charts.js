import { API } from './api.js';
import { CHART_COLORS, globalOptions } from './chartsConfig.js';
import { formatCurrency } from './utils.js';
import { getDateFromWeek, getCurrentWeekString } from './utils.js';

// --- REFERENCIAS GLOBALES ---
let lineChart, pieChart, barChart;
let selectedWeeks = []; // Guardará strings tipo "2023-W42"

/**
 * 1. GRÁFICA DE LÍNEAS (Acumulados)
 */
export async function initLineChart(start, end) {
    const data = await API.getLineData(start, end);
    const ctx = document.getElementById('acumulados').getContext('2d');

    const config = {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Total Sistema',
                    data: data.data,
                    borderColor: CHART_COLORS.total.border,
                    backgroundColor: CHART_COLORS.total.bg,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Matutino',
                    data: data.matutino,
                    borderColor: CHART_COLORS.matutino.border,
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderDash: [5, 5], // Línea punteada para diferenciar
                    tension: 0.3
                },
                {
                    label: 'Vespertino',
                    data: data.vespertino,
                    borderColor: CHART_COLORS.vespertino.border,
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    tension: 0.3
                }
            ]
        },
        options: {
            ...globalOptions,
            scales: {
                y: { 
                    beginAtZero: true,
                    ticks: { callback: (value) => formatCurrency(value) }
                }
            }
        }
    };

    if (lineChart) lineChart.destroy();
    lineChart = new Chart(ctx, config);
}

/**
 * 2. GRÁFICA DE PASTEL (Distribución)
 */
export async function initPieChart(date) {
    const data = await API.getPastelData(date);
    const ctx = document.getElementById('pastel').getContext('2d');

    const config = {
        type: 'doughnut',
        data: {
            labels: ['Dólares', 'Efectivo', 'Tarjeta'],
            datasets: [{
                data: [data.dolaresEfectivo, data.totalEfectivo, data.tarjeta],
                backgroundColor: [
                    CHART_COLORS.dolares.bg,
                    CHART_COLORS.efectivo.bg,
                    CHART_COLORS.tarjeta.bg
                ],
                hoverOffset: 15,
                borderWidth: 0
            }]
        },
        options: {
            ...globalOptions,
            cutout: '70%',
            plugins: {
                ...globalOptions.plugins,
                tooltip: {
                    callbacks: {
                        label: (item) => `${item.label}: ${formatCurrency(item.raw)}`
                    }
                }
            }
        }
    };

    if (pieChart) pieChart.destroy();
    pieChart = new Chart(ctx, config);
    
    // Devolvemos los datos para que el controlador pueda enviarlos a GPT
    return data;
}

/**
 * 3. GRÁFICA DE BARRAS (Venta por día)
 */
export async function initBarChart(date) {
    const data = await API.getBarData(date);
    const ctx = document.getElementById('barChartWeek').getContext('2d');

    const config = {
        type: 'bar',
        data: {
            labels: data.map(item => item.dayName),
            datasets: [{
                label: 'Ventas Diarias',
                data: data.map(item => item.totalSistemaSum),
                backgroundColor: CHART_COLORS.semana.bg,
                borderColor: CHART_COLORS.semana.border,
                borderWidth: 1,
                borderRadius: 5 // Barras redondeadas modernas
            }]
        },
        options: {
            ...globalOptions,
            scales: {
                y: { ticks: { callback: (value) => formatCurrency(value) } }
            }
        }
    };

    if (barChart) barChart.destroy();
    barChart = new Chart(ctx, config);
}

export async function updateComparisonChart(weeksToCompare) { // <--- Agregamos el parámetro
    const ctx = document.getElementById('barChartWeek').getContext('2d');
    
    // Cambia selectedWeeks por weeksToCompare en toda la función
    const promises = weeksToCompare.map(week => {
        const monday = getDateFromWeek(week);
        return API.getBarData(monday);
    });

    const allWeeksData = await Promise.all(promises);

    const datasets = allWeeksData.map((data, index) => {
        const weekLabel = weeksToCompare[index]; // <--- Usar parámetro
        const colors = ['#3498db', '#e67e22', '#2ecc71', '#9b59b6'];
        
        return {
            label: `Semana ${weekLabel}`,
            data: data.map(d => d.totalSistemaSum),
            borderColor: colors[index],
            backgroundColor: 'transparent',
            borderWidth: 3,
            tension: 0.3
        };
    });

    if (barChart) barChart.destroy();
    
    barChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
            datasets: datasets
        },
        options: {
            ...globalOptions,
            maintainAspectRatio: false,
            scales: {
                y: { ticks: { callback: (value) => formatCurrency(value) } }
            }
        }
    });
}

