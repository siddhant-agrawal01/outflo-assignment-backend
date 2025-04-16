// // backend/src/routes/campaignRoutes.ts
// import express from "express";
// import {
//   getCampaigns,
//   getCampaignById,
//   createCampaign,
//   updateCampaign,
//   deleteCampaign,
// } from "../controllers/campaignController";

// const router = express.Router();

// // Helper to catch async errors
// const asyncHandler =
//   (fn: any) =>
//   (req: express.Request, res: express.Response, next: express.NextFunction) => {
//     Promise.resolve(fn(req, res, next)).catch(next);
//   };

// router.get("/", asyncHandler(getCampaigns));
// router.get("/:id", asyncHandler(getCampaignById));
// router.post("/", asyncHandler(createCampaign));
// router.put("/:id", asyncHandler(updateCampaign));
// router.delete("/:id", asyncHandler(deleteCampaign));

// export default router;
// backend/src/routes/campaignRoutes.ts
import express from "express";
import {
  getCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from "../controllers/campaignController";

const router = express.Router();

// Helper to catch async errors
const asyncHandler =
  (fn: any) =>
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

router.get("/", asyncHandler(getCampaigns));
router.get("/:id", asyncHandler(getCampaignById));
router.post("/", asyncHandler(createCampaign));
router.put("/:id", asyncHandler(updateCampaign));
router.delete("/:id", asyncHandler(deleteCampaign));

export default router;
