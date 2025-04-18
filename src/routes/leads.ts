

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


router.get("/search", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: "LinkedIn URL is required" });
    }

    const match = url.match(/linkedin\.com\/in\/([^\/?]+)/);
    const slug = match ? match[1] : null;

    if (!slug) {
      return res.status(400).json({ error: "Invalid LinkedIn URL format" });
    }

    const leads = await Lead.find({
      profile_url: { $regex: slug, $options: "i" },
    });

    res.status(200).json(leads);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



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
