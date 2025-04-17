import mongoose from "mongoose";

const LeadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  job_title: {
    type: String,
  },
  company: {
    type: String,
  },
  location: {
    type: String,
  },
  profile_image_url: {
    type: String,
    default: "",
  },
  profile_url: {
    type: String,
    default: "",
  },
  summary: {
    type: String,
    default: "", // new field added
  },
  scraped_at: {
    type: Date,
    default: Date.now,
  },
});

export const Lead = mongoose.model("Lead", LeadSchema);
