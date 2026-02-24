const express = require('express');
const router = express.Router();
const path = require('path');
const moment = require('moment-timezone');
const { Corte } = require(path.join(__dirname, '..', '..', 'controllers', 'schemas', 'corte_schema.js'));
const { HTTP } = require(path.join(__dirname, '..', '..', '/config', 'config.js'))
const { CorteObj } = require(path.join(__dirname, '..', '..', 'controllers', 'hoja_corte','corte.js'));
const { getLatestRCC , getLatestPlusOneRCC, checkRCCinDB, leerArchivoJSON, escribirArchivoJSON, validarYActualizarCorteLocal} = require(path.join(__dirname, '..', '..', 'controllers', 'hoja_corte', 'utils.js'));
const { createCorte , getCortes } = require(path.join(__dirname, '..', '..', 'controllers', 'hoja_corte','data_handler.js'));


// GET Base
router.get('/', (req, res) => {
  res.status(HTTP.OK).send('Página de corte');
});

// GET Details
router.get('/details', (req, res) => {
  res.status(HTTP.OK).send('Detalle de corte');
});

// GET Data
router.get('/data', (req, res) => {
    Corte.find({})
    .then((cortes) => {
        res.status(HTTP.FOUND).json(cortes);
    })
    .catch((error) => {
        console.error(error);
        res.status(HTTP.INTERNAL_SERVER_ERROR).json({ error: 'Error al obtener los cortes' });
    });
});

// GET Corte By RCC
router.get('/rcc/:rcc', (req, res) => {
    const rcc = req.params.rcc;

    Corte.findOne({ RCC: rcc })
    .then((corte) => {
        if (!corte) {
        return res.status(HTTP.BAD_REQUEST).json({ error: 'RCC Mal escrito o no encontrado.' });
        }

        res.status(HTTP.FOUND).json(corte);
    })
    .catch((error) => {
        console.error(error);
        res.status(HTTP.INTERNAL_SERVER_ERROR).json({ error: 'Error al obtener el corte' });
    });
});

// GET Corte Between RCC
router.get('/rcc', (req, res) => {
    const rcc1 = req.query.rcc1;
    const rcc2 = req.query.rcc2;
  
    Corte.find({ RCC: { $gte: rcc1, $lte: rcc2 } })
    .then((cortes) => {
        if (cortes.length === 0) {
            return res.status(HTTP.BAD_REQUEST).json({ error: 'RCC Mal escrito o no encontrado.' });
        }

        res.status(HTTP.FOUND).json(cortes);
    })
    .catch((error) => {
        console.error(error);
        res.status(HTTP.INTERNAL_SERVER_ERROR).json({ error: 'Error al obtener los cortes' });
    });
});

// GET Corte By Date
router.get('/date/:date', (req, res) => {
    const date = req.params.date;

    try {
        const fechaInicio = moment.tz(date, 'America/Los_Angeles').startOf('day').toDate();
        const fechaFin = moment.tz(date, 'America/Los_Angeles').endOf('day').toDate();

        Corte.find({ fechaHora: { $gte: fechaInicio, $lte: fechaFin } })
        .then((cortes) => {
            res.status(HTTP.FOUND).json(cortes);
        })
        .catch((error) => {
            console.error(error);
            res.status(HTTP.INTERNAL_SERVER_ERROR).json({ error: 'Error al obtener los cortes' });
        });
    } catch (error) {
        return res.status(HTTP.BAD_REQUEST).json({ error: 'Formato de fecha inválido. Utiliza el formato YYYY-MM-DD' });
    }
});

// GET Corte Between Dates
router.get('/date', (req, res) => {
    const date1 = req.query.date1;
    const date2 = req.query.date2;

    try {
        const fechaInicio = moment.tz(date1, 'America/Los_Angeles');
        const fechaFin = moment.tz(date2, 'America/Los_Angeles').endOf('day');

        Corte.find({ fechaHora: { $gte: fechaInicio.toDate(), $lt: fechaFin.toDate() } })
        .then((cortes) => {
            res.status(HTTP.FOUND).json(cortes);
        })
        .catch((error) => {
            console.error(error);
            res.status(HTTP.INTERNAL_SERVER_ERROR).json({ error: 'Error al obtener los cortes' });
        });
    } catch (error) {
        return res.status(HTTP.BAD_REQUEST).json({ error: 'Formato de fecha inválido. Utiliza el formato YYYY-MM-DD' });
    }
});

// GET Chart Data Between Dates
// Devuelve totalSistema, efectivo y tarjeta — cada uno con desglose por turno (matutino/vespertino)
router.get('/chart-data', (req, res) => {
    const date1 = req.query.date1;
    const date2 = req.query.date2;

    try {
        const fechaInicio = moment.tz(date1, 'America/Los_Angeles').startOf('day').toDate();
        const fechaFin    = moment.tz(date2, 'America/Los_Angeles').endOf('day').toDate();

        Corte.find({ fechaHora: { $gte: fechaInicio, $lte: fechaFin } })
        .then((cortes) => {

            // Maps para cada métrica: total del día + desglose por turno
            const maps = {
                sistema:            new Map(),
                sistemaMatutino:    new Map(),
                sistemaVespertino:  new Map(),
                efectivo:           new Map(),
                efectivoMatutino:   new Map(),
                efectivoVespertino: new Map(),
                tarjeta:            new Map(),
                tarjetaMatutino:    new Map(),
                tarjetaVespertino:  new Map(),
            };

            const add = (map, key, value) =>
                map.set(key, (map.get(key) || 0) + value);

            cortes.forEach((corte) => {
                const fecha  = moment.tz(corte.fechaHora, 'America/Los_Angeles').format('YYYY-MM-DD');
                const hora   = moment.tz(corte.fechaHora, 'America/Los_Angeles').hour();
                const turno  = hora < 18 ? 'Matutino' : 'Vespertino';

                const sistema  = corte.totalSistema  || 0;
                const efectivo = (corte.totalEfectivo || 0) + (corte.retiroEnEfectivo || 0);
                const tarjeta  = corte.tarjeta        || 0;

                // Total diario
                add(maps.sistema,   fecha, sistema);
                add(maps.efectivo,  fecha, efectivo);
                add(maps.tarjeta,   fecha, tarjeta);

                // Desglose por turno
                if (turno === 'Matutino') {
                    add(maps.sistemaMatutino,    fecha, sistema);
                    add(maps.efectivoMatutino,   fecha, efectivo);
                    add(maps.tarjetaMatutino,    fecha, tarjeta);
                } else {
                    add(maps.sistemaVespertino,  fecha, sistema);
                    add(maps.efectivoVespertino, fecha, efectivo);
                    add(maps.tarjetaVespertino,  fecha, tarjeta);
                }
            });

            const labels = Array.from(maps.sistema.keys());
            const align  = (map) => labels.map(d => map.get(d) ?? null);

            res.status(HTTP.OK).json({
                labels,
                // Total Sistema
                sistema:            align(maps.sistema),
                sistemaMatutino:    align(maps.sistemaMatutino),
                sistemaVespertino:  align(maps.sistemaVespertino),
                // Total Efectivo
                efectivo:           align(maps.efectivo),
                efectivoMatutino:   align(maps.efectivoMatutino),
                efectivoVespertino: align(maps.efectivoVespertino),
                // Tarjeta
                tarjeta:            align(maps.tarjeta),
                tarjetaMatutino:    align(maps.tarjetaMatutino),
                tarjetaVespertino:  align(maps.tarjetaVespertino),
            });
        })
        .catch((error) => {
            console.error(error);
            res.status(HTTP.INTERNAL_SERVER_ERROR).json({ error: 'Error al obtener los datos para la gráfica' });
        });

    } catch (error) {
        return res.status(HTTP.BAD_REQUEST).json({ error: 'Formato de fecha inválido. Utiliza el formato YYYY-MM-DD' });
    }
});

// GET Range Summary — métricas completas para un rango de fechas
// Uso: GET /cortes/range-summary?date1=YYYY-MM-DD&date2=YYYY-MM-DD
router.get('/range-summary', (req, res) => {
    const { date1, date2 } = req.query;

    if (!date1 || !date2) {
        return res.status(HTTP.BAD_REQUEST).json({
            error: 'Se requieren los parámetros date1 y date2 (YYYY-MM-DD)'
        });
    }

    try {
        const fechaInicio = moment.tz(date1, 'YYYY-MM-DD', 'America/Los_Angeles').startOf('day').toDate();
        const fechaFin    = moment.tz(date2, 'YYYY-MM-DD', 'America/Los_Angeles').endOf('day').toDate();

        Corte.aggregate([
            {
                $match: {
                    fechaHora: { $gte: fechaInicio, $lte: fechaFin }
                }
            },
            {
                $group: {
                    _id: null,
                    // Cards
                    totalSistema:  { $sum: '$totalSistema' },
                    totalEfectivo: { $sum: { $add: ['$totalEfectivo', '$retiroEnEfectivo'] } },
                    tarjeta:       { $sum: '$tarjeta' },
                    totalCortes:   { $sum: 1 },          // conteo para ticket promedio
                    // Pastel
                    dolaresEfectivo: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $ne: ['$dolares.TC', 0] },
                                        { $ne: ['$dolares.efectivo', 0] }
                                    ]
                                },
                                { $multiply: ['$dolares.TC', '$dolares.efectivo'] },
                                0
                            ]
                        }
                    },
                }
            }
        ])
        .then((result) => {
            const raw = result[0] || {
                totalSistema:    0,
                totalEfectivo:   0,
                tarjeta:         0,
                totalCortes:     0,
                dolaresEfectivo: 0,
            };

            // Ticket promedio = totalSistema / número de cortes
            const ticketPromedio = raw.totalCortes > 0
                ? raw.totalSistema / raw.totalCortes
                : 0;

            res.status(HTTP.OK).json({
                totalSistema:    raw.totalSistema,
                totalEfectivo:   raw.totalEfectivo,
                tarjeta:         raw.tarjeta,
                ticketPromedio,
                dolaresEfectivo: raw.dolaresEfectivo,
            });
        })
        .catch((error) => {
            console.error(error);
            res.status(HTTP.INTERNAL_SERVER_ERROR).json({ error: 'Error al obtener el resumen del rango' });
        });

    } catch (error) {
        return res.status(HTTP.BAD_REQUEST).json({
            error: 'Formato de fecha inválido. Utiliza el formato YYYY-MM-DD'
        });
    }
});

// GET Accumulated Data by Day for a Week
router.get('/daily-accumulated', (req, res) => {
    const { date } = req.query;

    try {
        if (!date) {
            return res.status(HTTP.BAD_REQUEST).json({ error: 'El parámetro "date" es requerido en formato YYYY-MM-DD.' });
        }

        const fechaInicio = moment.tz(date, 'YYYY-MM-DD', 'America/Los_Angeles').startOf('isoWeek').toDate();
        const fechaFin    = moment.tz(date, 'YYYY-MM-DD', 'America/Los_Angeles').endOf('isoWeek').toDate();

        Corte.aggregate([
            {
                $match: {
                    fechaHora: { $gte: fechaInicio, $lte: fechaFin } // Filtrar por la semana seleccionada
                }
            },
            {
                $group: {
                    _id: {
                        dayOfWeek: {
                            $dayOfWeek: {
                                date:     '$fechaHora',
                                timezone: 'America/Los_Angeles' // Evita desfase UTC vs hora local
                            }
                        }
                    },
                    totalSistemaSum: { $sum: '$totalSistema' }
                }
            },
            {
                $sort: { '_id.dayOfWeek': 1 } // Domingo = 1, Sábado = 7
            },
            {
                $project: {
                    _id: 0,
                    dayOfWeek:      '$_id.dayOfWeek',
                    totalSistemaSum: 1
                }
            }
        ])
        .then((result) => {
            const adjustedDayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

            // Array de 7 días con valor 0 por defecto
            const finalData = adjustedDayNames.map(name => ({ dayName: name, totalSistemaSum: 0 }));

            // Llenar con los datos reales
            // MongoDB: Domingo=1, Lunes=2 ... Sábado=7
            // Nuestro array: Lunes=0 ... Domingo=6
            result.forEach(item => {
                const adjustedIndex = item.dayOfWeek === 1 ? 6 : item.dayOfWeek - 2;
                if (finalData[adjustedIndex]) {
                    finalData[adjustedIndex].totalSistemaSum = item.totalSistemaSum;
                }
            });

            res.status(HTTP.OK).json(finalData);
        })
        .catch((error) => {
            console.error(error);
            res.status(HTTP.INTERNAL_SERVER_ERROR).json({ error: 'Error al obtener los datos acumulados por día de la semana' });
        });

    } catch (error) {
        return res.status(HTTP.BAD_REQUEST).json({ error: 'Formato de fecha inválido. Utiliza el formato YYYY-MM-DD.' });
    }
});


router.get('/rcc-validation', async (req, res) => {
    try {
        var rccToValidate = req.query.rcc;
        var found = await checkRCCinDB(rccToValidate);
        
        if(found) { 
            res.status(200).json( {found: true} );
        } else { 
            res.status(200).json( {found: false} );
        }

    } catch (error) {
        console.log('Error al validar el último RCC:', error);
        res.status(500).json({ error: 'Error al obtener los cortes' });
    }
});

// POST Crear Corte
router.post('/createCorte', async (req, res) => {
    let nuevoCorte;
    console.log(req.body)
    if (typeof req.body === 'object') {
        nuevoCorte = CorteObj.fromObject(req.body);
    } else if (typeof req.body === 'string') {
        nuevoCorte = CorteObj.fromJSON(req.body);
    } else {
        return res.status(400).send('Tipo de elemento no válido en req.body');
    }
  
    createCorte(nuevoCorte);
  
    res.status(200).send('Corte creado!');
});

module.exports = router;
