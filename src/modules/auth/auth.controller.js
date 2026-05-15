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
