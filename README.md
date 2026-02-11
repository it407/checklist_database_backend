1️⃣ USER TABLE
📌 Table: users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,

    department VARCHAR(100),
    given_by VARCHAR(100),
    doer_name VARCHAR(100),

    password TEXT NOT NULL,
    role VARCHAR(50),

    page TEXT,
    email_id VARCHAR(150) UNIQUE,
    wa_number VARCHAR(20),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

2️⃣ WORKING DAY CALENDAR
📌 Table: working_day_calendar
CREATE TABLE working_day_calendar (
    id SERIAL PRIMARY KEY,
    working_date DATE UNIQUE NOT NULL,
    day VARCHAR(20),
    week_num INTEGER,
    month INTEGER
);


📌 Generate 1 year calendar (2026)
INSERT INTO working_day_calendar (working_date, day, week_num, month)
SELECT
    d::date,
    TO_CHAR(d, 'Day'),
    EXTRACT(WEEK FROM d)::int,
    EXTRACT(MONTH FROM d)::int
FROM generate_series(
    DATE '2026-01-01',
    DATE '2027-01-01',
    INTERVAL '1 day'
) d
WHERE EXTRACT(DOW FROM d) <> 0; -- Sunday remove



3️⃣ HOLIDAY LIST
📌 Table: holiday_list
CREATE TABLE holiday_list (
    id SERIAL PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    day VARCHAR(20),
    holiday VARCHAR(200)
);


4️⃣ CHECKLIST TABLE (MAIN)
📌 Table: checklist

CREATE TABLE checklist (
    id SERIAL PRIMARY KEY,

    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    department VARCHAR(100),
    given_by VARCHAR(100),
    name VARCHAR(100),

    task_description TEXT,
    task_start_date DATE,
    freq VARCHAR(50),

    enable_reminders BOOLEAN,
    require_attachment BOOLEAN,

    actual DATE,
    delay INTEGER,
    status VARCHAR(50),
    remarks TEXT,

    uploaded_image TEXT,
    admin_reminder BOOLEAN,
    admin_status VARCHAR(50),
    leave_reason TEXT
);

🔥 Checklist Trigger (Recurring Task Generator)
🧠 Logic

Insert only first task

Trigger:

daily → next 30 working days

monthly → next 12 working months

yearly → next 1 year

🔹 Trigger Function

CREATE TRIGGER trg_generate_checklist
AFTER INSERT ON checklist
FOR EACH ROW
EXECUTE FUNCTION generate_checklist_tasks();

5️⃣ DELEGATION TABLE
📌 Table: delegation
CREATE TABLE delegation (
    id SERIAL PRIMARY KEY,

    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    task_id VARCHAR(50),

    department VARCHAR(100),
    given_by VARCHAR(100),
    name VARCHAR(100),

    task_description TEXT,
    task_start_date DATE,
    freq VARCHAR(50),

    enable_reminders BOOLEAN,
    require_attachment BOOLEAN,

    end_date DATE,
    planned_date DATE,
    actual DATE,
    delay INTEGER,

    status VARCHAR(50),
    remarks TEXT,
    upload_image TEXT,

    update_date DATE,
    total_extend INTEGER DEFAULT 0,
    color_code VARCHAR(20),
    leave_reason TEXT
);

6️⃣ DELEGATION DONE TABLE
📌 Table: delegation_done
CREATE TABLE delegation_done (
    id SERIAL PRIMARY KEY,

    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    task_id VARCHAR(50),

    status VARCHAR(50),
    next_extend_date DATE,
    reason TEXT,

    upload_image TEXT,
    condition_date DATE,

    name VARCHAR(100),
    task_description TEXT,
    given_by VARCHAR(100),
    leave_reason TEXT
);

🔥 Delegation → Delegation Done Trigger
🧠 Logic

delegation status = completed / extended

auto insert history

4️⃣ DB TRIGGER (REMINDER – MUST HAVE)

📌 Holiday insert → working day delete

CREATE OR REPLACE FUNCTION remove_working_day_on_holiday()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM working_day_calendar
    WHERE working_date = NEW.date;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_remove_working_day
AFTER INSERT ON holiday_list
FOR EACH ROW
EXECUTE FUNCTION remove_working_day_on_holiday();

5️⃣ OPTIONAL (BEST PRACTICE)

Agar admin holiday delete kare aur working day wapas chahiye:

CREATE OR REPLACE FUNCTION restore_working_day_on_holiday_delete()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO working_day_calendar (working_date, day, week_num, month)
    VALUES (
        OLD.date,
        TO_CHAR(OLD.date, 'Day'),
        EXTRACT(WEEK FROM OLD.date),
        EXTRACT(MONTH FROM OLD.date)
    )
    ON CONFLICT DO NOTHING;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_restore_working_day
AFTER DELETE ON holiday_list
FOR EACH ROW
EXECUTE FUNCTION restore_working_day_on_holiday_delete();


backend/
│
├── src/
│   ├── config/
│   │   └── db.js
│   │
│   ├── routes/
│   │   ├── user.routes.js
│   │   ├── checklist.routes.js
│   │   ├── delegation.routes.js
│   │   ├── calendar.routes.js
│   │   └── holiday.routes.js
│   │
│   ├── controllers/
│   │   ├── user.controller.js
│   │   ├── checklist.controller.js
│   │   ├── delegation.controller.js
│   │   ├── calendar.controller.js
│   │   └── holiday.controller.js
│   │
│   ├── services/
│   │   ├── user.service.js
│   │   ├── checklist.service.js
│   │   ├── delegation.service.js
│   │   ├── calendar.service.js
│   │   └── holiday.service.js
│   │
│   ├── middlewares/
│   │   ├── error.middleware.js
│   │   └── auth.middleware.js
|   |   |-- uploads.middleware.js
│   │
│   ├── utils/
│   │   └── response.js
│   │
|   |---uploads
|   |
│   ├── app.js
│   └── server.js
│
├── .env
├── package.json
└── README.md
