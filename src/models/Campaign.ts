// // backend/src/models/Campaign.ts
// import mongoose from "mongoose";

// const campaignSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     description: { type: String },
//     status: {
//       type: String,
//       enum: ["ACTIVE", "INACTIVE", "DELETED"],
//       default: "ACTIVE",
//     },
//     leads: [
//       {
//         name: String,
//         job_title: String,
//         company: String,
//         location: String,
//         summary: String,
//       },
//     ],
//     accountIds: [String],
//   },
//   { timestamps: true }
// );

// const Campaign = mongoose.model("Campaign", campaignSchema);
// export default Campaign;
// backend/src/models/Campaign.ts
import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "DELETED"],
      default: "ACTIVE",
    },
    leads: [
      {
        name: String,
        job_title: String,
        company: String,
        location: String,
        summary: String,
      },
    ],
    accountIds: [String],
  },
  { timestamps: true }
);

const Campaign = mongoose.model("Campaign", campaignSchema);
export default Campaign;
