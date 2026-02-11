import pool from "../config/db.js";

export const getAllLeaveData = async (department = null) => {
  let params = [];
  let deptCondition = "";

  if (department) {
    params.push(department);
    deptCondition = `AND department = $${params.length}`;
  }

  const query = `
    SELECT
      id,
      timestamp,
      department,
      given_by,
      name,
      task_description,
      task_start_date,
      freq,
      leave_reason,
      'checklist' AS source
    FROM checklist
    WHERE leave_reason IS NOT NULL
      AND leave_reason <> ''
      ${deptCondition}

    UNION ALL

    SELECT
      id,
      timestamp,
      department,
      given_by,
      name,
      task_description,
      task_start_date,
      freq,
      leave_reason,
      'delegation' AS source
    FROM delegation
    WHERE leave_reason IS NOT NULL
      AND leave_reason <> ''
      ${deptCondition}

    ORDER BY task_start_date ASC
  `;

  const { rows } = await pool.query(query, params);
  return rows;
};
