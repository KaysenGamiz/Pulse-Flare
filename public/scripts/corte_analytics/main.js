/**
 * Controlador Principal — Pulse-Flare
 * Un solo filtro de rango controla: cards, líneas, pastel y análisis GPT.
 * Una sola llamada (getRangeSummary) alimenta las 4 cards, el pastel y el análisis.
 */

import { API } from './api.js';
import { initLineChart, initPieChart, initBarChart, updateComparisonChart } from './charts.js';
import { getCurrentMonthRange, getDateFromWeek, getCurrentWeekString, formatCurrency } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {

    // ── Fechas iniciales ──────────────────────────────────────────────────
    const { start, end } = getCurrentMonthRange();
    let selectedWeeks = [];

    // ── Referencias al DOM ────────────────────────────────────────────────
    const lineStartInput    = document.getElementById('lineChartStartDate');
    const lineEndInput      = document.getElementById('lineChartEndDate');
    const weekInput         = document.getElementById('weekSelector');
    const weeksContainer    = document.getElementById('selectedWeeksContainer');
    const analysisContainer = document.getElementById('gpt-analysis');

    const btnLineFilter  = document.getElementById('btnLineFilter');
    const btnResetFilter = document.getElementById('btnResetFilter');
    const btnAddWeek     = document.getElementById('btnAddWeek');
    const btnResetWeeks  = document.getElementById('btnResetWeeks');

    // ── Valores iniciales de los inputs ───────────────────────────────────
    lineStartInput.value = start;
    lineEndInput.value   = end;
    weekInput.value      = getCurrentWeekString();

    // ── Funciones ─────────────────────────────────────────────────────────

    /**
     * Punto de entrada único para el filtro de rango.
     * getRangeSummary se llama UNA vez y alimenta: 4 cards + pastel + análisis GPT.
     * La gráfica de líneas corre en paralelo (datos distintos).
     */
    async function loadRangeData(start, end) {
        showCardsLoading();

        const [summary] = await Promise.all([
            API.getRangeSummary(start, end),
            initLineChart(start, end)
        ]);

        updateSummaryCards(summary, start, end);
        initPieChart(summary);
        loadAnalysis(summary, start, end);
    }

    function showCardsLoading() {
        document.getElementById('summaryTotalSistema').textContent  = '—';
        document.getElementById('summaryTotalEfectivo').textContent = '—';
        document.getElementById('summaryTarjeta').textContent       = '—';
        document.getElementById('summaryTicketPromedio').textContent = '—';
        document.getElementById('summaryLoading').classList.remove('d-none');
    }

    function updateSummaryCards(summary, start, end) {
        document.getElementById('summaryTotalSistema').textContent   = formatCurrency(summary.totalSistema);
        document.getElementById('summaryTotalEfectivo').textContent  = formatCurrency(summary.totalEfectivo);
        document.getElementById('summaryTarjeta').textContent        = formatCurrency(summary.tarjeta);
        document.getElementById('summaryTicketPromedio').textContent = formatCurrency(summary.ticketPromedio);
        document.getElementById('summaryRange').textContent          = `${start} · ${end}`;
        document.getElementById('summaryLoading').classList.add('d-none');
    }

    function loadAnalysis(summary, start, end) {
        analysisContainer.innerHTML = '<div class="spinner-border text-primary" role="status"></div> Analizando datos...';
        API.postForAnalysis({
            Dolares:   summary.dolaresEfectivo,
            Efectivo:  summary.totalEfectivo,
            Tarjeta:   summary.tarjeta,
            DateStart: start,
            DateEnd:   end
        })
        .then(result => {
            analysisContainer.innerHTML = result.analysis;
        })
        .catch(() => {
            analysisContainer.innerHTML = '<span class="text-danger">Error al cargar el análisis.</span>';
        });
    }

    function renderWeekBadges() {
        weeksContainer.innerHTML = selectedWeeks
            .map(w => `<span class="badge bg-dark me-2 p-2">${w}</span>`)
            .join('');
    }

    // ── Eventos ───────────────────────────────────────────────────────────

    btnLineFilter.addEventListener('click', () => {
        const s = lineStartInput.value;
        const e = lineEndInput.value;
        if (!s || !e) return alert('Por favor selecciona ambas fechas.');
        loadRangeData(s, e);
    });

    btnResetFilter.addEventListener('click', () => {
        lineStartInput.value = start;
        lineEndInput.value   = end;
        loadRangeData(start, end);
    });

    btnAddWeek.addEventListener('click', () => {
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
    loadRangeData(start, end);
    initBarChart(getDateFromWeek(weekInput.value));
});