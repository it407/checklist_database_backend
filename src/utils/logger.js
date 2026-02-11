import fs from "fs";
import path from "path";

const logDir = path.join(process.cwd(), "logs");

// 🔹 ensure logs folder exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// ✅ NAMED EXPORT (important)
export const writeLog = (fileName, data) => {
  try {
    const logPath = path.join(logDir, fileName);
    const time = new Date().toISOString();

    const logData = `
[${time}]
${JSON.stringify(data, null, 2)}
-------------------------------
`;

    fs.appendFileSync(logPath, logData);
  } catch (err) {
    console.error("❌ Logger error:", err.message);
  }
};
