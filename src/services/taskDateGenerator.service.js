import { getNextWorkingDay } from "./workingDay.service.js";

export const generateTaskDates = async ({
  startDate,
  endDate,
  frequency,
}) => {
  let dates = [];
  let current = new Date(startDate);
  let end = endDate ? new Date(endDate) : null;

  const push = async (d) => {
    const wd = await getNextWorkingDay(d);
    dates.push(wd);
  };

  switch (frequency) {
    case "one-time":
      await push(current);
      break;

    case "daily":
      while (current <= end) {
        await push(current);
        current.setDate(current.getDate() + 1);
      }
      break;

    case "weekly":
      while (current <= end) {
        await push(current);
        current.setDate(current.getDate() + 7);
      }
      break;

    case "fortnightly":
      while (current <= end) {
        await push(current);
        current.setDate(current.getDate() + 14);
      }
      break;

    case "monthly":
      while (current <= end) {
        await push(current);
        current.setMonth(current.getMonth() + 1);
      }
      break;

    case "quarterly":
      while (current <= end) {
        await push(current);
        current.setMonth(current.getMonth() + 3);
      }
      break;

    case "yearly":
      while (current <= end) {
        await push(current);
        current.setFullYear(current.getFullYear() + 1);
      }
      break;

    default:
      throw new Error("Invalid frequency");
  }

  return dates;
};
