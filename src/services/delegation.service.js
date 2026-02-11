import pool from "../config/db.js";


export const insertDelegation = async (data) => {
  const {
    department,
    given_by,
    name,
    task_description,
    task_start_date,
    end_date,
    freq,
    enable_reminders,
    require_attachment,
    leave_reason,
    admin_reminder
  } = data;

  // 🔥 First-time assignment defaults
  const planned_date = task_start_date;
  const total_extend = 1;
  const color_code = "green";

  const { rows } = await pool.query(
    `
    INSERT INTO delegation (
      department,
      given_by,
      name,
      task_description,
      task_start_date,
      end_date,
      freq,
      enable_reminders,
      require_attachment,
      status,
      leave_reason,
      admin_reminder,
      planned_date,
      total_extend,
      color_code
    )
    VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,
      'pending',$10,$11,$12,$13,$14
    )
    RETURNING *
    `,
    [
      department,
      given_by,
      name,
      task_description,
      task_start_date,
      end_date,
      freq || "one-time",
      enable_reminders,
      require_attachment,
      leave_reason || null,
      admin_reminder,
      planned_date,
      total_extend,
      color_code
    ]
  );

  return rows[0];
};


export const getAllDelegations = async () => {
  const { rows } = await pool.query(`
    SELECT
      d.*,
      dd.admin_status
    FROM delegation d
    LEFT JOIN delegation_done dd
      ON dd.task_id::int = d.id
    ORDER BY d.timestamp DESC
  `);

  return rows;
};




export const updateDelegation = async (id, data) => {

  // 🔹 Get current delegation row
  const { rows: existingRows } = await pool.query(
    `SELECT total_extend, planned_date FROM delegation WHERE id = $1`,
    [id]
  );

  if (existingRows.length === 0) {
    throw new Error("Delegation not found");
  }

  let total_extend = existingRows[0].total_extend || 0;
  let color_code = "green";
  const plannedDate = existingRows[0].planned_date;

  // 🔥 Business rule (UNCHANGED)
  if (data.status === "Extend date") {
    total_extend = total_extend + 1;

    if (total_extend === 1) color_code = "green";
    else if (total_extend === 2) color_code = "yellow";
    else color_code = "red";
  }

  // 🔥 NEW: Delay calculation (only if actual present)
  if ("actual" in data && data.actual && plannedDate) {

    const actualDate = new Date(data.actual);
    const planned = new Date(plannedDate);

    const diffTime = actualDate - planned;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    data.delay = diffDays > 0 ? diffDays : 0;
  }

  // 🔹 Merge auto-calculated fields (UNCHANGED)
  const finalData = {
    ...data,
    total_extend,
    color_code
  };

  delete finalData.id; // safety

  const entries = Object.entries(finalData);

  const setClause = entries
    .map(([key], i) => `${key} = $${i + 1}`)
    .join(", ");

  const values = entries.map(([_, value]) => value);

  const { rows } = await pool.query(
    `
    UPDATE delegation
    SET ${setClause}
    WHERE id = $${values.length + 1}
    RETURNING *
    `,
    [...values, id]
  );

  return rows[0];
};





// 🔹 DELETE delegation by id
export const deleteDelegationById = async (id) => {
  const { rowCount } = await pool.query(
    `DELETE FROM delegation WHERE id = $1`,
    [id]
  );

  return rowCount;
};

// 🔹 DELETE delegation by date range (optional)
export const deleteDelegationByDateRange = async (startDate, endDate) => {
  const { rowCount } = await pool.query(
    `
    DELETE FROM delegation
    WHERE task_start_date BETWEEN $1 AND $2
    `,
    [startDate, endDate]
  );

  return rowCount;
};



// delegation.service.js
// delegation.service.js
export const moveToDelegationDone = async (data) => {
  await pool.query(
    `
    INSERT INTO delegation_done (
      task_id,
      status,
      next_extend_date,
      reason,
      upload_image,
      condition_date,
      name,
      task_description,
      given_by,
      leave_reason,
      department
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    `,
    [
      data.task_id,
      data.status,
      data.planned_date || null,
      data.remarks || null,
      data.upload_image || null,
      new Date(),
      data.name,
      data.task_description,
      data.given_by,
      data.leave_reason || null ,
      data.department || null
    ]
  );
};


export const previewDelegation = async (data) => {
  const {
    task_start_date,
    end_date,
    freq
  } = data;

  // 🔥 Delegation rule:
  // one-time = always 1 row
  if (!freq || freq === "one-time") {
    return [{
      task_start_date,
      end_date,
      freq: "one-time"
    }];
  }

  // ❌ safety: delegation should not accept recurring freq
  throw new Error("Delegation supports only one-time tasks");
};
