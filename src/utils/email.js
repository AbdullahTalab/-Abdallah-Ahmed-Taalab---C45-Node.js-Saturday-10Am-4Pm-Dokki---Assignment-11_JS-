import nodemailer from "nodemailer";
import { EMAIL_USER, EMAIL_PASS } from "../config/config.service.js";

export const sendEmail = async (dest, subject,message) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: `"Saraha App 💌" <${EMAIL_USER}>`,
    to: dest,
    subject: subject,
    html: message,
  });

  return info;
};
