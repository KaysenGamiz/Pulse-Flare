const express = require('express');
const router = express.Router();
const path = require('path');
const Reading = require(path.join(__dirname, '..', '..', '..', 'controllers', 'schemas', 'readings_schema.js'));
const { getLatestLiveReading } = require(path.join(__dirname, '..', '..', '..', 'state.js'));

process.env.TZ = 'America/Los_Angeles'; // Pacific Time

router.get('/', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, '..', '..', '..', 'views', 'general_utils', 'temperatures', 'home.html'));
});

// Ruta para obtener lecturas filtradas por semana
router.get('/readings', async (req, res) => {
  try {
    const { year, month, week } = req.query;
    
    if (!year || !month || !week) {
      return res.status(400).json({ error: 'Se requieren los parámetros year, month y week' });
    }

    // Convertir parámetros a números
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    const weekNum = parseInt(week);

    // Calcular el rango de días para la semana seleccionada
    const { startDay, endDay } = calculateWeekDays(yearNum, monthNum, weekNum);

    // Construir la consulta para obtener las lecturas de la semana
    const query = {
      year: yearNum,
      month: monthNum,
      day: { $gte: startDay, $lte: endDay }
    };

    // Obtener las lecturas
    const readings = await Reading.find(query).sort({ timestamp: 1 });

    // Calcular estadísticas si hay lecturas
    let stats = {};
    if (readings.length > 0) {
      const totalTemp = readings.reduce((sum, reading) => sum + reading.temperature, 0);
      const totalHum = readings.reduce((sum, reading) => sum + reading.humidity, 0);
      
      stats = {
        total: readings.length,
        avgTemperature: (totalTemp / readings.length).toFixed(1),
        avgHumidity: (totalHum / readings.length).toFixed(1),
        startDate: `${yearNum}-${monthNum.toString().padStart(2, '0')}-${startDay.toString().padStart(2, '0')}`,
        endDate: `${yearNum}-${monthNum.toString().padStart(2, '0')}-${endDay.toString().padStart(2, '0')}`
      };
    }

    res.json({
      stats,
      readings
    });
  } catch (err) {
    console.error('Error obteniendo lecturas:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Función corregida para calcular los días de inicio y fin de una semana específica
function calculateWeekDays(year, month, weekNumber) {
  // El primer día del mes
  const firstDay = new Date(year, month - 1, 1);
  
  if (weekNumber === 1) {
    const startDay = 1;
    
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    const endDay = Math.min(7, lastDayOfMonth);
    
    return { startDay, endDay };
  } else {
    const startDay = (weekNumber - 1) * 7 + 1;
    
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    const endDay = Math.min(startDay + 6, lastDayOfMonth);
    
    return { startDay, endDay };
  }
}

router.get('/devices', async (req, res) => {
  try {
    const devices = await Reading.distinct('device_id');
    res.json({ devices });
  } catch (err) {
    console.error('Error obteniendo dispositivos:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/devices/stats', async (req, res) => {
  try {
    const stats = await Reading.aggregate([
      {
        $group: {
          _id: '$device_id',
          count: { $sum: 1 },
          avgTemperature: { $avg: '$temperature' },
          avgHumidity: { $avg: '$humidity' },
          lastReading: { $max: '$timestamp' }
        }
      },
      {
        $project: {
          device_id: '$_id',
          _id: 0,
          count: 1,
          avgTemperature: { $round: ['$avgTemperature', 1] },
          avgHumidity: { $round: ['$avgHumidity', 1] },
          lastReading: 1
        }
      }
    ]);
    
    res.json({ stats });
  } catch (err) {
    console.error('Error obteniendo estadísticas:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/readings/live', (req, res) => {
  const latest = getLatestLiveReading();

  if (!latest) {
    return res.status(404).json({ error: 'No hay lectura en memoria aún' });
  }

  res.json({ reading: latest });
});

router.get('/report', async (req, res) => {
  const { year, month, week } = req.query;

  if (!year || !month || !week) {
    return res.status(400).send('Faltan parámetros');
  }

  const yearNum = parseInt(year);
  const monthNum = parseInt(month);
  const weekNum = parseInt(week);

  const { startDay, endDay } = calculateWeekDays(yearNum, monthNum, weekNum);

  const query = {
    year: yearNum,
    month: monthNum,
    day: { $gte: startDay, $lte: endDay }
  };

  try {
    const readings = await Reading.find(query).sort({ timestamp: 1 });

    // Crear una estructura por día y hora
    const reportData = {};
    for (let i = startDay; i <= endDay; i++) {
      reportData[i] = { 8: null, 15: null, 22: null };
    }

    for (const r of readings) {
      const day = r.day;
      const hour = r.hour;
      if ([8, 15, 22].includes(hour) && reportData[day]) {
        reportData[day][hour] = {
          temp: r.temperature,
          hum: r.humidity
        };
      }
    }

    res.render(path.join('general_utils', 'temperatures', 'report'), {
      year: yearNum,
      month: monthNum,
      week: weekNum,
      startDay,
      endDay,
      reportData
    });    
  } catch (err) {
    console.error(err);
    res.status(500).send('Error generando el reporte');
  }
});

module.exports = router;
