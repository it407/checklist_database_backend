import * as delegationService from "../services/delegation.service.js";
import {
  updateDelegation as updateDelegationService,
  moveToDelegationDone,
} from "../services/delegation.service.js";

import pool from "../config/db.js";
import { insertDelegation } from "../services/delegation.service.js";
import { sendWhatsAppTemplate } from "../utils/wati.js";
import { writeLog } from "../utils/logger.js";
import { formatDDMMYYYY } from "../utils/date.js";

export const createDelegation = async (req, res) => {
  writeLog("ssd_in.log", {
    api: "POST /api/delegation",
    body: req.body,
  });

  try {
    const task = await insertDelegation(req.body);

    const userRes = await pool.query(
      `SELECT wa_number FROM users WHERE doer_name = $1`,
      [task.name],
    );

    const phone = userRes.rows[0]?.wa_number;

    if (phone) {
      try {
        await sendWhatsAppTemplate({
          phone,
          template_name: "deligation_task_assign",
          broadcast_name: "DELEGATION_ASSIGN",
          parameters: [
            { name: "name", value: task.name },
            { name: "given_by", value: task.given_by },
            { name: "task_description", value: task.task_description },
            { name: "start_date", value: formatDDMMYYYY(task.task_start_date) },
            { name: "end_date", value: formatDDMMYYYY(task.end_date) },
          ],
        });

        await pool.query(
          `
          UPDATE delegation
          SET whatsapp_status = 'SENT',
              whatsapp_sent_at = NOW()
          WHERE id = $1
          `,
          [task.id],
        );
      } catch (err) {
        await pool.query(
          `
          UPDATE delegation
          SET whatsapp_status = 'FAILED'
          WHERE id = $1
          `,
          [task.id],
        );

        writeLog("error.log", {
          source: "DELEGATION_WHATSAPP",
          error: err.message,
        });
      }
    }

    res.json({
      success: true,
      message: "Delegation task assigned",
      data: task,
    });
  } catch (err) {
    writeLog("error.log", {
      api: "POST /api/delegation",
      error: err.message,
    });

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export const getDelegations = async (req, res, next) => {
  try {
    const data = await delegationService.getAllDelegations();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const updateDelegation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const payload = {
      ...req.body,
      upload_image: req.file ? req.file.path : null, // 🔥 SAME LOGIC
    };

    const updated = await updateDelegationService(id, payload);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Delegation not found",
      });
    }

    if (payload.status === "Done" || payload.status === "Extend date") {
      // ✅ move to history table
      await moveToDelegationDone({
        ...updated,
        task_id: updated.id,
      });
    }
    res.json({
      success: true,
      message: "Delegation updated",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

// 🔥 NEW — DELETE single
export const deleteDelegationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await delegationService.deleteDelegationById(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Delegation not found",
      });
    }

    res.json({
      success: true,
      message: "Delegation deleted",
    });
  } catch (err) {
    next(err);
  }
};

// 🔥 NEW — DELETE by date range
export const deleteDelegationByDateRange = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.body;

    const count = await delegationService.deleteDelegationByDateRange(
      startDate,
      endDate,
    );

    res.json({
      success: true,
      deletedRows: count,
    });
  } catch (err) {
    next(err);
  }
};

export const previewDelegation = async (req, res, next) => {
  try {
    const rows = await delegationService.previewDelegation(req.body);

    res.json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (err) {
    next(err);
  }
};
