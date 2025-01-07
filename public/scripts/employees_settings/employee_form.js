document.getElementById("addEmployeeForm").addEventListener("submit", async function (event) {
    event.preventDefault();
  
    const name = document.getElementById("employee_name").value;
    const username = document.getElementById("employee_username").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;
  
    const permissions = {
      read: document.getElementById("readPermission").checked,
      write: document.getElementById("writePermission").checked,
      admin: document.getElementById("adminPermission").checked,
      accessHojaCorte: document.getElementById("accessHojaCortePermission").checked,
      accessCorteExplorer: document.getElementById("accessCorteExplorerPermission").checked,
      Cajero: document.getElementById("cajeroPermission").checked,
      accessCorteAnalytics: document.getElementById("accessCorteAnalyticsPermission").checked,
      accessCloudReports: document.getElementById("accessCloudReportsPermission").checked,
      accessGeneralUtils: document.getElementById("accessGeneralUtilsPermission").checked,
    };
  
    try {
      const response = await fetch('/employees/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, username, password, role, permissions }),
      });
  
      if (!response.ok) {
        throw new Error('Error al agregar el empleado');
      }
  
      alert('Empleado agregado correctamente.');
      fetchEmployees(); // Recargar la lista de empleados
      this.reset(); // Limpiar el formulario
    } catch (error) {
      console.error(error);
      alert('Hubo un problema al agregar el empleado.');
    }
  });
  