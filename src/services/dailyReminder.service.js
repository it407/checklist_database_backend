// import pool from "../config/db.js";
// import { sendWhatsAppTemplate } from "../utils/wati.js";
// import { writeLog } from "../utils/logger.js";

// /**
//  * DAILY MIS REMINDER SERVICE
//  * Template Name: dailymis
//  */
// export const runDailyReminder = async () => {
//   const today = new Date().toISOString().split("T")[0];

//   try {
//     // 1️⃣ Fetch users with WhatsApp number
//     const usersRes = await pool.query(`
//       SELECT doer_name, department, wa_number
//       FROM users
//       WHERE wa_number IS NOT NULL
//         AND wa_number <> ''
//     `);

//     for (const user of usersRes.rows) {
//       const { doer_name, department, wa_number } = user;

//       try {
//         /* ---------------- TOTAL TASK (TODAY) ---------------- */
//         const totalRes = await pool.query(`
//           SELECT
//           (
//             SELECT COUNT(*) FROM checklist
//             WHERE name = $1 AND task_start_date = $2
//           ) +
//           (
//             SELECT COUNT(*) FROM delegation
//             WHERE name = $1 AND planned_date = $2
//           ) AS total_today
//         `, [doer_name, today]);

//         const totalToday = Number(totalRes.rows[0].total_today);

//         /* ---------------- COMPLETED (TODAY) ---------------- */
//         const completedRes = await pool.query(`
//           SELECT
//           (
//             SELECT COUNT(*) FROM checklist
//             WHERE name = $1
//               AND task_start_date = $2
//               AND status = 'completed'
//           ) +
//           (
//             SELECT COUNT(*) FROM delegation
//             WHERE name = $1
//               AND planned_date = $2
//               AND status = 'completed'
//           ) AS completed_today
//         `, [doer_name, today]);

//         const completedToday = Number(completedRes.rows[0].completed_today);

//         /* ---------------- PENDING (TODAY) ---------------- */
//         const pendingRes = await pool.query(`
//           SELECT
//           (
//             SELECT COUNT(*) FROM checklist
//             WHERE name = $1
//               AND task_start_date = $2
//               AND status = 'pending'
//           ) +
//           (
//             SELECT COUNT(*) FROM delegation
//             WHERE name = $1
//               AND planned_date = $2
//               AND status = 'pending'
//           ) AS pending_today
//         `, [doer_name, today]);

//         const pendingToday = Number(pendingRes.rows[0].pending_today);

//         /* ---------------- OVERDUE (BEFORE TODAY) ---------------- */
//         const overdueRes = await pool.query(`
//           SELECT
//           (
//             SELECT COUNT(*) FROM checklist
//             WHERE name = $1
//               AND task_start_date < $2
//               AND status = 'pending'
//               AND actual IS NULL
//           ) +
//           (
//             SELECT COUNT(*) FROM delegation
//             WHERE name = $1
//               AND planned_date < $2
//               AND status = 'pending'
//               AND actual IS NULL
//           ) AS overdue
//         `, [doer_name, today]);

//         const overdue = Number(overdueRes.rows[0].overdue);

//         /* ---------------- TASK COUNT ---------------- */
//         const taskCount = totalToday;

//         /* ---------------- SEND WHATSAPP ---------------- */
//         await sendWhatsAppTemplate({
//           phone: wa_number,
//           template_name: "dailymis",
//           broadcast_name: "DAILY_MIS_REMINDER",
//           parameters: [
//             { name: "1", value: doer_name },             // User Name
//             { name: "3", value: department || "-" },     // Department
//             { name: "5", value: String(taskCount) },     // Total
//             { name: "6", value: String(completedToday) },
//             { name: "7", value: String(pendingToday) },
//             { name: "8", value: String(overdue) }
//           ]
//         });

//         /* ---------------- SUCCESS LOG ---------------- */
//         writeLog("ssd_out.log", {
//           type: "DAILY_MIS",
//           user: doer_name,
//           phone: wa_number,
//           department,
//           totalToday,
//           completedToday,
//           pendingToday,
//           overdue,
//           date: today
//         });

//       } catch (userErr) {
//         writeLog("error.log", {
//           source: "DAILY_MIS_USER",
//           user: doer_name,
//           error: userErr.message
//         });
//       }
//     }

//   } catch (err) {
//     writeLog("error.log", {
//       source: "DAILY_MIS_CRON",
//       error: err.message
//     });
//   }
// };



import pool from "../config/db.js";
import { sendWhatsAppTemplate } from "../utils/wati.js";
import { writeLog } from "../utils/logger.js";

/**
 * DAILY MIS REMINDER SERVICE
 * Template Name: dailymis
 */
export const runDailyReminder = async () => {
  const today = new Date().toISOString().split("T")[0];

  try {
    // 1️⃣ Fetch users with WhatsApp number
    const usersRes = await pool.query(`
      SELECT doer_name, department, wa_number
      FROM users
      WHERE wa_number IS NOT NULL
        AND wa_number <> ''
    `);

    for (const user of usersRes.rows) {
      const { doer_name, department, wa_number } = user;

      try {
        /* ---------------- TOTAL TASK (TODAY) ---------------- */
        const totalRes = await pool.query(`
          SELECT
          (
            SELECT COUNT(*) FROM checklist
            WHERE name = $1 AND task_start_date = $2
          ) +
          (
            SELECT COUNT(*) FROM delegation
            WHERE name = $1 AND planned_date = $2
          ) AS total_today
        `, [doer_name, today]);

        const totalToday = Number(totalRes.rows[0].total_today);

        /* ---------------- COMPLETED (TODAY) ---------------- */
        const completedRes = await pool.query(`
          SELECT
          (
            -- CHECKLIST (unchanged)
            SELECT COUNT(*) FROM checklist
            WHERE name = $1
              AND task_start_date = $2
              AND status = 'completed'
          ) +
          (
            -- DELEGATION (admin_reminder aware)
            SELECT COUNT(*)
            FROM delegation d
            LEFT JOIN delegation_done dd
              ON dd.task_id::int = d.id
            WHERE d.name = $1
              AND d.planned_date = $2
              AND (
                d.admin_reminder = false
                OR (
                  d.admin_reminder = true
                  AND dd.admin_status = 'DONE'
                )
              )
          ) AS completed_today
        `, [doer_name, today]);

        const completedToday = Number(completedRes.rows[0].completed_today);

        /* ---------------- PENDING (TODAY) ---------------- */
        const pendingRes = await pool.query(`
          SELECT
          (
            -- CHECKLIST (unchanged)
            SELECT COUNT(*) FROM checklist
            WHERE name = $1
              AND task_start_date = $2
              AND status = 'pending'
          ) +
          (
            -- DELEGATION (admin_reminder aware)
            SELECT COUNT(*)
            FROM delegation d
            LEFT JOIN delegation_done dd
              ON dd.task_id::int = d.id
            WHERE d.name = $1
              AND d.planned_date = $2
              AND (
                (d.admin_reminder = true AND dd.admin_status IS NULL)
                OR d.status = 'pending'
              )
          ) AS pending_today
        `, [doer_name, today]);

        const pendingToday = Number(pendingRes.rows[0].pending_today);

        /* ---------------- OVERDUE (BEFORE TODAY) ---------------- */
        const overdueRes = await pool.query(`
          SELECT
          (
            -- CHECKLIST (unchanged)
            SELECT COUNT(*) FROM checklist
            WHERE name = $1
              AND task_start_date < $2
              AND status = 'pending'
              AND actual IS NULL
          ) +
          (
            -- DELEGATION (unchanged overdue rule)
            SELECT COUNT(*) FROM delegation
            WHERE name = $1
              AND planned_date < $2
              AND status = 'pending'
              AND actual IS NULL
          ) AS overdue
        `, [doer_name, today]);

        const overdue = Number(overdueRes.rows[0].overdue);

        /* ---------------- SEND WHATSAPP ---------------- */
        await sendWhatsAppTemplate({
          phone: wa_number,
          template_name: "dailymis",
          broadcast_name: "DAILY_MIS_REMINDER",
          parameters: [
            { name: "1", value: doer_name },
            { name: "3", value: department || "-" },
            { name: "5", value: String(totalToday) },
            { name: "6", value: String(completedToday) },
            { name: "7", value: String(pendingToday) },
            { name: "8", value: String(overdue) }
          ]
        });

        /* ---------------- SUCCESS LOG ---------------- */
        writeLog("ssd_out.log", {
          type: "DAILY_MIS",
          user: doer_name,
          phone: wa_number,
          department,
          totalToday,
          completedToday,
          pendingToday,
          overdue,
          date: today
        });

      } catch (userErr) {
        writeLog("error.log", {
          source: "DAILY_MIS_USER",
          user: doer_name,
          error: userErr.message
        });
      }
    }

  } catch (err) {
    writeLog("error.log", {
      source: "DAILY_MIS_CRON",
      error: err.message
    });
  }
};
