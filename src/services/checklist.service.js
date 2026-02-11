import pool from "../config/db.js";
import {
  getWorkingDaysFromDate,
  getMonthlyWorkingDaysFromDate
} from "./calendar.service.js";
import {
  getWeeklyWorkingDaysFromDate,
  getFortnightlyWorkingDaysFromDate,
  getQuarterlyWorkingDaysFromDate,
  getEndOfWeekWorkingDates
} from "./calendar.service.js";


export const insertChecklist = async (data) => {
  const {
    department,
    given_by,
    name,
    task_description,
    task_start_date,
    freq,
    enable_reminders,
    require_attachment,
    admin_reminder,
    leave_reason
  } = data;

  let taskDates = [];

  if (freq === "daily") {
  taskDates = await getWorkingDaysFromDate(task_start_date);
}

else if (freq === "weekly") {
  taskDates = await getWeeklyWorkingDaysFromDate(task_start_date);
}

else if (freq === "fortnightly") {
  taskDates = await getFortnightlyWorkingDaysFromDate(task_start_date);
}

else if (freq === "monthly") {
  taskDates = await getMonthlyWorkingDaysFromDate(task_start_date);
}

else if (freq === "quarterly") {
  taskDates = await getQuarterlyWorkingDaysFromDate(task_start_date);
}

else if (freq === "yearly") {
  taskDates = [task_start_date];
}

else if (freq.startsWith("end-of-")) {
  taskDates = await getEndOfWeekWorkingDates(task_start_date, freq);
}


  if (taskDates.length === 0) {
    throw new Error("No working days found");
  }

  const insertedTasks = [];

  for (const d of taskDates) {
    const { rows } = await pool.query(
      `
      INSERT INTO checklist (
        department, given_by, name,
        task_description, task_start_date, freq,
        enable_reminders, require_attachment,
        status, admin_reminder, leave_reason
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending',$9,$10)
      RETURNING *
      `,
      [
        department,
        given_by,
        name,
        task_description,
        d,
        freq,
        enable_reminders,
        require_attachment,
        admin_reminder,
        leave_reason || null
      ]
    );

    insertedTasks.push(rows[0]);
  }

  return insertedTasks;
};


// GET all checklist rows
export const getAllChecklists = async () => {
  const { rows } = await pool.query(`
    SELECT *
    FROM checklist
    ORDER BY task_start_date ASC
  `);

  return rows;
};


// export const updateChecklist = async (id, data) => {
//   const keys = Object.keys(data);

//   if (keys.length === 0) {
//     throw new Error("No fields provided for update");
//   }

//   const setClause = keys
//     .map((key, index) => `${key} = $${index + 1}`)
//     .join(", ");

//   const values = Object.values(data);

//   const { rows } = await pool.query(
//     `
//     UPDATE checklist
//     SET ${setClause}
//     WHERE id = $${keys.length + 1}
//     RETURNING *
//     `,
//     [...values, id]
//   );

//   return rows[0];
// };


export const updateChecklist = async (id, data) => {
  // 🔹 Get existing task_start_date
  const { rows: existingRows } = await pool.query(
    `SELECT task_start_date FROM checklist WHERE id = $1`,
    [id]
  );

  if (existingRows.length === 0) {
    return null;
  }

  const taskStartDate = existingRows[0].task_start_date;

  // 🔥 If actual is coming → calculate delay
  if (data.actual) {
    const actualDate = new Date(data.actual);
    const plannedDate = new Date(taskStartDate);

    const diffTime = actualDate - plannedDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    data.delay = diffDays > 0 ? diffDays : 0; // negative delay nahi
  }

  const keys = Object.keys(data);

  if (keys.length === 0) {
    throw new Error("No fields provided for update");
  }

  const setClause = keys
    .map((key, index) => `${key} = $${index + 1}`)
    .join(", ");

  const values = Object.values(data);

  const { rows } = await pool.query(
    `
    UPDATE checklist
    SET ${setClause}
    WHERE id = $${keys.length + 1}
    RETURNING *
    `,
    [...values, id]
  );

  return rows[0];
};


// 🔹 DELETE single checklist
export const deleteChecklistById = async (id) => {
  const { rowCount } = await pool.query(
    `DELETE FROM checklist WHERE id = $1`,
    [id]
  );

  return rowCount;
};

// 🔹 DELETE by date range
export const deleteChecklistByDateRange = async (startDate, endDate) => {
  const { rowCount } = await pool.query(
    `
    DELETE FROM checklist
    WHERE task_start_date BETWEEN $1 AND $2
    `,
    [startDate, endDate]
  );

  return rowCount;
};


export const generateChecklistDates = async (data) => {
  const { task_start_date, freq } = data;

  let taskDates = [];

  if (freq === "daily") {
    taskDates = await getWorkingDaysFromDate(task_start_date);
  }

  else if (freq === "weekly") {
    taskDates = await getWeeklyWorkingDaysFromDate(task_start_date);
  }

  else if (freq === "fortnightly") {
    taskDates = await getFortnightlyWorkingDaysFromDate(task_start_date);
  }

  else if (freq === "monthly") {
    taskDates = await getMonthlyWorkingDaysFromDate(task_start_date);
  }

  else if (freq === "quarterly") {
    taskDates = await getQuarterlyWorkingDaysFromDate(task_start_date);
  }

  else if (freq === "yearly") {
    taskDates = [task_start_date];
  }

  else if (freq.startsWith("end-of-")) {
    taskDates = await getEndOfWeekWorkingDates(task_start_date, freq);
  }

  return taskDates;
};
