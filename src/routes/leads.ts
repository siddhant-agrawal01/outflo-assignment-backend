import express from 'express';
import { Lead } from '../models/Lead';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const leads = await Lead.find().sort({ scraped_at: -1 }).limit(20);
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch leads' });
  }
});

export default router;
