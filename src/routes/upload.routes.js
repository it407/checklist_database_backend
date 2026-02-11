
import express from "express";
import multer from "multer";
import path from "path";
import { uploadImage } from "../controllers/upload.controller.js";

const router = express.Router();

// multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// 🔥 THIS ROUTE IS MISSING RIGHT NOW
router.post("/", upload.single("image"), uploadImage);

export default router;
