import {
  createUserService,
  updateUserService,
  deleteUserService ,
  getAllUsersService
} from "../services/user.service.js";

import { successResponse } from "../utils/response.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await getAllUsersService();
    res.status(200).json(users);
  } catch (error) {
    console.error("❌ USER API ERROR:", error); 
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const createUser = async (req, res) => {
  try {
    const user = await createUserService(req.body);
    res.status(201).json(user);
  } catch (error) {
    console.error("❌ CREATE USER ERROR:", error);
    res.status(500).json({ message: "Failed to create user" });
  }
};


export const updateUser = async (req, res) => {
  try {
    const user = await updateUserService(req.params.id, req.body);
    res.json(user);
  } catch (error) {
    console.error("❌ UPDATE USER ERROR:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
};


export const deleteUser = async (req, res) => {
  try {
    await deleteUserService(req.params.id);
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("❌ DELETE USER ERROR:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};
