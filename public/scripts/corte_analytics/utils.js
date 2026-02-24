/**
 * Utilidades globales para el Dashboard Pulse-Flare
 */

// 1. Formateo de fechas para inputs y APIs (YYYY-MM-DD)
export function formatDate(date) {
    if (!(date instanceof Date)) date = new Date(date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 2. Formateo de moneda (Ej: 1250.5 -> $1,250.50)
export function formatCurrency(value) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
    }).format(value);
}

// 3. Obtener el primer y último día del mes actual (Útil para filtros iniciales)
export function getCurrentMonthRange() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return {
        start: formatDate(firstDay),
        end: formatDate(lastDay),
        currentMonth: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    };
}

// 4. Obtener nombre del día basado en fecha (Para gráficas de barras)
export function getDayName(dateString) {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const d = new Date(dateString);
    return days[d.getDay()];
}

// 5. Convierte un string de semana (2023-W42) al primer día de esa semana (YYYY-MM-DD)
export function getDateFromWeek(weekString) {
    if (!weekString) return null;
    const [year, week] = weekString.split('-W');
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dayOfWeek = simple.getDay();
    const ISOweekStart = simple;

    if (dayOfWeek <= 4) {
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }
    return formatDate(ISOweekStart);
}

// 6. Obtiene el string de la semana actual para el input (YYYY-Www)
export function getCurrentWeekString() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    const week = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
}