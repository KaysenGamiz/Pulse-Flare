/**
 * Controlador Principal — Pulse-Flare
 * - Un solo filtro de rango controla: cards, líneas, pastel y análisis GPT.
 * - Clicar una summary card filtra la gráfica de líneas.
 * - Card de dólares: clicable + toggle USD/MXN que cambia la métrica de la gráfica.
 */

import { API } from './api.js';
import { initLineChart, initPieChart, initBarChart, updateComparisonChart, switchLineMetric, LINE_METRICS } from './charts.js';
import { getCurrentMonthRange, getDateFromWeek, getCurrentWeekString, formatCurrency } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {

    // ── Fechas y estado ───────────────────────────────────────────────────
    const { start, end } = getCurrentMonthRange();
    let selectedWeeks = [];
    let currentMetric = 'sistema';

    // Estado del toggle de dólares
    let dolaresUSD  = 0;
    let dolaresMXN  = 0;
    let showingUSD  = true; // qué moneda muestra la card ahora

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
    const clickableCards = document.querySelectorAll('.summary-card--clickable:not(#dolaresCard)');

    const btnDolaresToggle   = document.getElementById('btnDolaresToggle');
    const dolaresToggleLabel = document.getElementById('dolaresToggleLabel');
    const summaryDolares     = document.getElementById('summaryDolares');
    const summaryDolaresSub  = document.getElementById('summaryDolaresSub');
    const dolaresCard        = document.getElementById('dolaresCard');

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
        ['summaryTotalSistema', 'summaryTotalEfectivo', 'summaryTarjeta',
         'summaryTicketPromedio', 'summaryDolares']
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

        dolaresUSD = summary.dolaresUSD      || 0;
        dolaresMXN = summary.dolaresEfectivo || 0;
        renderDolaresCard();
    }

    /**
     * Actualiza la card de dólares según la moneda activa (USD/MXN).
     * Si la card de dólares está activa en la gráfica, también actualiza la métrica.
     */
    function renderDolaresCard() {
        if (showingUSD) {
            summaryDolares.textContent     = `$${dolaresUSD.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
            summaryDolaresSub.textContent  = 'Total en dólares recibidos';
            dolaresToggleLabel.textContent = 'MXN';
        } else {
            summaryDolares.textContent     = formatCurrency(dolaresMXN);
            summaryDolaresSub.textContent  = 'Convertido a pesos (TC ponderado)';
            dolaresToggleLabel.textContent = 'USD';
        }

        // Si la gráfica está mostrando dólares, actualizar también la métrica
        if (currentMetric === 'dolaresUSD' || currentMetric === 'dolaresMXN') {
            const newMetric = showingUSD ? 'dolaresUSD' : 'dolaresMXN';
            // Actualizamos sin pasar por setActiveMetric para no redibujar el estado de cards
            currentMetric = newMetric;
            updateDropdownUI(newMetric);
            switchLineMetric(newMetric);
        }
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
     * Solo actualiza el label/ícono del dropdown, sin tocar el estado de las cards.
     */
    function updateDropdownUI(metric) {
        const m = LINE_METRICS[metric];
        if (!m) return;
        metricDropdownLabel.textContent = m.label;
        metricDropdownIcon.className    = `fas ${m.icon} me-1`;
        metricOptions.forEach(b => b.classList.toggle('active', b.dataset.metric === metric));
    }

    /**
     * Punto central de cambio de métrica.
     * Actualiza gráfica, dropdown y estado activo de cards.
     */
    function setActiveMetric(metric) {
        currentMetric = metric;
        updateDropdownUI(metric);

        const isDolares = metric === 'dolaresUSD' || metric === 'dolaresMXN';

        // Cards con data-metric
        clickableCards.forEach(card => {
            card.classList.toggle('summary-card--active', card.dataset.metric === metric);
        });

        // Card de dólares — se maneja por id porque su métrica es dinámica
        dolaresCard.classList.toggle('summary-card--active', isDolares);

        // Si se activa desde el dropdown con dólares, sincronizar el toggle
        if (metric === 'dolaresUSD') showingUSD = true;
        if (metric === 'dolaresMXN') showingUSD = false;
        if (isDolares) renderDolaresCard();

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

    // Toggle USD/MXN — cambia la card Y la gráfica si está activa
    btnDolaresToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        showingUSD = !showingUSD;
        renderDolaresCard();
    });

    // Clic en la card de dólares — activa la métrica según el toggle actual
    dolaresCard.addEventListener('click', () => {
        const metric = showingUSD ? 'dolaresUSD' : 'dolaresMXN';
        setActiveMetric(metric);
    });

    // Cards clicables normales
    clickableCards.forEach(card => {
        card.addEventListener('click', () => setActiveMetric(card.dataset.metric));
    });

    // Dropdown
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