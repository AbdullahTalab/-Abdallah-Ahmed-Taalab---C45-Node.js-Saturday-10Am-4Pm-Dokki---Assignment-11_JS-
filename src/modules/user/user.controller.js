import * as userService from "./user.service.js";

export const getProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await userService.profile(id);

    return res.status(200).json({
      success: true,
      message: "Profile Data Retrieved",
      result,
    });
  } catch (error) {
    next(error);
  }
};