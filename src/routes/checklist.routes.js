import express from "express";
import {
  createChecklist,
  getAllChecklists,
  updateChecklist,
  deleteChecklistById,
  deleteChecklistByDateRange ,
  previewChecklist
} from "../controllers/checklist.controller.js";

import upload from "../middlewares/uploads.middleware.js";


const router = express.Router();

router.post("/", createChecklist);
router.get("/", getAllChecklists);
// 🔥 NEW
// router.put("/:id", updateChecklist);
router.delete("/:id", deleteChecklistById);
router.delete("/", deleteChecklistByDateRange);

router.post("/preview", previewChecklist);

router.put(
  "/:id",
  upload.single("uploaded_image"),   // 👈 field name match karo
  updateChecklist
);



export default router;
