function editEmployee(index) {
    const employee = window.employees[index];
    if (!employee) {
      alert('Empleado no encontrado.');
      return;
    }
  
    // Pre-rellenar el formulario de edición
    document.getElementById("editEmployeeId").value = employee._id;
    document.getElementById("editName").value = employee.name;
    document.getElementById("editUsername").value = employee.username;
    document.getElementById("editRole").value = employee.role;
  
    const permissions = employee.permissions || {};
    document.getElementById("editReadPermission").checked = permissions.read || false;
    document.getElementById("editWritePermission").checked = permissions.write || false;
    document.getElementById("editAdminPermission").checked = permissions.admin || false;
    document.getElementById("editAccessHojaCortePermission").checked = permissions.accessHojaCorte || false;
    document.getElementById("editAccessCorteExplorerPermission").checked = permissions.accessCorteExplorer || false;
    document.getElementById("editCajeroPermission").checked = permissions.Cajero || false;
    document.getElementById("editAccessCorteAnalyticsPermission").checked = permissions.accessCorteAnalytics || false;
    document.getElementById("editAccessCloudReportsPermission").checked = permissions.accessCloudReports || false;
    document.getElementById("editAccessGeneralUtilsPermission").checked = permissions.accessGeneralUtils || false;
    // Mostrar el modal
    const editModal = new bootstrap.Modal(document.getElementById("editEmployeeModal"));
    editModal.show();
  }

  
  document.getElementById("editEmployeeForm").addEventListener("submit", async function (event) {
    event.preventDefault();
  
    const id = document.getElementById("editEmployeeId").value;
    const name = document.getElementById("editName").value;
    const username = document.getElementById("editUsername").value;
    const password = document.getElementById("editPassword").value || null; // Contraseña opcional
    const role = document.getElementById("editRole").value;
  
    const permissions = {
      read: document.getElementById("editReadPermission").checked,
      write: document.getElementById("editWritePermission").checked,
      admin: document.getElementById("editAdminPermission").checked,
      accessHojaCorte: document.getElementById("editAccessHojaCortePermission").checked,
      accessCorteExplorer: document.getElementById("editAccessCorteExplorerPermission").checked,
      Cajero: document.getElementById("editCajeroPermission").checked,
      accessCorteAnalytics: document.getElementById("editAccessCorteAnalyticsPermission").checked,
      accessCloudReports: document.getElementById("editAccessCloudReportsPermission").checked,
      accessGeneralUtils: document.getElementById("editAccessGeneralUtilsPermission").checked,
    };
  
    try {
      const response = await fetch(`/employees/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, username, password, role, permissions }),
      });
  
      if (!response.ok) {
        throw new Error('Error al actualizar el empleado');
      }
  
      alert('Empleado actualizado correctamente.');
      fetchEmployees(); // Recargar la lista de empleados
      const editModal = bootstrap.Modal.getInstance(document.getElementById("editEmployeeModal"));
      editModal.hide();
    } catch (error) {
      console.error(error);
      alert('Hubo un problema al actualizar el empleado.');
    }
  });
  