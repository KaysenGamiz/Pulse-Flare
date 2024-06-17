// Function to fetch data and populate the select elements
async function fetchDataAndPopulateSelect() {
    try {
      const response = await fetch('/employees/cajeros');
      if (!response.ok) {
        throw new Error('Error al obtener la lista de empleados.');
      }
      const empleados = await response.json();
      
      const selectRecibio = document.getElementById('selectRecibio');
      const selectCajero = document.getElementById('selectCajero');
  
      empleados.forEach(empleado => {
        const optionRecibio = document.createElement('option');
        const optionCajero = document.createElement('option');
        optionRecibio.value = empleado.name;
        optionCajero.value = empleado.name;
        optionRecibio.textContent = empleado.name;
        optionCajero.textContent = empleado.name;
        selectRecibio.appendChild(optionRecibio);
        selectCajero.appendChild(optionCajero);
      });
    } catch (error) {
      console.error(error);
    }
  }
  
  // Call the function to populate the select elements on page load
document.addEventListener('DOMContentLoaded', fetchDataAndPopulateSelect);

document.getElementById('selectRecibio').addEventListener('change', function() {
    actualizarTexto(this);
});
  
document.getElementById('selectCajero').addEventListener('change', function() {
    actualizarTexto(this);
});

document.getElementById('selectRecibio').classList.add('hidden-select-line');
document.getElementById('selectCajero').classList.add('hidden-select-line');
