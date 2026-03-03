
const express = require('express');
const router = express.Router();

// Track server start time
const startTime = Date.now();

router.get('/', (req, res) => {
  const uptimeMs = Date.now() - startTime;
  const uptimeSec = Math.floor(uptimeMs / 1000);
  const uptime = {
    seconds: uptimeSec % 60,
    minutes: Math.floor(uptimeSec / 60) % 60,
    hours: Math.floor(uptimeSec / 3600)
  };

  res.json({
    status: 'active',
    ping: Date.now() - req.startTime, // will set req.startTime via middleware
    uptime,
    timestamp: new Date().toISOString()
  });
});

module.exports = { router, startTime };
