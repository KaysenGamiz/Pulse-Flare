/**
 * Configuración visual y paleta de colores para Chart.js
 */

// 1. Paleta de colores (Identidad visual Pulse-Flare)
export const CHART_COLORS = {
    total: {
        border: '#2c3e50',
        bg: 'rgba(44, 62, 80, 0.1)'
    },
    matutino: {
        border: '#3498db',
        bg: 'rgba(52, 152, 219, 0.2)'
    },
    vespertino: {
        border: '#e67e22',
        bg: 'rgba(230, 126, 34, 0.2)'
    },
    dolares: {
        border: '#e74c3c',
        bg: '#e74c3c'
    },
    efectivo: {
        border: '#0d6efd',
        bg: '#0d6efd'
    },
    tarjeta: {
        border: '#ffc107',
        bg: '#ffc107'
    },
    semana: {
        border: '#6c5ce7',
        bg: 'rgba(108, 92, 231, 0.5)'
    }
};

// 2. Opciones globales de Chart.js (fuentes, tooltips)
export const globalOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: {
                font: {
                    family: "'Inter', 'Segoe UI', sans-serif",
                    size: 13,
                    weight: '500'
                },
                usePointStyle: true,
                padding: 20
            }
        },
        tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#2c3e50',
            bodyColor: '#2c3e50',
            borderColor: '#e2e8f0',
            borderWidth: 1,
            padding: 12,
            boxPadding: 5,
            displayColors: true,
            cornerRadius: 8
        }
    }
};

// 3. Plugin para sombras en líneas (efecto moderno)
export const lineShadowPlugin = {
    id: 'lineShadow',
    beforeDraw: (chart) => {
        const { ctx } = chart;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 5;
    }
};