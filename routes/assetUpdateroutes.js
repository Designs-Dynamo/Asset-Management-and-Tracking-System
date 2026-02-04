import express from "express";
import { auth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import {
  createAssetUpdateRequest,
  getPendingRequests,
  approveUpdateRequest,
  rejectUpdateRequest,
  createadminAssetUpdateRequest,
  createBranchChangeRequest,
  branchrequests
} from "../controller/assetUpdatecontroller.js";
import { isAdmin } from "../middleware/admin.js";

const router = express.Router();

router.post("/:assetId", auth, upload.array("images", 5), createAssetUpdateRequest);
router.get("/pending", auth, getPendingRequests);
router.put("/:id/approve", auth, approveUpdateRequest);
router.put("/:id/reject", auth, rejectUpdateRequest);
router.post("/admin/:assetId", auth, isAdmin, upload.array("images", 5), createadminAssetUpdateRequest);
router.post("/:assetId/branch-change",auth,createBranchChangeRequest);
router.get("/my-requests",auth,branchrequests);

export default router;
