import pool from "../config/db.js";

// 🔹 ADD HOLIDAY
export const addHoliday = async (date, holiday) => {
  const dayQuery = `
    SELECT TO_CHAR($1::date, 'Day') AS day
  `;

  const dayResult = await pool.query(dayQuery, [date]);
  const day = dayResult.rows[0].day.trim();

  const insertQuery = `
    INSERT INTO holiday_list (date, day, holiday)
    VALUES ($1, $2, $3)
    RETURNING *
  `;

  const { rows } = await pool.query(insertQuery, [date, day, holiday]);
  return rows[0];
};



export const getAllHolidays = async () => {
  const query = `
    SELECT 
      *
    FROM holiday_list
  `;

  const { rows } = await pool.query(query);
  return rows;
};

// 🔹 DELETE HOLIDAY
export const deleteHoliday = async (id) => {
  const query = `
    DELETE FROM holiday_list
    WHERE id = $1
  `;
  await pool.query(query, [id]);
};
