import * as userService from "./user.service.js";


// =============================[getProfile]
export const getProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await userService.profile(id);

    return res.status(200).json({
      success: true,
      message: "Profile Data Retrieved Successfully",
      result,
    });
  } catch (error) {
    return next(new Error(error.message, { cause: 500 }));
  }
};


// =============================[uploadCoverPictures]

export const uploadCoverPictures = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next(new Error("No images provided. Please upload cover pictures.", { cause: 400 }))
    }

    const result = await userService.uploadCoverService(req.user._id, req.files);

    return res.status(200).json({
      success: true,
      message: "Cover pictures updated successfully",
      result,
    })
  } catch (error) {
    return next(new Error(error.message, { cause: error.cause || 500 }));
  }
};


// =============================[updateProfilePic]

export const updateProfilePic = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new Error("Please select an image to upload.", { cause: 400 }))
    }

    const result = await userService.updateProfilePicService(req.user._id, req.file.path);

    return res.status(200).json({
      success: true,
      message: "Profile picture updated and old one moved to gallery",
      result,
    })
  } catch (error) {
    return next(new Error(error.message, { cause: error.cause || 500 }));
  }
};


// =============================[deleteProfilePic]

export const deleteProfilePic = async (req, res, next) => {
  try {

    const result = await userService.deleteProfilePicService(req.user._id);

    return res.status(200).json({
      success: true,
      message: "Profile picture deleted permanently from storage",
      result,
    })
  } catch (error) {
    return next(new Error(error.message, { cause: error.cause || 500 }));
  }
};


// =============================[getVisitCount]

export const getVisitCount = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (req.user.role !== "Admin") {
      return next(new Error("Access denied. Only Admin can view visit statistics", { cause: 403 }));
    }
    
    const result = await userService.getVisitStatsService(req.user.role, id);

    return res.status(200).json({
      success: true,
      message: "Visit statistics retrieved successfully",
      result,
    })
  } catch (error) {
    return next(new Error(error.message, { cause: error.cause || 500 }));
  }
};