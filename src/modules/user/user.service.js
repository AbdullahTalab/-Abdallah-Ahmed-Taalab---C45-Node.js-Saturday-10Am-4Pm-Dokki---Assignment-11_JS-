import { userModel } from "../../DB/model/index.js";

/**
 * @param {String} id
 */
export const profile = async (id) => {
  const user = await userModel
    .findById(id)
    .select("-password -otpCode -otpExpireTime");

  if (!user) {
    const error = new Error("User not found! ❌");
    error.cause = { status: 404 };
    throw error;
  }

  return user;
};
