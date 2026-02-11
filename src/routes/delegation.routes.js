import express from "express";
import {
  createDelegation,
  getDelegations,
  updateDelegation,
  deleteDelegationById,
  deleteDelegationByDateRange,
  previewDelegation
} from "../controllers/delegation.controller.js";

import upload from "../middlewares/uploads.middleware.js";

const router = express.Router();

router.post("/", createDelegation);
router.get("/", getDelegations);


router.put(
  "/:id",
  upload.single("upload_image"), // 👈 field name SAME rakho
  updateDelegation
);


router.delete("/:id", deleteDelegationById);
router.delete("/", deleteDelegationByDateRange);
router.post("/preview", previewDelegation);




export default router;
