import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";


import userRoutes from "./routes/user.routes.js";
import checklistRoutes from "./routes/checklist.routes.js";
import createDelegation from "./routes/delegation.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import authRoutes from "./routes/auth.routes.js";

import delegationDone from "./routes/delegation-done.routes.js"
import Holiday from "./routes/holiday.routes.js"
import workingDayRoutes from "./routes/workingDay.routes.js";
import leaveRoutes from "./routes/leave.routes.js";

import { startDailyReminderCron } from "./cron/dailyReminder.cron.js";
import masterRoutes from './routes/master.routes.js';




const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// app.use(helmet());
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(cors({
  origin: "*", // temporary for testing
}));


app.use(compression());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});



app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/checklist", checklistRoutes);
app.use("/api/delegation", createDelegation);
app.use("/api/delegation-done", delegationDone);
app.use("/api/holiday", Holiday);
app.use("/api/working-day", workingDayRoutes);


app.use("/api/upload", uploadRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/leave", leaveRoutes);
app.use('/api/master', masterRoutes);

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// static serve (important)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// 🔥 cron start
startDailyReminderCron();


export default app;
