import {
  getAllWorkingDays,
  addWorkingDay,
  deleteWorkingDay,
} from "../services/workingDay.service.js";

// GET
export const fetchWorkingDays = async (req, res) => {
  try {
    const data = await getAllWorkingDays();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch working days",
    });
  }
};

// POST
export const createWorkingDay = async (req, res) => {
  try {
    const { working_date, day } = req.body;

    if (!working_date) {
      return res.status(400).json({
        success: false,
        message: "working_date is required",
      });
    }

    const result = await addWorkingDay(working_date, day);

    res.status(201).json({
      success: true,
      data: result,
      message: "Working day added successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to add working day",
    });
  }
};

// DELETE
export const removeWorkingDay = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteWorkingDay(id);

    res.status(200).json({
      success: true,
      message: "Working day deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to delete working day",
    });
  }
};



export const generateYearWorkingCalendar = async (req, res) => {
  try {
    // 🔹 get last working date
    const { rows } = await pool.query(
      `SELECT working_date 
       FROM working_day_calendar 
       ORDER BY working_date DESC 
       LIMIT 1`
    );

    let startDate;

    if (rows.length === 0) {
      // agar table empty hai
      startDate = new Date();
    } else {
      startDate = new Date(rows[0].working_date);
      startDate.setDate(startDate.getDate() + 1);
    }

    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);

    await pool.query(
      `
      INSERT INTO working_day_calendar (working_date, day, week_num, month)
      SELECT
        d::date,
        TO_CHAR(d, 'Day'),
        EXTRACT(WEEK FROM d)::int,
        EXTRACT(MONTH FROM d)::int
      FROM generate_series($1::date, $2::date, INTERVAL '1 day') d
      WHERE EXTRACT(DOW FROM d) <> 0
      `,
      [
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0],
      ]
    );

    res.status(201).json({
      success: true,
      message: "1 year working calendar generated successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to generate working calendar",
    });
  }
};
