import { getAllLeaveData } from "../services/leave.service.js";

export const getLeaveData = async (req, res) => {
  try {
    const { department } = req.query;

    const data = await getAllLeaveData(
      department && department !== "Select Department"
        ? department
        : null
    );

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error("Leave fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch leave data"
    });
  }
};
