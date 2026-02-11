import * as holidayService from "../services/holiday.service.js";
import { successResponse, errorResponse } from "../utils/response.js";

export const addHoliday = async (req, res) => {
  try {
    const { date, holiday } = req.body;

    if (!date || !holiday) {
      return errorResponse(res, "Date and holiday name required", 400);
    }

    const result = await holidayService.addHoliday(date, holiday);
    return successResponse(res, "Holiday added successfully", result);
  } catch (err) {
    console.error("Add Holiday Error:", err);
    return errorResponse(res, err.message);
  }
};


export const getAllHolidays = async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");

    const result = await holidayService.getAllHolidays();

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("❌ HOLIDAY API ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    await holidayService.deleteHoliday(id);
    return successResponse(res, "Holiday deleted successfully");
  } catch (err) {
    console.error("Delete Holiday Error:", err);
    return errorResponse(res, err.message);
  }
};
