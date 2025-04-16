import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  name: String,
  job_title: String,
  company: String,
  location: String,
  scraped_at: { type: Date, default: Date.now },
});

export const Lead = mongoose.model('Lead', leadSchema);
