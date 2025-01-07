const express = require('express');
const path = require('path');
const router = express.Router();

const corte_router = require(path.join(__dirname, '..' , 'routes', 'common', 'corte_route.js'));
const employee_router = require(path.join(__dirname, '..' , 'routes', 'common', 'employees_route.js'));

const hoja_router = require(path.join(__dirname, '..' , 'routes', 'hoja_corte', 'hoja_corte_route.js'));
const explorer_router = require(path.join(__dirname, '..' , 'routes', 'corte_explorer', 'corte_explorer_route.js'));
const analytics_router = require(path.join(__dirname, '..' , 'routes', 'corte_analytics', 'corte_analytics_route.js'));
const reports_router = require(path.join(__dirname, '..' , 'routes', 'cloud_reports', 'cloud_reports_route.js'));
const factura_analyzer_router = require(path.join(__dirname, '..' , 'routes', 'general_utils', 'factura_analyzer', 'factura_analyzer_route.js'));

router.use('/hoja_corte', hoja_router);
router.use('/corte_explorer', explorer_router);
router.use('/corte_analytics', analytics_router);
router.use('/cloud_reports', reports_router);
router.use('/general_utils/factura_analyzer', factura_analyzer_router)

router.use('/cortes', corte_router);
router.use('/employees', employee_router);


module.exports = router;