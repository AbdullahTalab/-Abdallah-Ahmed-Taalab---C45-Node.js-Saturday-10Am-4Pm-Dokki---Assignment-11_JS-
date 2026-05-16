import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import chalk from "chalk";
import { rateLimit } from "express-rate-limit";
import { dbConnection } from "./DB/connection.db.js";
import { authRouter, userRouter } from "./modules/index.js";
import { NODE_ENV, port } from "./config/config.service.js";
import { deleteUnconfirmedUsersCron } from "./utils/cronJobs.js"; 


const bootstrap = async () => {
  const app = express();

  await dbConnection();

  if (NODE_ENV === "development") {
    app.use(morgan("dev"));
  }

  app.use(helmet());
  app.use(cors());

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
      message: "Too many requests from this IP, please try again after 15 minutes."
    }
  });

  app.use(limiter);


  app.use(express.json());
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  app.get("/", (req, res) => res.send(`Welcome to Saraha API 💌`));

  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use((req, res) => {
    return res.status(404).json({ message: "Invalid application routing" });
  });

  app.use((error, req, res, next) => {
    const status = error.cause?.status ?? error.cause ?? 500;

    console.log(chalk.red.bold(`[ERROR] ${error.message}`));

    return res.status(status).json({
      error_message: status == 500 ? "Something went wrong" : error.message,
      stack: NODE_ENV == "development" ? error.stack : undefined,
    });
  });

  deleteUnconfirmedUsersCron();

  const PORT = port || 3000;
  app.listen(PORT, () => {
    console.log(
      chalk.green.bold.bgBlack(`\n🚀 Server is running smoothly on port ${PORT} in ${NODE_ENV} mode! 🚀\n`)
    );
  });
};

export default bootstrap;
