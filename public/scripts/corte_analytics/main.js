/**
 * Controlador Principal — Pulse-Flare
 * - Un solo filtro de rango controla: cards, líneas, pastel y análisis GPT.
 * - Clicar una summary card filtra la gráfica de líneas (igual que el dropdown).
 * - El dropdown y las cards se sincronizan entre sí.
 */

import { API } from './api.js';
import { initLineChart, initPieChart, initBarChart, updateComparisonChart, switchLineMetric, LINE_METRICS } from './charts.js';
import { getCurrentMonthRange, getDateFromWeek, getCurrentWeekString, formatCurrency } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {

    // ── Fechas y estado ───────────────────────────────────────────────────
    const { start, end } = getCurrentMonthRange();
    let selectedWeeks = [];
    let currentMetric = 'sistema';

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

    const metricDropdownLabel = document.getElementById('metricDropdownLabel');
    const metricDropdownIcon  = document.getElementById('metricDropdownIcon');
    const metricOptions       = document.querySelectorAll('.metric-option');
    const clickableCards      = document.querySelectorAll('.summary-card--clickable');

    // ── Valores iniciales ─────────────────────────────────────────────────
    lineStartInput.value = start;
    lineEndInput.value   = end;
    weekInput.value      = getCurrentWeekString();

    // ── Funciones ─────────────────────────────────────────────────────────

    async function loadRangeData(start, end) {
        showCardsLoading();
        const [summary] = await Promise.all([
            API.getRangeSummary(start, end),
            initLineChart(start, end, currentMetric)
        ]);
        updateSummaryCards(summary, start, end);
        initPieChart(summary);
        loadAnalysis(summary, start, end);
    }

    function showCardsLoading() {
        ['summaryTotalSistema', 'summaryTotalEfectivo', 'summaryTarjeta', 'summaryTicketPromedio']
            .forEach(id => document.getElementById(id).textContent = '—');
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
        .then(result  => { analysisContainer.innerHTML = result.analysis; })
        .catch(() => { analysisContainer.innerHTML = '<span class="text-danger">Error al cargar el análisis.</span>'; });
    }

    /**
     * Cambia la métrica activa — actualiza gráfica, dropdown y cards.
     * Punto único de cambio: tanto el dropdown como las cards lo llaman.
     */
    function setActiveMetric(metric) {
        currentMetric = metric;
        const m = LINE_METRICS[metric];

        // Actualiza el dropdown
        metricDropdownLabel.textContent = m.label;
        metricDropdownIcon.className    = `fas ${m.icon} me-1`;
        metricOptions.forEach(b => b.classList.toggle('active', b.dataset.metric === metric));

        // Actualiza el estado visual de las cards
        clickableCards.forEach(card => {
            card.classList.toggle('summary-card--active', card.dataset.metric === metric);
        });

        // Redibuja la gráfica sin llamar al servidor
        switchLineMetric(metric);
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

    // Cards clicables → cambian la métrica
    clickableCards.forEach(card => {
        card.addEventListener('click', () => setActiveMetric(card.dataset.metric));
    });

    // Dropdown → también usa setActiveMetric para mantenerse en sync con las cards
    metricOptions.forEach(btn => {
        btn.addEventListener('click', () => setActiveMetric(btn.dataset.metric));
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