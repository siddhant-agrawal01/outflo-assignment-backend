// // backend/src/controllers/campaignController.ts
// import { Request, Response } from "express";
// import Campaign from "../models/Campaign";

// // GET /campaigns
// export const getCampaigns = async (req: Request, res: Response) => {
//   const campaigns = await Campaign.find({ status: { $ne: "DELETED" } });
//   res.json(campaigns);
// };

// // GET /campaigns/:id
// export const getCampaignById = async (req: Request, res: Response) => {
//   const campaign = await Campaign.findById(req.params.id);
//   if (!campaign || campaign.status === "DELETED") {
//     return res.status(404).json({ message: "Campaign not found" });
//   }
//   res.json(campaign);
// };

// // POST /campaigns
// export const createCampaign = async (req: Request, res: Response) => {
//   const campaign = new Campaign(req.body);
//   const saved = await campaign.save();
//   res.status(201).json(saved);
// };

// // PUT /campaigns/:id
// export const updateCampaign = async (req: Request, res: Response) => {
//   const updated = await Campaign.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//   });
//   res.json(updated);
// };

// // DELETE /campaigns/:id (soft delete)
// export const deleteCampaign = async (req: Request, res: Response) => {
//   const deleted = await Campaign.findByIdAndUpdate(
//     req.params.id,
//     { status: "DELETED" },
//     { new: true }
//   );
//   res.json({ message: "Campaign soft-deleted", data: deleted });
// };
// backend/src/controllers/campaignController.ts
import { Request, Response } from "express";
import Campaign from "../models/Campaign";

// GET /campaigns
export const getCampaigns = async (req: Request, res: Response) => {
  const campaigns = await Campaign.find({ status: { $ne: "DELETED" } });
  res.json(campaigns);
};

// GET /campaigns/:id
export const getCampaignById = async (req: Request, res: Response) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign || campaign.status === "DELETED") {
    return res.status(404).json({ message: "Campaign not found" });
  }
  res.json(campaign);
};

// POST /campaigns
export const createCampaign = async (req: Request, res: Response) => {
  const campaign = new Campaign(req.body);
  const saved = await campaign.save();
  res.status(201).json(saved);
};

// PUT /campaigns/:id
export const updateCampaign = async (req: Request, res: Response) => {
  const updated = await Campaign.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(updated);
};

// DELETE /campaigns/:id (soft delete)
export const deleteCampaign = async (req: Request, res: Response) => {
  const deleted = await Campaign.findByIdAndUpdate(
    req.params.id,
    { status: "DELETED" },
    { new: true }
  );
  res.json({ message: "Campaign soft-deleted", data: deleted });
};
