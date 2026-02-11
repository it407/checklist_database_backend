import express from "express";
import { login } from "../controllers/auth.controller.js";

import { getProfile } from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';


const router = express.Router();

router.post("/login", login);
router.get('/profile', verifyToken, getProfile);

export default router;
