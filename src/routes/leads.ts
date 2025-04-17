// import express from 'express';
// import { Lead } from '../models/Lead';

// const router = express.Router();

// router.get('/', async (req, res) => {
//   try {
//     const leads = await Lead.find().sort({ scraped_at: -1 }).limit(20);
//     res.json(leads);
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to fetch leads' });
//   }
// });

// export default router;
// src/routes/leads.ts
import express from 'express';
import { Lead } from '../models/Lead';

const router = express.Router();

// Get all leads
router.get('/', async (req, res) => {
  try {
    const leads = await Lead.find().sort({ scraped_at: -1 }).limit(20);
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch leads' });
  }
});

// Update summary for a lead by ID
router.put('/:id/summary', async (req, res) => {
  const { summary } = req.body;
  try {
    const updated = await Lead.findByIdAndUpdate(req.params.id, { summary }, { new: true });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update summary' });
  }
});

export default router;
