const employeeTable = document.getElementById("employeeTable");

// Obtener datos de empleados del servidor
async function fetchEmployees() {
  try {
    const response = await fetch('/employees/data'); // Asegúrate de que la ruta coincida con la de tu servidor
    if (!response.ok) throw new Error('Error al obtener los empleados');
    const employees = await response.json();
    renderTable(employees);
    window.employees = employees;
  } catch (error) {
    console.error(error);
    alert('Hubo un problema al cargar los empleados.');
  }
}

// Renderiza la tabla de empleados
function renderTable(employees) {
  employeeTable.innerHTML = "";
  employees.forEach((employee, index) => {
    const permissions = Object.entries(employee.permissions || {})
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

      employeeTable.innerHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${employee.name}</td>
        <td>${employee.username}</td>
        <td>${employee.role}</td>
        <td>
          <button class="btn btn-info btn-sm" onclick="showPermissions(${index})">Ver Permisos</button>
        </td>
        <td>
          <button class="btn btn-warning btn-sm" onclick="editEmployee(${index})">Editar</button>
          <button class="btn btn-danger btn-sm" onclick="deleteEmployee(${index})">Eliminar</button>
        </td>
      </tr>
    `;
    
  });
}

async function deleteEmployee(index) {
    const employee = window.employees[index];
    if (!employee) {
      alert('Empleado no encontrado.');
      return;
    }
  
    const confirmation = confirm(`¿Estás seguro de que deseas eliminar a ${employee.name}?`);
    if (!confirmation) return;
  
    try {
      const response = await fetch(`/employees/delete/${employee._id}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error('Error al eliminar el empleado');
      }
  
      alert('Empleado eliminado correctamente.');
      fetchEmployees(); // Actualiza la tabla después de eliminar
    } catch (error) {
      console.error(error);
      alert('Hubo un problema al eliminar el empleado.');
    }
  }
  

  function showPermissions(index) {
    const employee = window.employees[index];
    const permissionsTable = document.getElementById("permissionsList"); // Cambiamos a tabla
    const employeeName = document.getElementById("employeeName");
  
    employeeName.textContent = employee.name;
    permissionsTable.innerHTML = `
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Permiso</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
        </tbody>
      </table>
    `;
  
    const tbody = permissionsTable.querySelector("tbody");
  
    // Iterar sobre los permisos y generar filas
    Object.entries(employee.permissions).forEach(([key, value]) => {
      tbody.innerHTML += `
        <tr>
          <td>${key}</td>
          <td>${value ? '✅' : '❌'}</td>
        </tr>
      `;
    });
  
    const permissionsModal = new bootstrap.Modal(document.getElementById("permissionsModal"));
    permissionsModal.show();
  }
  

// Inicializa la tabla cargando los empleados desde el servidor
fetchEmployees();
