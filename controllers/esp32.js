const express = require('express');
const router = express.Router();
const path = require('path');
const Reading = require(path.join(__dirname, 'schemas', 'readings_schema.js'));
const { setLatestLiveReading } = require(path.join(__dirname, '..', 'state.js'));

process.env.TZ = 'America/Los_Angeles'; // Pacific Time

router.post('/esp32/upload', async (req, res) => {

    const secret = req.headers['x-esp32-secret'];

    if (secret !== process.env.ESP32_SECRET) {
      return res.status(401).json({ error: 'Unauthorized: Invalid secret' });
    }

    const { temperature, device_id, humidity } = req.body;
  
    if (temperature === undefined || device_id === undefined || humidity === undefined) {
      return res.status(400).json({ error: 'temperature, device_id, and humidity are required' });
    }
  
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
  
    const liveReading = {
      device_id,
      temperature,
      humidity,
      timestamp: now.toISOString(),
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour,
      minute
    };

    setLatestLiveReading(liveReading);
  
    const shouldSave = ([8, 15, 22].includes(hour) && minute === 0);
  
    if (!shouldSave) {
      return res.status(200).json({ message: 'Lectura recibida en tiempo real (no guardada)', realtime: true });
    }
  
    try {
      const newReading = new Reading(latestLiveReading);
      const saved = await newReading.save();
      res.status(201).json({ message: 'Lectura guardada en MongoDB', id: saved._id });
    } catch (err) {
      console.error('Error guardando lectura:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  

module.exports = router;
