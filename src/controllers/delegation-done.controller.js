// delegation-done.controller.js (agar alag file hai)
import pool from "../config/db.js"; // ✅ Yahaan pool import karo
import { updateDelegationDoneByTaskId } 
from "../services/delegation-done.services.js";


export const getDelegationDone = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM delegation_done ORDER BY timestamp DESC`
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (err) {
    next(err);
  }
};

export const updateDelegationDone = async (req, res, next) => {
  try {
    const { id } = req.params; // task_id

    const updated = await updateDelegationDoneByTaskId(id, req.body);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Delegation done record not found"
      });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};
