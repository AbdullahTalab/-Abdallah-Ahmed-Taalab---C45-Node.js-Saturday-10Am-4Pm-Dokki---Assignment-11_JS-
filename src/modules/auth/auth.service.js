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
  if (!user || !user.isVerified) {
    throw new Error("Invalid credentials or unverified account", {
      cause: 401,
    });
  }

  const isPasswordMatch = await argon2.verify(user.password, password);

  if (!isPasswordMatch) {
    throw new Error("Invalid credentials", { cause: 401 });
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

