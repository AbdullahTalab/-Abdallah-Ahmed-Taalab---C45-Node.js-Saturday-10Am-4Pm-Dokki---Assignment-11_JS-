import { config } from "dotenv";
import path from "path";

const mode = process.env.NODE_ENV?.trim() || "development";

const envFileName = mode === "production" ? ".env.production" : ".env.development";
const fullPath = path.resolve(process.cwd(), "src", "config", envFileName);

config({ path: fullPath });

console.log(`Checking config for: ${mode} mode 🛠️`);
console.log(`Loading file from: ${fullPath}`);

export const NODE_ENV = mode;
export const port = process.env.PORT || 3000;
export const DB_URL = process.env.DB_URL; 

export const JWT_SECRET = process.env.JWT_SECRET;
export const SALT_ROUND = Number(process.env.SALT_ROUND) || 8;
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;

export const CLOUD_NAME = process.env.CLOUD_NAME;
export const API_KEY = process.env.API_KEY;
export const API_SECRET = process.env.API_SECRET;