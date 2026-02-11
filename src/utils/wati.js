import axios from "axios";
import { writeLog } from "./logger.js";

export const sendWhatsAppTemplate = async ({
  phone,
  template_name,
  broadcast_name,
  parameters
}) => {
  const cleaned = phone.replace(/\D/g, "");
  const formattedPhone = cleaned.startsWith("91") ? cleaned : `91${cleaned}`;

  const payload = {
    template_name,
    broadcast_name,
    parameters
  };

  const url = `${process.env.WATI_BASE_URL}/api/v1/sendTemplateMessage?whatsappNumber=${formattedPhone}`;

  writeLog("wati.log", {
    step: "REQUEST",
    url,
    payload
  });

  const res = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${process.env.WATI_API_KEY}`,
      "Content-Type": "application/json"
    },
    timeout: 10000
  });

  writeLog("wati.log", {
    step: "RESPONSE",
    status: res.status,
    data: res.data
  });

  if (!res.data?.result) {
    throw new Error(res.data?.info || "WATI rejected message");
  }

  return res.data;
};
