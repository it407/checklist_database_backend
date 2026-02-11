import pool from "../config/db.js";

export const getAllUsersService = async () => {
  const query = `
    SELECT 
      id,
      department,
      given_by,
      doer_name,
      password,
      role,
      page,
      email_id,
      wa_number,
      created_at
    FROM users
    ORDER BY created_at DESC
  `;

  const { rows } = await pool.query(query);
  return rows;
};



export const createUserService = async (data) => {
  const {
    department,
    given_by,
    doer_name,
    password,
    role,
    page,
    email_id,
    wa_number
  } = data;

  const query = `
    INSERT INTO users
    (department, given_by, doer_name, password, role, page, email_id, wa_number)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *
  `;

  const { rows } = await pool.query(query, [
    department,
    given_by,
    doer_name,
    password,
    role,
    page,
    email_id,
    wa_number
  ]);

  return rows[0];
};


export const updateUserService = async (id, data) => {
  const {
    department,
    given_by,
    doer_name,
    role,
    page,
    email_id,
    wa_number
  } = data;

  const query = `
    UPDATE users SET
      department = $1,
      given_by = $2,
      doer_name = $3,
      role = $4,
      page = $5,
      email_id = $6,
      wa_number = $7
    WHERE id = $8
    RETURNING *
  `;

  const { rows } = await pool.query(query, [
    department,
    given_by,
    doer_name,
    role,
    page,
    email_id,
    wa_number,
    id
  ]);

  return rows[0];
};


export const deleteUserService = async (id) => {
  await pool.query("DELETE FROM users WHERE id=$1", [id]);
  return true;
};