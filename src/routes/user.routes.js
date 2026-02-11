import express from "express";
import { getAllUsers , createUser , updateUser , deleteUser  } from "../controllers/user.controller.js";


import { verifyToken, checkAdmin } from "../middlewares/auth.middleware.js";


const router = express.Router();

// GET all users
// router.get("/", getAllUsers);
// router.post("/", createUser);
// router.put("/:id", updateUser);
// router.delete("/:id", deleteUser);

router.get("/", verifyToken, checkAdmin, getAllUsers);
router.post("/", verifyToken, checkAdmin, createUser);
router.put("/:id", verifyToken, checkAdmin, updateUser);
router.delete("/:id", verifyToken, checkAdmin, deleteUser);


export default router;
