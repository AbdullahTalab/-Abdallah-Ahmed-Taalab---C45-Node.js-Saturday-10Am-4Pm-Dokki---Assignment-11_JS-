import * as authService from "./auth.service.js";

export const signup = async (req, res, next) => {
  try {
    const result = await authService.signupService(req);
    return res.status(201).json({ message: "Done", result });
  } catch (error) {
    next(error); 
  }
};

export const verifyOTP = async (req, res, next) => {
  try {
    const result = await authService.verifyOTPService(req.body);
    return res.status(200).json({ message: "Verified", result });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await authService.loginService(req.body);
    return res.status(200).json({ message: "Login Success", result });
  } catch (error) {
    next(error);
  }
};

