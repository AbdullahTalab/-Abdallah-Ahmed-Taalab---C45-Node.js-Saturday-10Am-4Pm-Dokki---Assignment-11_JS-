import jwt from "jsonwebtoken";
import { userModel } from "../DB/model/index.js";
import { JWT_SECRET } from "../config/config.service.js";

export const isAuth = async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization || !authorization.toLowerCase().startsWith("bearer ")) {
      return next(
        new Error("Please login first (Token missing)", {
          cause: { status: 401 },
        }),
      );
    }

    const token = authorization.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await userModel.findById(decoded.id);
    if (!user) {
      return next(
        new Error("User no longer exists", { cause: { status: 404 } }),
      );
    }

    req.user = user;
    next();
  } catch (error) {
    return next(
      new Error("Invalid or expired token", { cause: { status: 401 } }),
    );
  }
};