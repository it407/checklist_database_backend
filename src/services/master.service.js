import pool from '../config/db.js';

export const createMasterService = async (department, given_by) => {
  const query = `
    INSERT INTO master (department, given_by, createdtime) 
    VALUES ($1, $2, NOW()) 
    RETURNING *`;
  const values = [department, given_by];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const getMasterDataService = async () => {
  const query = `
    SELECT id, department, given_by, 
           TO_CHAR(createdtime, 'DD-MM-YYYY HH24:MI') as createdtime 
    FROM master 
    ORDER BY createdtime DESC`;
  const result = await pool.query(query);
  return result.rows;
};

export const updateMasterService = async (id, department, given_by) => {
  const query = `
    UPDATE master 
    SET department = $1, given_by = $2 
    WHERE id = $3 
    RETURNING *`;
  const values = [department, given_by, id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const deleteMasterService = async (id) => {
  const query = 'DELETE FROM master WHERE id = $1 RETURNING id';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};