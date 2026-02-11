import express from "express";
import {
  fetchWorkingDays,
  createWorkingDay,
  removeWorkingDay,
} from "../controllers/workingDay.controller.js";

const router = express.Router();

router.get("/", fetchWorkingDays);
router.post("/", createWorkingDay);
router.delete("/:id", removeWorkingDay);

export default router;
