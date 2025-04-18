
import mongoose, { Schema, Document } from "mongoose";

export interface ICampaign extends Document {
  name: string;
  description: string;
  status: "ACTIVE" | "INACTIVE" | "DELETED";
  leads: string[];       
  accountIDs: string[]; 
}

const CampaignSchema: Schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "DELETED"],
      default: "ACTIVE",
    },
    leads: { type: [String], default: [] },
    accountIDs: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Campaign = mongoose.model<ICampaign>(
  "Campaign",
  CampaignSchema
);
