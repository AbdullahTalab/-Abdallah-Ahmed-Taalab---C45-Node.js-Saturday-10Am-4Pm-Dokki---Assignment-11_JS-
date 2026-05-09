import mongoose from "mongoose";
import { DB_URL } from "../config/config.service.js"; 

export const dbConnection = async () => {
  try {
    if (!DB_URL) {
      throw new Error("DB_URL is undefined! Check your config service and .env file.");
    }

    await mongoose.connect(DB_URL);
    console.log("DB Connected Successfully 😎");
  } catch (err) {
    console.error("DB Connection Error! 😓", err.message);
    process.exit(1); 
  }
};

