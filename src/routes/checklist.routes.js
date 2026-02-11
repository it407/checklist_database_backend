import express from "express";
import {
  createChecklist,
  getAllChecklists,
  updateChecklist,
  deleteChecklistById,
  deleteChecklistByDateRange ,
  previewChecklist
} from "../controllers/checklist.controller.js";

const router = express.Router();

router.post("/", createChecklist);
router.get("/", getAllChecklists);
// 🔥 NEW
router.put("/:id", updateChecklist);
router.delete("/:id", deleteChecklistById);
router.delete("/", deleteChecklistByDateRange);

router.post("/preview", previewChecklist);



export default router;
