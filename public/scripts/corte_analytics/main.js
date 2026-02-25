/**
 * Controlador Principal — Pulse-Flare
 * - Un solo filtro de rango controla: cards, líneas, pastel y análisis GPT.
 * - Clicar una summary card filtra la gráfica de líneas.
 * - Card de dólares: clicable + toggle USD/MXN que cambia la métrica de la gráfica.
 * - Filter bar con accesos rápidos de período y contador de días.
 */

import { API } from './api.js';
import { initLineChart, initPieChart, initBarChart, updateComparisonChart, switchLineMetric, LINE_METRICS } from './charts.js';
import { getCurrentMonthRange, getDateFromWeek, getCurrentWeekString, formatCurrency } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {

    // ── Fechas y estado ───────────────────────────────────────────────────
    const { start, end } = getCurrentMonthRange();
    let selectedWeeks = [];
    let currentMetric = 'sistema';
    let dolaresUSD    = 0;
    let dolaresMXN    = 0;
    let showingUSD    = true;

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
    const clickableCards      = document.querySelectorAll('.summary-card--clickable:not(#dolaresCard)');

    const btnDolaresToggle   = document.getElementById('btnDolaresToggle');
    const dolaresToggleLabel = document.getElementById('dolaresToggleLabel');
    const summaryDolares     = document.getElementById('summaryDolares');
    const summaryDolaresSub  = document.getElementById('summaryDolaresSub');
    const dolaresCard        = document.getElementById('dolaresCard');

    const shortcutBtns    = document.querySelectorAll('.shortcut-btn');
    const filterRangeDays = document.getElementById('filterRangeDays');

    // ── Valores iniciales ─────────────────────────────────────────────────
    lineStartInput.value = start;
    lineEndInput.value   = end;
    weekInput.value      = getCurrentWeekString();
    updateDayCounter(start, end);
    markActiveShortcut('month');

    // ── Helpers de período ────────────────────────────────────────────────

    function updateDayCounter(s, e) {
        if (!s || !e) { filterRangeDays.textContent = '— días'; return; }
        const diff = Math.round((new Date(e) - new Date(s)) / 86400000) + 1;
        filterRangeDays.textContent = `${diff} día${diff !== 1 ? 's' : ''}`;
    }

    function markActiveShortcut(key) {
        shortcutBtns.forEach(b => b.classList.toggle('active', b.dataset.shortcut === key));
    }

    function clearActiveShortcut() {
        shortcutBtns.forEach(b => b.classList.remove('active'));
    }

    function getShortcutRange(key) {
        const now = new Date();
        const pad = n => String(n).padStart(2, '0');
        const fmt = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;

        const monday = new Date(now);
        monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        const firstThisMonth  = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastThisMonth   = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const firstPrevMonth  = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastPrevMonth   = new Date(now.getFullYear(), now.getMonth(), 0);

        const d7  = new Date(now); d7.setDate(now.getDate() - 6);
        const d30 = new Date(now); d30.setDate(now.getDate() - 29);

        return {
            '7d':        { start: fmt(d7),            end: fmt(now) },
            '30d':       { start: fmt(d30),            end: fmt(now) },
            'week':      { start: fmt(monday),         end: fmt(sunday) },
            'month':     { start: fmt(firstThisMonth), end: fmt(lastThisMonth) },
            'prevMonth': { start: fmt(firstPrevMonth), end: fmt(lastPrevMonth) },
        }[key];
    }

    // ── Funciones principales ─────────────────────────────────────────────

    async function loadRangeData(s, e) {
        showCardsLoading();
        updateDayCounter(s, e);
        const [summary] = await Promise.all([
            API.getRangeSummary(s, e),
            initLineChart(s, e, currentMetric)
        ]);
        updateSummaryCards(summary, s, e);
        initPieChart(summary);
        loadAnalysis(summary, s, e);
    }

    function showCardsLoading() {
        ['summaryTotalSistema', 'summaryTotalEfectivo', 'summaryTarjeta',
         'summaryTicketPromedio', 'summaryDolares']
            .forEach(id => document.getElementById(id).textContent = '—');
        document.getElementById('summaryLoading').classList.remove('d-none');
    }

    function updateSummaryCards(summary, s, e) {
        document.getElementById('summaryTotalSistema').textContent   = formatCurrency(summary.totalSistema);
        document.getElementById('summaryTotalEfectivo').textContent  = formatCurrency(summary.totalEfectivo);
        document.getElementById('summaryTarjeta').textContent        = formatCurrency(summary.tarjeta);
        document.getElementById('summaryTicketPromedio').textContent = formatCurrency(summary.ticketPromedio);
        document.getElementById('summaryRange').textContent          = `${s} · ${e}`;
        document.getElementById('summaryLoading').classList.add('d-none');

        dolaresUSD = summary.dolaresUSD      || 0;
        dolaresMXN = summary.dolaresEfectivo || 0;
        renderDolaresCard();
    }

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

        if (currentMetric === 'dolaresUSD' || currentMetric === 'dolaresMXN') {
            const newMetric = showingUSD ? 'dolaresUSD' : 'dolaresMXN';
            currentMetric = newMetric;
            updateDropdownUI(newMetric);
            switchLineMetric(newMetric);
        }
    }

    function loadAnalysis(summary, s, e) {
        analysisContainer.innerHTML = '<div class="spinner-border text-primary" role="status"></div> Analizando datos...';
        API.postForAnalysis({
            Dolares:   summary.dolaresEfectivo,
            Efectivo:  summary.totalEfectivo,
            Tarjeta:   summary.tarjeta,
            DateStart: s,
            DateEnd:   e
        })
        .then(result  => { analysisContainer.innerHTML = result.analysis; })
        .catch(() => { analysisContainer.innerHTML = '<span class="text-danger">Error al cargar el análisis.</span>'; });
    }

    function updateDropdownUI(metric) {
        const m = LINE_METRICS[metric];
        if (!m) return;
        metricDropdownLabel.textContent = m.label;
        metricDropdownIcon.className    = `fas ${m.icon} me-1`;
        metricOptions.forEach(b => b.classList.toggle('active', b.dataset.metric === metric));
    }

    function setActiveMetric(metric) {
        currentMetric = metric;
        updateDropdownUI(metric);

        const isDolares = metric === 'dolaresUSD' || metric === 'dolaresMXN';
        clickableCards.forEach(card => {
            card.classList.toggle('summary-card--active', card.dataset.metric === metric);
        });
        dolaresCard.classList.toggle('summary-card--active', isDolares);

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

    // Accesos rápidos — aplican el rango sin necesidad de "Aplicar"
    shortcutBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const range = getShortcutRange(btn.dataset.shortcut);
            if (!range) return;
            lineStartInput.value = range.start;
            lineEndInput.value   = range.end;
            markActiveShortcut(btn.dataset.shortcut);
            loadRangeData(range.start, range.end);
        });
    });

    // Al cambiar manualmente las fechas, quitar el shortcut activo
    lineStartInput.addEventListener('change', () => {
        clearActiveShortcut();
        updateDayCounter(lineStartInput.value, lineEndInput.value);
    });
    lineEndInput.addEventListener('change', () => {
        clearActiveShortcut();
        updateDayCounter(lineStartInput.value, lineEndInput.value);
    });

    btnLineFilter.addEventListener('click', () => {
        const s = lineStartInput.value;
        const e = lineEndInput.value;
        if (!s || !e) return alert('Por favor selecciona ambas fechas.');
        clearActiveShortcut();
        loadRangeData(s, e);
    });

    btnResetFilter.addEventListener('click', () => {
        lineStartInput.value = start;
        lineEndInput.value   = end;
        markActiveShortcut('month');
        loadRangeData(start, end);
    });

    btnDolaresToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        showingUSD = !showingUSD;
        renderDolaresCard();
    });

    dolaresCard.addEventListener('click', () => {
        const metric = showingUSD ? 'dolaresUSD' : 'dolaresMXN';
        setActiveMetric(metric);
    });

    clickableCards.forEach(card => {
        card.addEventListener('click', () => setActiveMetric(card.dataset.metric));
    });

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