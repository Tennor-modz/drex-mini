const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const SESSIONS_DIR = './temp'; // e.g., ./temp/abc123/creds.json

router.get('/', (req, res) => {
  try {
    if (!fs.existsSync(SESSIONS_DIR)) {
      return res.json({
        active: 0,
        inactive: 0,
        status: 'online',
        timestamp: new Date().toISOString()
      });
    }

    const ids = fs.readdirSync(SESSIONS_DIR).filter(f => 
      fs.statSync(path.join(SESSIONS_DIR, f)).isDirectory()
    );

    let active = 0;
    let inactive = 0;

    const now = Date.now();
    const ACTIVE_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes

    ids.forEach(id => {
      const credsPath = path.join(SESSIONS_DIR, id, 'creds.json');
      if (fs.existsSync(credsPath)) {
        try {
          const stats = fs.statSync(credsPath);
          const age = now - stats.mtimeMs;

          if (age < ACTIVE_THRESHOLD_MS) {
            active++;
          } else {
            inactive++;
          }
        } catch (e) {
          // If stat fails, count as inactive
          inactive++;
        }
      }
      // Skip IDs without creds.json (incomplete/aborted)
    });

    res.json({
      active,
      inactive,
      status: 'online',
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('📊 Stats error:', err);
    res.status(500).json({
      active: 0,
      inactive: 0,
      status: 'error',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
