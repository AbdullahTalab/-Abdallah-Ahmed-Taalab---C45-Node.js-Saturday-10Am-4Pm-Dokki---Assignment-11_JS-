import argon2 from "argon2";
import { customAlphabet } from "nanoid";
import jwt from "jsonwebtoken";
import { userModel } from "../../DB/model/user.model.js";
import cloudinary from "../../utils/cloudinary.js";
import { sendEmail } from "../../utils/email.js";
import { redisClient } from "../../utils/redis.js";
import { JWT_SECRET } from "../../config/config.service.js";

// =====================[Signup]
export const signupService = async (req) => {
  const { userName, email, password, phone } = req.body;

  const isUserExist = await userModel.findOne({ email });
  if (isUserExist) {
    throw new Error("Email already exists", { cause: 409 });
  }

  const hashedPassword = await argon2.hash(password);

  let profilePic = {};
  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      { folder: `Saraha/Users/Profiles` },
    );
    profilePic = { secure_url, public_id };
  }

  const nanoid = customAlphabet("1234567890", 6);
  const otp = nanoid();

  const user = await userModel.create({
    userName,
    email,
    password: hashedPassword,
    phone,
    profilePic,
  });

  await redisClient.setEx(`otp:${email}`, 300, otp);
  await redisClient.set(`trials:${email}`, 0);

  const emailHtml = ` <div style="font-family: Arial; text-align: center;">
      <h2>Welcome to Saraha App!</h2>
      <p>Your verification code is:</p>
      <h1 style="color: #007bff;">${otp}</h1>
      <p>Valid for 5 minutes.</p>
    </div> `;

  await sendEmail(email, "Confirm your account", emailHtml);

  return { userId: user._id };
};

// =====================[Verify OTP]
export const verifyOTPService = async (data) => {
  const { email, otp } = data;

  const trials = await redisClient.incr(`trials:${email}`);
  if (trials > 3) {
    throw new Error(
      "Too many trials. You are blocked from verifying for a while.",
      { cause: 429 },
    );
  }

  const user = await userModel.findOne({ email });

  if (!user) throw new Error("User not found", { cause: 404 });
  if (user.isVerified) return { message: "Already verified" };

  const storedOtp = await redisClient.get(`otp:${email}`);
  if (!storedOtp || storedOtp !== otp) {
    throw new Error("Invalid are expired OTP", { cause: 400 });
  }

  user.isVerified = true;
  await user.save();
  await redisClient.del(`otp:${email}`);
  await redisClient.del(`trials:${email}`);

  return { message: "Account verified successfully" };
};

// =====================[Login]
export const loginService = async (data) => {
  const { email, password } = data;

  const user = await userModel.findOne({ email });
  if (!user) {
    throw new Error("Invalid credentials", { cause: 401 });
  }

  if (user.lockUntil && user.lockUntil > Date.now()) {
    const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
    throw new Error(`Your account is temporarily banned.Try again after ${remainingTime}minutes`, { cause: 403 });

  }

  if (!user.isVerified) {
    throw new Error("Please verify your account first", { cause: 401 });

  }

  const isPasswordMatch = await argon2.verify(user.password, password);

  if (!isPasswordMatch) {
    user.loginAttempts += 1;
    if (user.loginAttempts >= 5) {
      user.lockUntil = Date.now() + 5 * 60 * 1000;
      user.loginAttempts = 0;
      await user.save();
      throw new Error("Too many failed attempts. Your account has been banned for 5 minutes.", { cause: 403 });

    }

    await user.save();
    throw new Error("Invalid credentials", { cause: 401 });

  }

  user.loginAttempts = 0;
  user.lockUntil = null;
  await user.save();


  if (user.isTwoStepAuthEnabled) {
    const nanoid = customAlphabet("123456789", 6);
    const setpTwoOtp = nanoid();

    await redisClient.setEx(`2sa${user.email}`, 300, stepTwoOpt);

    await sendEmail(
      user.email,
      "Login Verification cod (2FA)",
      `<h1>Your 2-Step verification cod is :${stepTwoOtp}</h1>`
    );

    return {
      message: "2-Step verification required. Please check your email for the OTP.",
      requires2FA: true,
      email: user.email
    };

  }


  const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: "1h",
  });
  return { token };
};

// =====================[Resend OTP Service]

export const resendOtpService = async (email) => {
  const user = await userModel.findOne({ email });
  if (!user) throw new Error("User not found", { cause: 404 });

  const nanoid = customAlphabet("1234567890", 6);
  const newOtp = nanoid();

  await redisClient.setEx(`otp:${email}`, 300, newOtp);
  await redisClient.set(`trials:${email}`, 0);

  await sendEmail(email, "Resend: Confirm your account", `<h1>${newOtp}</h1>`);
  return { message: "New OTP sent to your email" };
};

// =====================[Enable Two Step Auth Service]

export const enableTwoStepAuthService = async (userId) => {
  const user = await userModel.findById(userId);
  if (!user) throw new Error("User not found", { cause: 404 });

  const nanoid = customAlphabet("1234567890", 6);
  const otp = nanoid();

  await redisClient.setEx(`enable2fa:${user.email}`, 300, otp);

  await sendEmail(user.email, "Enable 2-Step Verification", `<h1>Your activation code is: ${otp}</h1>`);
  return { message: "Activation OTP sent to your email" };

};

// =====================[Confirm Two Step Auth Service]

export const confirmTwoStepAuthService = async (userId, otp) => {
  const user = await userModel.findById(userId);
  if (!user) throw new Error("User not found", { cause: 404 });

  const storedOtp = await redisClient.get(`enable2fa:${user.email}`);
  if (!storedOtp || storedOtp !== otp) {
    throw new Error("Invalid or expired OTP code", { cause: 400 });
  }

  user.isTwoStepAuthEnabled = true;
  await user.save();
  await redisClient.del(`enable2fa:${user, email}`);

  return { message: "2-Step verification has been successfully enabled on your account" };

};


// =====================[Login Confirm 2FA Service]

export const loginConfirm2FAService = async (data) => {
  const { email, otp } = data;

  const storedOtp = await redisClient.get(`2fa:${email}`);
  if (!storedOtp || storedOtp !== otp) {
    throw new Error("Invalid or expired 2FA OTP code", { cause: 400 });
  }

  const user = await userModel.findOne({ email });
  if (!user) throw new Error("User not found", { cause: 404 });

  await redisClient.del(`2fa:${email}`);

  const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: "1h",
  });

  return { token };
};

// =====================[Update Password Service]

export const updatePasswordService = async (userId, data) => {
  const { oldPassword, newPassword } = data;

  const user = await userModel.findById(userId);
  if (!user) throw new Error("User not found", { cause: 404 });


  const isMatch = await argon2.verify(user.password, oldPassword);
  if (!isMatch) throw new Error("Old password is incorrect", { cause: 400 });

  user.password = await argon2.hash(newPassword);
  await user.save();
  return { message: "Password updated successfully" };

};


// =====================[Forget Password Request Service]

export const forgetPasswordRequestService = async (email) => {

  const user = await userModel.findOne({ email });
  if (!user) throw new Error("User not found", { cause: 404 });

  const nanoid = customAlphabet("1234567890", 6);
  const resetOtp = nanoid();

  await redisClient.setEx(`forget:${email}`, 600, resetOtp);

  await sendEmail(email, "Reset Password OTP", `<h1>Your password reset code is: ${resetOtp}</h1>`);
  return { message: "Reset code sent to your email" };
};

// =====================[Reset Password Service]

export const resetPasswordService = async (data) => {
  const { email, otp, newPassword } = data;

  const storedOtp = await redisClient.get(`forget:${email}`);
  if (!storedOtp || storedOtp !== otp) {
    throw new Error("Invalid or expired rest OTP code", { cause: 400 });
  }

  const user = await userModel.findOne({ email });
  if (!user) throw new Error("User not found", { cause: 404 });


  user.password = await argon2.hash(newPassword);
  user.loginAttempts = 0;
  user.lockUntil = null;
  await user.save();
  await redisClient.del(`forget:${email}`);

  return { message: "Password has been reset successfully. You can now login with your new password." };

};

