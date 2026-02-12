import * as checklistService from "../services/checklist.service.js";

import { insertChecklist } from "../services/checklist.service.js";
import { sendWhatsAppTemplate } from "../utils/wati.js";
import { writeLog } from "../utils/logger.js";
import pool from "../config/db.js";
import { formatDDMMYYYY } from "../utils/date.js";

export const createChecklist = async (req, res) => {
  writeLog("ssd_in.log", {
    api: "POST /api/checklist",
    body: req.body,
  });

  try {
    const tasks = await insertChecklist(req.body);

    const firstTask = tasks[0];

    // 🔹 doer ka WhatsApp number
    const userRes = await pool.query(
      `SELECT wa_number FROM users WHERE doer_name = $1`,
      [firstTask.name],
    );

    const phone = userRes.rows[0]?.wa_number;

    if (phone) {
      try {
        await sendWhatsAppTemplate({
          phone,
          template_name: "new_checklist_reminder",
          broadcast_name: "CHECKLIST_ASSIGN",
          parameters: [
            { name: "name", value: firstTask.name },
            { name: "given_by", value: firstTask.given_by },
            { name: "task_description", value: firstTask.task_description },
            {
              name: "end_date",
              value: formatDDMMYYYY(firstTask.task_start_date),
            },
          ],
        });

        await pool.query(
          `
          UPDATE checklist
          SET whatsapp_status = 'SENT',
              whatsapp_sent_at = NOW()
          WHERE id = $1
          `,
          [firstTask.id],
        );
      } catch (err) {
        await pool.query(
          `
          UPDATE checklist
          SET whatsapp_status = 'FAILED'
          WHERE id = $1
          `,
          [firstTask.id],
        );

        writeLog("error.log", {
          source: "CHECKLIST_WHATSAPP",
          error: err.message,
        });
      }
    }

    res.json({
      success: true,
      message: "Checklist task assigned",
      data: tasks,
    });
  } catch (err) {
    writeLog("error.log", {
      api: "POST /api/checklist",
      error: err.message,
    });

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// get all checklist tasks
export const getAllChecklists = async (req, res, next) => {
  try {
    const result = await checklistService.getAllChecklists();

    return res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// update checklist task
// export const updateChecklist = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     const updated = await checklistService.updateChecklist(id, req.body);

//     if (!updated) {
//       return res.status(404).json({
//         success: false,
//         message: "Task not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Checklist updated",
//       data: updated,
//     });
//   } catch (err) {
//     next(err);
//   }
// };


export const updateChecklist = async (req, res, next) => {
  try {
    const { id } = req.params;

    const payload = {
      ...req.body,
      uploaded_image: req.file
        ? req.file.path.replace(/\\/g, "/")
        : req.body.uploaded_image || null,
    };

    const updated = await checklistService.updateChecklist(id, payload);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Checklist updated",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};




// 🔹 DELETE single
export const deleteChecklistById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await checklistService.deleteChecklistById(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Checklist deleted",
    });
  } catch (err) {
    next(err);
  }
};

// 🔹 DELETE by date range
export const deleteChecklistByDateRange = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate required",
      });
    }

    const deletedCount = await checklistService.deleteChecklistByDateRange(
      startDate,
      endDate,
    );

    res.status(200).json({
      success: true,
      message: "Checklist deleted",
      deletedRows: deletedCount,
    });
  } catch (err) {
    next(err);
  }
};

export const previewChecklist = async (req, res, next) => {
  try {
    const dates = await checklistService.generateChecklistDates(req.body);

    return res.json({
      success: true,
      count: dates.length,
      dates,
    });
  } catch (err) {
    next(err);
  }
};
