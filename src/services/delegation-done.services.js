import pool from "../config/db.js";

export const updateDelegationDoneByTaskId = async (taskId, data) => {
  const keys = Object.keys(data);

  const setClause = keys
    .map((key, i) => `${key} = $${i + 1}`)
    .join(", ");

  const values = Object.values(data);

  const { rows } = await pool.query(
    `
    UPDATE delegation_done
    SET ${setClause}
    WHERE task_id = $${keys.length + 1}
    RETURNING *
    `,
    [...values, taskId]
  );

  return rows[0];
};
