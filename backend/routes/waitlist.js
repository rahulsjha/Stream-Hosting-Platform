'use strict';
const router = require('express').Router();
const db = require('../db/database');
const logger = require('../utils/logger');

// POST /api/waitlist
// body: { email, platform, channel_type }
router.post('/', async (req, res) => {
  const { email, platform, channel_type } = req.body;
  if (!email) return res.status(400).json({ error: 'email required' });

  try {
    await db.query(
      `INSERT INTO waitlist_signups (email, platform, channel_type) VALUES ($1, $2, $3)`,
      [email.trim(), platform || null, channel_type || null]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    logger.error('[Waitlist] Insert error:', err.message || err);
    res.status(500).json({ error: 'Failed to save signup' });
  }
});

// GET /api/waitlist/count
router.get('/count', async (_req, res) => {
  try {
    const { rows } = await db.query('SELECT COUNT(*)::int AS cnt FROM waitlist_signups');
    res.json({ count: rows[0].cnt });
  } catch (err) {
    logger.error('[Waitlist] Count error:', err.message || err);
    res.status(500).json({ error: 'Failed to fetch count' });
  }
});

module.exports = router;
