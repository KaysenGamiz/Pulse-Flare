/**
 * Servicio central de APIs para Pulse-Flare
 */

const BASE_URL = '/cortes';

export const API = {
    /**
     * Obtiene datos para la gráfica de líneas (Acumulados por día)
     * @param {string} start - Fecha inicio YYYY-MM-DD
     * @param {string} end   - Fecha fin   YYYY-MM-DD
     */
    getLineData: async (start, end) => {
        const response = await fetch(`${BASE_URL}/chart-data?date1=${start}&date2=${end}`);
        if (!response.ok) throw new Error('Error al obtener datos de línea');
        return await response.json();
    },

    /**
     * Obtiene el resumen completo del rango en una sola llamada:
     * totalSistema (card), dolaresEfectivo + totalEfectivo + tarjeta (pastel)
     * Reemplaza: getPastelData() y getSummary()
     * @param {string} start - Fecha inicio YYYY-MM-DD
     * @param {string} end   - Fecha fin   YYYY-MM-DD
     */
    getRangeSummary: async (start, end) => {
        const response = await fetch(`${BASE_URL}/range-summary?date1=${start}&date2=${end}`);
        if (!response.ok) throw new Error('Error al obtener el resumen del rango');
        return await response.json();
    },

    /**
     * Obtiene datos para la gráfica de barras (Venta diaria por semana)
     * @param {string} date - Fecha de referencia YYYY-MM-DD
     */
    getBarData: async (date) => {
        const response = await fetch(`${BASE_URL}/daily-accumulated?date=${date}`);
        if (!response.ok) throw new Error('Error al obtener datos de barras');
        return await response.json();
    },

    /**
     * Envía datos a GPT para obtener el análisis de texto
     * @param {Object} data - Objeto con Dolares, Efectivo, Tarjeta, DateStart y DateEnd
     */
    postForAnalysis: async (data) => {
        const response = await fetch('/analisis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Error en el análisis de datos');
        return await response.json();
    }
};