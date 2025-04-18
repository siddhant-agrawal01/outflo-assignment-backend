
import { Request, Response } from "express";
import { Campaign } from "../models/Campaign";

export const getCampaigns = async (req: Request, res: Response) => {
  const campaigns = await Campaign.find({ status: { $ne: "DELETED" } });
  res.json(campaigns);
};

export const getCampaignById = async (req: Request, res: Response) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign || campaign.status === "DELETED") {
    return res.status(404).json({ message: "Campaign not found" });
  }
  res.json(campaign);
};

export const createCampaign = async (req: Request, res: Response) => {
  const { name, description, status, leads, accountIDs } = req.body;
  const campaign = new Campaign({ name, description, status, leads, accountIDs });
  const saved = await campaign.save();
  res.status(201).json(saved);
};

export const updateCampaign = async (req: Request, res: Response) => {
  const { name, description, status, leads, accountIDs } = req.body;
  const updated = await Campaign.findByIdAndUpdate(
    req.params.id,
    { name, description, status, leads, accountIDs },
    { new: true }
  );
  res.json(updated);
};


export const deleteCampaign = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const campaign = await Campaign.findByIdAndUpdate(
      id,
      { status: "deleted" },
      { new: true }
    );

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    res.status(200).json({ message: "Campaign soft deleted", campaign });
  } catch (error) {
    res.status(500).json({ message: "Error deleting campaign", error });
  }
};
