document.addEventListener('DOMContentLoaded', () => {
    // Obtener la referencia del campo de entrada
    const dateInput = document.getElementById('dateInput');

    // Obtener la fecha actual
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // Se suma 1 porque los meses van de 0 a 11

    // Formatear la fecha actual en el formato requerido (YYYY-MM)
    const formattedDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;

    // Establecer el valor del campo de entrada al mes actual
    dateInput.value = formattedDate;

    graficaPastel(dateInput.value)
})