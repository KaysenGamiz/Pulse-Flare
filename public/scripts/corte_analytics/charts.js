/**
 * Módulo de gráficas para Pulse-Flare
 * Gestiona: Líneas (Acumulados), Pastel (Distribución), Barras (Semana)
 */

import { API } from './api.js';
import { CHART_COLORS, globalOptions } from './chartsConfig.js';
import { formatCurrency } from './utils.js';
import { getDateFromWeek } from './utils.js';

// --- INSTANCIAS Y ESTADO GLOBAL ---
let lineChart, pieChart, barChart;
let lineChartData = null; // Guarda la última respuesta del backend para cambiar métrica sin refetch

// Mapa de métricas disponibles para la gráfica de líneas
export const LINE_METRICS = {
    sistema: {
        label:      'Total Sistema',
        icon:       'fa-chart-line',
        iconClass:  'text-dark',
        total:      'sistema',
        matutino:   'sistemaMatutino',
        vespertino: 'sistemaVespertino',
    },
    efectivo: {
        label:      'Total Efectivo',
        icon:       'fa-money-bill-wave',
        iconClass:  'text-primary',
        total:      'efectivo',
        matutino:   'efectivoMatutino',
        vespertino: 'efectivoVespertino',
    },
    tarjeta: {
        label:      'Tarjeta',
        icon:       'fa-credit-card',
        iconClass:  'text-warning',
        total:      'tarjeta',
        matutino:   'tarjetaMatutino',
        vespertino: 'tarjetaVespertino',
    },
    dolaresMXN: {
        label:      'Dólares (MXN)',
        icon:       'fa-dollar-sign',
        iconClass:  'text-success',
        total:      'dolaresMXN',
        matutino:   'dolaresMXNMatutino',
        vespertino: 'dolaresMXNVespertino',
    },
    dolaresUSD: {
        label:      'Dólares (USD)',
        icon:       'fa-dollar-sign',
        iconClass:  'text-success',
        total:      'dolaresUSD',
        matutino:   'dolaresUSDMatutino',
        vespertino: 'dolaresUSDVespertino',
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. GRÁFICA DE LÍNEAS — Acumulados por rango
//    metric: clave de LINE_METRICS ('sistema' | 'efectivo' | 'tarjeta')
// ─────────────────────────────────────────────────────────────────────────────
export async function initLineChart(start, end, metric = 'sistema') {
    lineChartData = await API.getLineData(start, end);
    _renderLineChart(metric);
}

/**
 * Cambia la métrica mostrada sin volver a llamar al backend.
 */
export function switchLineMetric(metric) {
    if (!lineChartData) return;
    _renderLineChart(metric);
}

function _renderLineChart(metric) {
    const ctx  = document.getElementById('acumulados').getContext('2d');
    const keys = LINE_METRICS[metric];
    const data = lineChartData;

    const config = {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label:           keys.label,
                    data:            data[keys.total],
                    borderColor:     CHART_COLORS.total.border,
                    backgroundColor: CHART_COLORS.total.bg,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3,
                    spanGaps: false, // null = sin dato ese día, no conectar puntos
                },
                {
                    label:           'Matutino',
                    data:            data[keys.matutino] || [],
                    borderColor:     CHART_COLORS.matutino.border,
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0.3,
                    spanGaps: false,
                },
                {
                    label:           'Vespertino',
                    data:            data[keys.vespertino] || [],
                    borderColor:     CHART_COLORS.vespertino.border,
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    tension: 0.3,
                    spanGaps: false,
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

// ──────────────────────────────────────────────────────────────────────────────
// 2. GRÁFICA DE PASTEL — Distribución acumulada del rango
//    Recibe el objeto summary directamente (no hace fetch propio).
// ──────────────────────────────────────────────────────────────────────────────
export function initPieChart(summary) {
    const ctx = document.getElementById('pastel').getContext('2d');

    const config = {
        type: 'doughnut',
        data: {
            labels: ['Dólares', 'Efectivo', 'Tarjeta'],
            datasets: [{
                data: [summary.dolaresEfectivo, summary.totalEfectivo, summary.tarjeta],
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
}

// ─────────────────────────────────────────────
// 3. GRÁFICA DE BARRAS — Ventas de una semana
// ─────────────────────────────────────────────
export async function initBarChart(date) {
    const data = await API.getBarData(date);
    const ctx  = document.getElementById('barChartWeek').getContext('2d');

    const config = {
        type: 'bar',
        data: {
            labels: data.map(item => item.dayName),
            datasets: [{
                label:           'Ventas Diarias',
                data:            data.map(item => item.totalSistemaSum),
                backgroundColor: CHART_COLORS.semana.bg,
                borderColor:     CHART_COLORS.semana.border,
                borderWidth: 1,
                borderRadius: 5
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

// ─────────────────────────────────────────────
// 4. GRÁFICA COMPARATIVA — Múltiples semanas
// ─────────────────────────────────────────────
export async function updateComparisonChart(weeksToCompare) {
    const ctx    = document.getElementById('barChartWeek').getContext('2d');
    const COLORS = ['#3498db', '#e67e22', '#2ecc71', '#9b59b6'];

    const allWeeksData = await Promise.all(
        weeksToCompare.map(week => API.getBarData(getDateFromWeek(week)))
    );

    const datasets = allWeeksData.map((data, index) => ({
        label:           `Semana ${weeksToCompare[index]}`,
        data:            data.map(d => d.totalSistemaSum),
        borderColor:     COLORS[index],
        backgroundColor: 'transparent',
        borderWidth: 3,
        tension: 0.3
    }));

    if (barChart) barChart.destroy();

    barChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
            datasets
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