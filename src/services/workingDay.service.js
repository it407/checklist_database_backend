import pool from "../config/db.js";

// GET ALL WORKING DAYS
export const getAllWorkingDays = async () => {
  const result = await pool.query(
    `SELECT * FROM working_day_calendar ORDER BY working_date ASC`
  );
  return result.rows;
};

// ADD WORKING DAY
export const addWorkingDay = async (working_date, day) => {
  const dateObj = new Date(working_date);
  const weekNum = Math.ceil(dateObj.getDate() / 7);
  const month = dateObj.getMonth() + 1;

  const result = await pool.query(
    `INSERT INTO working_day_calendar 
     (working_date, day, week_num, month)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [working_date, day, weekNum, month]
  );

  return result.rows[0];
};

// DELETE WORKING DAY
export const deleteWorkingDay = async (id) => {
  await pool.query(
    `DELETE FROM working_day_calendar WHERE id = $1`,
    [id]
  );
};




export const isWorkingDay = async (date) => {
  const { rows } = await pool.query(
    `SELECT 1 FROM working_day_calendar WHERE working_date = $1`,
    [date]
  );
  return rows.length > 0;
};

// get next available working day
export const getNextWorkingDay = async (date) => {
  let current = new Date(date);

  while (true) {
    const isoDate = current.toISOString().split("T")[0];
    const isValid = await isWorkingDay(isoDate);

    if (isValid) return isoDate;

    current.setDate(current.getDate() + 1);
  }
};