import pool from "../config/db.js";

export const getWorkingDaysFromDate = async (startDate) => {
  const { rows } = await pool.query(
    `
    SELECT working_date
    FROM working_day_calendar
    WHERE working_date >= $1
    ORDER BY working_date
    `,
    [startDate]
  );

  return rows.map(r => r.working_date);
};

export const getMonthlyWorkingDaysFromDate = async (startDate) => {
  const { rows } = await pool.query(
    `
    SELECT DISTINCT ON (month) working_date
    FROM working_day_calendar
    WHERE working_date >= $1
    ORDER BY month, working_date
    `,
    [startDate]
  );

  return rows.map(r => r.working_date);
};


export const getWeeklyWorkingDaysFromDate = async (startDate) => {
  const { rows } = await pool.query(`
    SELECT working_date
    FROM working_day_calendar
    WHERE working_date >= $1
    AND EXTRACT(DOW FROM working_date) = EXTRACT(DOW FROM $1::date)
    ORDER BY working_date
  `, [startDate]);

  return rows.map(r => r.working_date);
};


export const getFortnightlyWorkingDaysFromDate = async (startDate) => {
  const { rows } = await pool.query(`
    SELECT working_date
    FROM (
      SELECT working_date,
      ROW_NUMBER() OVER (ORDER BY working_date) rn
      FROM working_day_calendar
      WHERE working_date >= $1
    ) t
    WHERE (rn - 1) % 14 = 0
    ORDER BY working_date
  `, [startDate]);

  return rows.map(r => r.working_date);
};


export const getQuarterlyWorkingDaysFromDate = async (startDate) => {
  const { rows } = await pool.query(`
    SELECT DISTINCT ON (
      EXTRACT(YEAR FROM working_date),
      CEIL(EXTRACT(MONTH FROM working_date) / 3)
    ) working_date
    FROM working_day_calendar
    WHERE working_date >= $1
    ORDER BY
      EXTRACT(YEAR FROM working_date),
      CEIL(EXTRACT(MONTH FROM working_date) / 3),
      working_date
  `, [startDate]);

  return rows.map(r => r.working_date);
};


export const getEndOfWeekWorkingDates = async (startDate, weekType) => {
  const { rows } = await pool.query(`
    SELECT working_date
    FROM working_day_calendar
    WHERE working_date >= $1
  `, [startDate]);

  const map = {};
  rows.forEach(r => {
    const d = new Date(r.working_date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    map[key] ??= [];
    map[key].push(d);
  });

  const result = [];

  Object.values(map).forEach(days => {
    const weeks = [];
    let w = [];

    days.forEach(d => {
      if (d.getDay() === 1 && w.length) {
        weeks.push(w);
        w = [];
      }
      w.push(d);
    });
    if (w.length) weeks.push(w);

    let index =
      weekType === "end-of-last-week" ? weeks.length - 1 :
      weekType === "end-of-1st-week" ? 0 :
      weekType === "end-of-2nd-week" ? 1 :
      weekType === "end-of-3rd-week" ? 2 :
      3;

    if (weeks[index]) {
      result.push(weeks[index][weeks[index].length - 1]);
    }
  });

  return result;
};
