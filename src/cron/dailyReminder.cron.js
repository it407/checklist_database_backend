import cron from "node-cron";
import { runDailyReminder } from "../services/dailyReminder.service.js";

export const startDailyReminderCron = () => {
  // ⏰ Daily 9:00 AM IST
  cron.schedule(
    "0 9 * * *",
    // "*/1 * * * *",
    async () => {
      console.log("⏰ Daily WhatsApp Reminder Started");
      await runDailyReminder();
    },
    {
      timezone: "Asia/Kolkata"
    }
  );
};
