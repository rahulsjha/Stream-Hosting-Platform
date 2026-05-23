'use strict';
const router = require('express').Router();
const db = require('../db/database');
const logger = require('../utils/logger');

async function ensureWaitlistTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS waitlist_signups (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email VARCHAR(255) NOT NULL,
      platform VARCHAR(50),
      channel_type VARCHAR(50),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await db.query(
    'CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist_signups(created_at DESC)'
  );
}

// POST /api/waitlist
// body: { email, platform, channel_type }
router.post('/', async (req, res) => {
  const { email, platform, channel_type } = req.body;
  if (!email) return res.status(400).json({ error: 'email required' });

  try {
    await ensureWaitlistTable();
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
    await ensureWaitlistTable();
    const { rows } = await db.query('SELECT COUNT(*)::int AS cnt FROM waitlist_signups');
    res.json({ count: rows[0].cnt });
  } catch (err) {
    logger.error('[Waitlist] Count error:', err.message || err);
    res.status(500).json({ error: 'Failed to fetch count' });
  }
});

module.exports = router;
