import express from "express";
import { getLeaveData } from "../controllers/leave.controller.js";

const router = express.Router();

router.get("/", getLeaveData);

export default router;
