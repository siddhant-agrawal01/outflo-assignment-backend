import { Request, Response } from "express";
import { Lead } from "../models/Lead";

export const getLeads = async (req: Request, res: Response) => {
  try {
    const leads = await Lead.find().sort({ scraped_at: -1 });
    return res.json({
      success: true,
      data: leads,
      count: leads.length,
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: (error as Error).message,
    });
  }
};
