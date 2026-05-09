import argon2 from "argon2";
import { customAlphabet } from "nanoid";
import jwt from "jsonwebtoken";
import { userModel } from "../../DB/model/user.model.js";
import cloudinary from "../../utils/cloudinary.js";
import { sendEmail } from "../../utils/email.js";
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
      { folder: `Saraha/Users/Profiles` }
    );
    profilePic = { secure_url, public_id };
  }

  const nanoid = customAlphabet("1234567890", 6);
  const otp = nanoid();
  const otpExpireTime = new Date(Date.now() + 5 * 60 * 1000);

  const user = await userModel.create({
    userName,
    email,
    password: hashedPassword,
    phone,
    profilePic,
    otpCode: otp,
    otpExpireTime,
  });

  await sendEmail(email, otp);
  return { userId: user._id };
};

// =====================[Verify OTP]
export const verifyOTPService = async (data) => {
  const { email, otp } = data;
  const user = await userModel.findOne({ email });

  if (!user) throw new Error("User not found", { cause: 404 });
  if (user.isVerified) return { message: "Already verified" };

  if (user.otpCode !== otp || new Date() > user.otpExpireTime) {
    throw new Error("Invalid or expired OTP", { cause: 400 });
  }

  user.isVerified = true;
  user.otpCode = undefined;
  user.otpExpireTime = undefined;
  await user.save(); 
  
  return { message: "Account verified successfully" };
};

// =====================[Login]
export const loginService = async (data) => {
  const { email, password } = data;

  const user = await userModel.findOne({ email });
  if (!user || !user.isVerified) {
    throw new Error("Invalid credentials or unverified account", { cause: 401 });
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
