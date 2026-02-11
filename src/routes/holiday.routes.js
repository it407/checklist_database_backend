import express from "express";
import {
  addHoliday,
  getAllHolidays,
  deleteHoliday,
} from "../controllers/holiday.controller.js";

const router = express.Router();

router.get("/", getAllHolidays);
router.post("/", addHoliday);
router.delete("/:id", deleteHoliday);

export default router;
