import express from "express";
import path from "path";
import { dbConnection } from "./DB/connection.db.js";
import { authRouter, userRouter } from "./modules/index.js";
import { NODE_ENV, port } from "./config/config.service.js";

const bootstrap = async () => {
  const app = express();

  await dbConnection();

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
    return res.status(status).json({
      error_message: status == 500 ? "Something went wrong" : error.message,
      stack: NODE_ENV == "development" ? error.stack : undefined,
    });
  });

  const PORT = port || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} in ${NODE_ENV} mode 🚀`);
  });
};

export default bootstrap;
