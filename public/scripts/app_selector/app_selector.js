import { getUserPermissions, getUserName } from './user.js';

// Definir las aplicaciones con sus metadatos
const appDefinitions = {
    'hoja_corte': {
        title: 'Hoja de Corte',
        description: 'Gestiona y controla las hojas de corte de manera eficiente para optimizar el proceso de producción.',
        icon: '/images/hoja_icon.ico',
        category: 'production',
        badge: 'Producción',
        section: 'Producción',
        sectionIcon: 'fas fa-industry'
    },
    'corte_explorer': {
        title: 'Corte Explorer',
        description: 'Explora y analiza datos de corte en tiempo real con herramientas avanzadas de búsqueda.',
        icon: '/images/explorer_icon.ico',
        category: 'analytics',
        badge: 'Análisis',
        section: 'Análisis y Reportes',
        sectionIcon: 'fas fa-chart-line'
    },
    'corte_analytics': {
        title: 'Corte Analytics',
        description: 'Visualiza métricas y estadísticas avanzadas con dashboards interactivos.',
        icon: '/images/analytics_icon.ico',
        category: 'analytics',
        badge: 'Análisis',
        section: 'Análisis y Reportes',
        sectionIcon: 'fas fa-chart-line'
    },
    'cloud_reports': {
        title: 'Cloud Reports',
        description: 'Genera reportes en la nube con acceso desde cualquier lugar y dispositivo.',
        icon: '/images/reports_icon.ico',
        category: 'reports',
        badge: 'Reportes',
        section: 'Análisis y Reportes',
        sectionIcon: 'fas fa-chart-line'
    },
    'general_utils/factura_analyzer': {
        title: 'Factura Analyzer',
        description: 'Analiza y procesa facturas de manera automatizada con tecnología OCR.',
        icon: '/images/reports_icon.ico',
        category: 'utilities',
        badge: 'Utilidades',
        section: 'Utilidades',
        sectionIcon: 'fas fa-tools'
    },
    'general_utils/xml_formatter': {
        title: 'XML Formatter',
        description: 'Formatea, valida y procesa archivos XML de manera sencilla y eficiente.',
        icon: '/images/reports_icon.ico',
        category: 'utilities',
        badge: 'Utilidades',
        section: 'Utilidades',
        sectionIcon: 'fas fa-tools'
    },
    'general_utils/temperatures': {
        title: 'Temp Monitor',
        description: 'Monitorea temperaturas y condiciones ambientales en tiempo real.',
        icon: '/images/reports_icon.ico',
        category: 'monitoring',
        badge: 'Monitoreo',
        section: 'Utilidades',
        sectionIcon: 'fas fa-tools'
    },
    'employees': {
        title: 'Employees Settings',
        description: 'Administra empleados, permisos y configuraciones generales del sistema.',
        icon: '/images/employee_icon.ico',
        category: 'admin',
        badge: 'Administración',
        section: 'Administración',
        sectionIcon: 'fas fa-shield-alt'
    }
};

// Mapeo de permisos a aplicaciones
const permissionToApps = {
    'accessHojaCorte': ['hoja_corte'],
    'accessCorteExplorer': ['corte_explorer'],
    'accessCorteAnalytics': ['corte_analytics'],
    'accessCloudReports': ['cloud_reports'],
    'accessGeneralUtils': ['general_utils/factura_analyzer', 'general_utils/xml_formatter', 'general_utils/temperatures'],
    'admin': ['employees']
};

function createAppCard(appKey, appData) {
    return `
        <div class="app-card ${appData.category}" data-app="${appKey}">
            <div class="app-icon">
                <img src="${appData.icon}" alt="${appData.title}">
            </div>
            <h3 class="app-title">${appData.title}</h3>
            <p class="app-description">${appData.description}</p>
            <span class="app-badge">${appData.badge}</span>
        </div>
    `;
}

function createSection(sectionName, sectionIcon, apps) {
    const appsHTML = apps.map(app => createAppCard(app.key, app.data)).join('');
    
    return `
        <div class="apps-section">
            <h2 class="section-title">
                <i class="${sectionIcon} me-2"></i>
                ${sectionName}
            </h2>
            <div class="apps-grid">
                ${appsHTML}
            </div>
        </div>
    `;
}

function addClickEventListeners() {
    const appCards = document.querySelectorAll('.app-card');
    appCards.forEach(card => {
        card.addEventListener('click', () => {
            const app = card.getAttribute('data-app');
            window.location.href = `/${app}`;
        });
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Obtener nombre de usuario y permisos
        const userName = await getUserName();
        const permissions = await getUserPermissions();

        // Actualizar el nombre del usuario en la navbar
        document.getElementById('username').textContent = userName;

        // Determinar qué aplicaciones mostrar basado en permisos
        const availableApps = [];
        permissions.forEach(permission => {
            if (permissionToApps[permission]) {
                permissionToApps[permission].forEach(appKey => {
                    if (appDefinitions[appKey]) {
                        availableApps.push({
                            key: appKey,
                            data: appDefinitions[appKey]
                        });
                    }
                });
            }
        });

        // Actualizar contador de aplicaciones
        document.getElementById('app-count').textContent = availableApps.length;

        // Agrupar aplicaciones por sección
        const sections = {};
        availableApps.forEach(app => {
            const sectionName = app.data.section;
            if (!sections[sectionName]) {
                sections[sectionName] = {
                    icon: app.data.sectionIcon,
                    apps: []
                };
            }
            sections[sectionName].apps.push(app);
        });

        // Generar HTML para cada sección
        const appSelector = document.getElementById('app-selector');
        let sectionsHTML = '';
        
        Object.entries(sections).forEach(([sectionName, sectionData]) => {
            sectionsHTML += createSection(sectionName, sectionData.icon, sectionData.apps);
        });

        appSelector.innerHTML = sectionsHTML;

        // Agregar event listeners a las tarjetas
        addClickEventListeners();

    } catch (error) {
        console.error('Error al cargar las aplicaciones:', error);
        // Mostrar mensaje de error al usuario
        document.getElementById('app-selector').innerHTML = `
            <div class="alert alert-danger" role="alert">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Error al cargar las aplicaciones. Por favor, recarga la página.
            </div>
        `;
    }
});

function generateSectionNavButtons() {
            const sectionsContainer = document.getElementById('section-nav-buttons');
            const sections = document.querySelectorAll('.apps-section');
            
            sectionsContainer.innerHTML = ''; // Limpiar contenido existente
            
            sections.forEach((section, index) => {
                const sectionTitle = section.querySelector('.section-title');
                if (sectionTitle) {
                    const sectionText = sectionTitle.textContent.trim();
                    const sectionIcon = sectionTitle.querySelector('i');
                    const iconClass = sectionIcon ? sectionIcon.className : 'fas fa-folder';
                    
                    // Crear ID único para la sección
                    const sectionId = `section-${index}`;
                    section.id = sectionId;
                    
                    // Crear botón de navegación
                    const button = document.createElement('a');
                    button.className = 'section-nav-btn';
                    button.href = `#${sectionId}`;
                    button.innerHTML = `<i class="${iconClass}"></i> ${sectionText}`;
                    
                    // Añadir smooth scroll
                    button.addEventListener('click', function(e) {
                        e.preventDefault();
                        document.getElementById(sectionId).scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    });
                    
                    sectionsContainer.appendChild(button);
                }
            });
        }

        // Observar cambios en el DOM para regenerar botones cuando se carguen las secciones
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.target.id === 'app-selector') {
                    // Esperar un poco para que se complete el render
                    setTimeout(generateSectionNavButtons, 100);
                }
            });
        });

        // Iniciar observación cuando el DOM esté listo
        document.addEventListener('DOMContentLoaded', function() {
            const appSelector = document.getElementById('app-selector');
            if (appSelector) {
                observer.observe(appSelector, {
                    childList: true,
                    subtree: true
                });
            }
        });