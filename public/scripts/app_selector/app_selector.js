import { getUserPermissions, getUserName } from './user.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Manejar eventos de clic en opciones de la aplicación
    const appOptions = document.querySelectorAll('.app-option');

    appOptions.forEach(option => {
        option.addEventListener('click', () => {
            const app = option.getAttribute('data-app');
            window.location.href = `/${app}`;
        });
    });

    // Obtener nombre de usuario y permisos
    const userName = await getUserName();
    const permissions = await getUserPermissions();

    console.log(userName)
    console.log(permissions)

    // Actualizar el nombre del usuario en la navbar
    document.getElementById('username').textContent = userName;

    const appSelector = document.getElementById('app-selector');

    // Mostrar aplicaciones basadas en permisos
    if (permissions.includes('accessHojaCorte')) {
        appSelector.innerHTML += `
            <div class="app-option" data-app="hoja_corte">
                <img src="/images/hoja_icon.ico" alt="Hoja de Corte">
                <p>Hoja de Corte</p>
            </div>
        `;
    }

    if (permissions.includes('accessCorteExplorer')) {
        appSelector.innerHTML += `
            <div class="app-option" data-app="corte_explorer">
                <img src="/images/explorer_icon.ico" alt="Corte Explorer">
                <p>Corte Explorer</p>
            </div>
        `;
    }

    if (permissions.includes('accessCorteAnalytics')) {
        appSelector.innerHTML += `
            <div class="app-option" data-app="corte_analytics">
                <img src="/images/analytics_icon.ico" alt="Corte Analytics">
                <p>Corte Analytics</p>
            </div>
        `;
    }

    if (permissions.includes('accessCloudReports')) {
        appSelector.innerHTML += `
            <div class="app-option" data-app="cloud_reports">
                <img src="/images/reports_icon.ico" alt="Cloud Reports">
                <p>Cloud Reports</p>
            </div>
        `;
    }

    if (permissions.includes('accessGeneralUtils')) {
        appSelector.innerHTML += `
            <div class="app-option" data-app="general_utils/factura_analyzer">
                <img src="/images/reports_icon.ico" alt="Factura Analyzer">
                <p>Factura Analyzer</p>
            </div>
        `;
    }

    if (permissions.includes('admin')) {
        appSelector.innerHTML += `
            <div class="app-option" data-app="employees">
                <img src="/images/employee_icon.ico" alt="Employees Settings">
                <p>Employees Settings</p>
            </div>
        `;
    }

    // Reagregar los eventos de clic a las nuevas opciones de la aplicación
    const updatedAppOptions = document.querySelectorAll('.app-option');
    updatedAppOptions.forEach(option => {
        option.addEventListener('click', () => {
            const app = option.getAttribute('data-app');
            window.location.href = `/${app}`;
        });
    });
});
