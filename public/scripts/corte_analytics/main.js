import { API } from './api.js';
import { initLineChart, initPieChart, initBarChart, updateComparisonChart} from './charts.js';
import { getCurrentMonthRange } from './utils.js';
import { getDateFromWeek, getCurrentWeekString } from './utils.js';


/**
 * Controlador Principal de Pulse-Flare
 */
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Obtener rangos de fecha iniciales (Mes Actual)
    const { start, end, currentMonth } = getCurrentMonthRange();
    let selectedWeeks = []; // Guardará strings tipo "2023-W42"

    // 2. Referencias a elementos del DOM
    const lineStartInput = document.getElementById('lineChartStartDate');
    const lineEndInput = document.getElementById('lineChartEndDate');
    const pieMonthInput = document.getElementById('dateInput');
    const barDateInput = document.getElementById('weekSelector');
    
    const btnLineFilter = document.getElementById('btnLineFilter');
    const btnPieFilter = document.getElementById('sendDate');

    const btnAddWeek = document.getElementById('btnAddWeek');
    const weekInput = document.getElementById('weekSelector');
    const container = document.getElementById('selectedWeeksContainer');
    
    const analysisContainer = document.getElementById('gpt-analysis');

    // 3. Inicialización de Valores en Inputs
    lineStartInput.value = start;
    lineEndInput.value = end;
    pieMonthInput.value = currentMonth;
    barDateInput.value = getCurrentWeekString();

    // --- FUNCIONES DE CARGA ---

    async function loadAnalysis(date) {
        analysisContainer.innerHTML = '<div class="spinner-border text-primary" role="status"></div> Analizando datos...';
        try {
            const pastelData = await API.getPastelData(date);
            const dataToAnalyze = {
                "Dolares": pastelData.dolaresEfectivo,
                "Efectivo": pastelData.totalEfectivo,
                "Tarjeta": pastelData.tarjeta,
                "Date": date
            };
            const result = await API.postForAnalysis(dataToAnalyze);
            analysisContainer.innerHTML = result.analysis;
        } catch (error) {
            analysisContainer.innerHTML = '<span class="text-danger">Error al cargar el análisis.</span>';
        }
    }

    // --- EVENTOS (LISTENERS) ---

    // Filtro Líneas
    btnLineFilter.addEventListener('click', () => {
        initLineChart(lineStartInput.value, lineEndInput.value);
    });

    // Filtro Pastel + Análisis GPT
    btnPieFilter.addEventListener('click', () => {
        const selectedDate = pieMonthInput.value;
        initPieChart(selectedDate);
        loadAnalysis(selectedDate);
    });

    btnAddWeek.addEventListener('click', async () => {
        const weekVal = weekInput.value;
        if (weekVal && !selectedWeeks.includes(weekVal)) {
            if (selectedWeeks.length >= 4) return alert("Máximo 4 semanas para comparar");
            
            selectedWeeks.push(weekVal);
            renderBadges();
            
            // CORRECCIÓN: Pasa el array como argumento
            updateComparisonChart(selectedWeeks); 
        }
    });

    const btnResetWeeks = document.getElementById('btnResetWeeks');
    if (btnResetWeeks) {
        btnResetWeeks.addEventListener('click', () => {
            selectedWeeks = [];
            container.innerHTML = '';
            // Volver a la vista de una sola semana (la actual)
            initBarChart(getDateFromWeek(weekInput.value));
        });
    }

    function renderBadges() {
    container.innerHTML = selectedWeeks.map(w => 
        `<span class="badge bg-dark me-2 p-2">${w}</span>`
    ).join('');
    }

    // --- CARGA INICIAL ---
    // Lanzamos todas las gráficas al abrir la página
    initLineChart(start, end);
    initPieChart(currentMonth);
    initBarChart(getDateFromWeek(barDateInput.value));
    loadAnalysis(currentMonth);
});