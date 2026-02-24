/**
 * Controlador Principal — Pulse-Flare
 * Orquesta la inicialización de gráficas y los eventos del usuario.
 */

import { API } from './api.js';
import { initLineChart, initPieChart, initBarChart, updateComparisonChart } from './charts.js';
import { getCurrentMonthRange, getDateFromWeek, getCurrentWeekString } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {

    // ── Fechas iniciales ──────────────────────────────────────────────────
    const { start, end, currentMonth } = getCurrentMonthRange();
    let selectedWeeks = [];

    // ── Referencias al DOM ────────────────────────────────────────────────
    const lineStartInput   = document.getElementById('lineChartStartDate');
    const lineEndInput     = document.getElementById('lineChartEndDate');
    const pieMonthInput    = document.getElementById('dateInput');
    const weekInput        = document.getElementById('weekSelector');
    const weeksContainer   = document.getElementById('selectedWeeksContainer');
    const analysisContainer = document.getElementById('gpt-analysis');

    const btnLineFilter = document.getElementById('btnLineFilter');
    const btnPieFilter  = document.getElementById('sendDate');
    const btnAddWeek    = document.getElementById('btnAddWeek');
    const btnResetWeeks = document.getElementById('btnResetWeeks');

    // ── Valores iniciales de los inputs ───────────────────────────────────
    lineStartInput.value = start;
    lineEndInput.value   = end;
    pieMonthInput.value  = currentMonth;
    weekInput.value      = getCurrentWeekString();

    // ── Funciones ─────────────────────────────────────────────────────────

    async function loadAnalysis(date) {
        analysisContainer.innerHTML = '<div class="spinner-border text-primary" role="status"></div> Analizando datos...';
        try {
            const pastelData = await API.getPastelData(date);
            const result = await API.postForAnalysis({
                Dolares:  pastelData.dolaresEfectivo,
                Efectivo: pastelData.totalEfectivo,
                Tarjeta:  pastelData.tarjeta,
                Date:     date
            });
            analysisContainer.innerHTML = result.analysis;
        } catch {
            analysisContainer.innerHTML = '<span class="text-danger">Error al cargar el análisis.</span>';
        }
    }

    function renderWeekBadges() {
        weeksContainer.innerHTML = selectedWeeks
            .map(w => `<span class="badge bg-dark me-2 p-2">${w}</span>`)
            .join('');
    }

    // ── Eventos ───────────────────────────────────────────────────────────

    btnLineFilter.addEventListener('click', () => {
        initLineChart(lineStartInput.value, lineEndInput.value);
    });

    btnPieFilter.addEventListener('click', () => {
        const date = pieMonthInput.value;
        initPieChart(date);
        loadAnalysis(date);
    });

    btnAddWeek.addEventListener('click', async () => {
        const week = weekInput.value;
        if (!week || selectedWeeks.includes(week)) return;
        if (selectedWeeks.length >= 4) return alert('Máximo 4 semanas para comparar');

        selectedWeeks.push(week);
        renderWeekBadges();
        updateComparisonChart(selectedWeeks);
    });

    btnResetWeeks.addEventListener('click', () => {
        selectedWeeks = [];
        weeksContainer.innerHTML = '';
        initBarChart(getDateFromWeek(weekInput.value));
    });

    // ── Carga inicial ─────────────────────────────────────────────────────
    initLineChart(start, end);
    initPieChart(currentMonth);
    initBarChart(getDateFromWeek(weekInput.value));
    loadAnalysis(currentMonth);
});