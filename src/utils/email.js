import nodemailer from "nodemailer";
import { EMAIL_USER, EMAIL_PASS } from "../config/config.service.js";

export const sendEmail = async (dest, message) => {
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
    subject: "Confirm your account",
    html: `
            <div style="font-family: Arial, sans-serif; text-align: center;">
                <h2>Welcome to Saraha App!</h2>
                <p>To verify your account, please use the following OTP code:</p>
                <h1 style="color: #007bff;">${message}</h1>
                <p>This code is valid for 5 minutes.</p>
            </div>
        `,
  });

  return info;
};
