import pool from "../config/db.js";

export const loginService = async (username, password) => {
  const query = `
    SELECT 
      id,
      department,
      doer_name,
      password,
      role,
      page
    FROM users
    WHERE LOWER(doer_name) = LOWER($1)
    LIMIT 1
  `;

  const { rows } = await pool.query(query, [username]);

  if (rows.length === 0) return null;

  const user = rows[0];

  // ❗ plain text match (temporary)
  if (user.password !== password) return null;

  return user;
};
