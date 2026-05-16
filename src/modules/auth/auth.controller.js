import { userModel } from "../../DB/model/user.model.js";
import * as authService from "./auth.service.js";


// =====================[signup]
export const signup = async (req, res, next) => {
  try {
    const result = await authService.signupService(req);
    return res.status(201).json({ message: "Done", result });
  } catch (error) {
    next(error);
  }
};

// =====================[verifyOTP]
export const verifyOTP = async (req, res, next) => {
  try {
    const result = await authService.verifyOTPService(req.body);
    return res.status(200).json({ message: "Verified", result });
  } catch (error) {
    next(error);
  }
};

// =====================[login]
export const login = async (req, res, next) => {
  try {
    const result = await authService.loginService(req.body);
    return res.status(200).json({ message: "Login Success", result });
  } catch (error) {
    next(error);
  }
};

// =====================[resendOtp]

export const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new Error("Email is required", { cause: 400 }));
    }

    const result = await authService.resendOtpService(email);

    return res.status(200).json({
      success: true,
      message: "A new OTP code has been sent to your email successfully",
      result
    });

  } catch (error) {
    return next(new Error(error.message, { cause: error.cause || 500 }));
  }
};

// =====================[Enable Two Step Auth]
export const enableTwoStepAuth = async (req, res, next) => {

  try {
    const result = await authService.enableTwoStepAuthService(req, userModel._id);
    return res.status(200).json({ message: "Done", result });
  } catch (error) {
    next(error);
  }
};


// =====================[Confirm Two Step Auth]

export const confirmTwoStepAuth = async (req, res, next) => {
  try {
    const result = await authService.confirmTwoStepAuthService(req.user._id, req.body.otp);
    return res.status(200).json({ message: "Done", result });
  } catch (error) {
    next(error);
  }
};

// =====================[Login Confirm 2FA]

export const loginConfirm2FA = async (req, res, next) => {
  try {
    const result = await authService.loginConfirm2FAService(req.body);
    return res.status(200).json({ message: "Login Success", result });
  } catch (error) {
    next(error);
  }
};

// =====================[Update Password]

export const updatePassword = async (req, res, next) => {
  try {
    const result = await authService.updatePasswordService(req.user._id, req.body);
    return res.status(200).json({ message: "Password updated successfully", result });
  } catch (error) {
    next(error);
  }
};

// =====================[Forget Password Request]

export const forgetPasswordRequest = async (req, res, next) => {
  try {
    const result = await authService.forgetPasswordRequestService(req.body.email);
    return res.status(200).json({ message: "Done", result });
  } catch (error) {
    next(error);
  }
};

// =====================[Reset Password]

export const resetPassword = async (req, res, next) => {
  try {
    const result = await authService.resetPasswordService(req.body);
    return res.status(200).json({ message: "Done", result });
  } catch (error) {
    next(error);
  }
};