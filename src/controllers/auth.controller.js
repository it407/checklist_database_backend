import jwt from "jsonwebtoken";
import { loginService } from "../services/auth.service.js";

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password required",
      });
    }

    const user = await loginService(username, password);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        username: user.doer_name,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }, // example: 24h
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      data: {
        id: user.id,
        username: user.doer_name,
        role: user.role,
        page: user.page,
        department: user.department,
      },
    });
  } catch (error) {
    console.error("❌ LOGIN ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};




export const getProfile = async (req, res) => {
  try {
    const user = await pool.query(
      "SELECT id, doer_name, email_id, role, department, page FROM users WHERE id = $1",
      [req.user.id]
    );
    
    res.json({
      success: true,
      user: user.rows[0]
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};