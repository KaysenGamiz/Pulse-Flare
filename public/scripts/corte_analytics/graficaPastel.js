const ctxDough = document.getElementById('pastel').getContext('2d');
let pastelChart;

function graficaPastel(date) {
  fetch(`/cortes/accumulated-data?date=${date}`)
    .then(r => r.json())
    .then(data => {
      const config = {
        type: 'doughnut',
        data: {
          labels: ['Dólares', 'Efectivo', 'Tarjeta'],
          datasets: [{
            data: [data.dolaresEfectivo, data.totalEfectivo, data.tarjeta],
            backgroundColor: ['#FF6384', '#0d6efd', '#ffc107'],
            hoverOffset: 8,
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '60%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 12,
                padding: 16,
                font: { family: "'Segoe UI', sans-serif", size: 12 }
              }
            },
            tooltip: {
              callbacks: {
                label: ctx => {
                  const value = ctx.parsed;
                  const total = ctx.dataset.data.reduce((a,b)=>a+b,0);
                  const pct = ((value/total)*100).toFixed(1);
                  return `${ctx.label}: $${value.toLocaleString()} (${pct}%)`;
                }
              },
              padding: 8,
              cornerRadius: 4
            }
          }
        }
      };

      if (pastelChart) pastelChart.destroy();
      pastelChart = new Chart(ctxDough, config);
    });
}
