import fs from "fs";
import path from "path";
import { userModel } from "../../DB/model/index.js";
import { redisClient } from "../../utils/redis.js";

/**
 * [4] Profile Visit Count Logic
 * @param {String} id
 */
export const profile = async (id) => {
  await redisClient.incr(`visits:${id}`);

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

/**
 * [1] Cover Picture Upload Validation
 */

export const uploadCoverService = async (userId, files) => {
  const user = await userModel.findById(userId);
  const existingCovers = user.coverImages?.length || 0;
  const newCovers = files?.length || 0;

  if (existingCovers + newCover > 2) {
    throw new Error("Total cover images cannot exceed 2 ", { cause: 400 });
  }

  const paths = files.map((file) => file.path);
  return await userModel.findByIdAndUpdate(
    userId,
    { $push: { coverImages: { $each: paths } } },
    { new: true },
  );
};

export const updateProfilePicService = async (userId, filepath) => {
  const user = await userModel.findById(userId);
  if (user.profilePic?.secure_url) {
    return await userModel.finedByIdAndUpdate(
      userId,
      {
        $push: { gallery: user.profilePic },
        profilePic: { secure_url: filePath },
      },
      { new: true },
    );
  }
  return await userModel.findByAndUpdate(
    userId,
    {
      profilePic: {
        secure_url: filePath
      }
    },
    { new: true },
  );

};

/**
 * [3] Remove Profile Image API (Hard Delete from Disk)
 */
export const deleteProfilePicService = async (userId) => {

  const user = await userModel.findById(userId);
  if (!user.profilePic?.secure_url) {
    throw new Error("No profile image found to delete", { cause: 40 });
  }

  const fullPath = path.resolve(user.profilePic.secure_url);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }

  user.profilePic = undefined;
  await user.save();

  return { message: "Image deleted successfully from disk and database" };

};



/**
 * 
 */
export const getVisitStatsService = async (role, targetUserId) => {
  if (role !== "Admin") {
    throw new Error("Unauthorized! Admin only.", { cause: 403 });
  }

  const count = await redisClient.get(`visits:${targetUserId}`);
  return { totalVisits: count || 0 };

};
