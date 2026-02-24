/**
 * Módulo de gráficas para Pulse-Flare
 * Gestiona: Líneas (Acumulados), Pastel (Distribución), Barras (Semana)
 */

import { API } from './api.js';
import { CHART_COLORS, globalOptions } from './chartsConfig.js';
import { formatCurrency } from './utils.js';
import { getDateFromWeek } from './utils.js';

// --- INSTANCIAS GLOBALES ---
let lineChart, pieChart, barChart;

// ─────────────────────────────────────────────
// 1. GRÁFICA DE LÍNEAS — Acumulados por rango
// ─────────────────────────────────────────────
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
                    borderDash: [5, 5],
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

// ──────────────────────────────────────────────────────────────────────────────
// 2. GRÁFICA DE PASTEL — Distribución acumulada del rango
//    Recibe el objeto `summary` directamente desde main.js (ya no hace fetch).
//    Esto evita una llamada extra a la API — los datos vienen de getRangeSummary.
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
    const ctx = document.getElementById('barChartWeek').getContext('2d');
    const COLORS = ['#3498db', '#e67e22', '#2ecc71', '#9b59b6'];

    const allWeeksData = await Promise.all(
        weeksToCompare.map(week => API.getBarData(getDateFromWeek(week)))
    );

    const datasets = allWeeksData.map((data, index) => ({
        label: `Semana ${weeksToCompare[index]}`,
        data: data.map(d => d.totalSistemaSum),
        borderColor: COLORS[index],
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