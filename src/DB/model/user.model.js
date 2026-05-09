import Joi from "joi";
import { Schema, model } from "mongoose";

  function arrayLimit(val) {
    return val.length <= 5;
  }


const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: [true, "userName is required"],
      minLength: [2, "minimum length 2 characters"],
      maxLength: [20, "maximum length 20 characters"],
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      unique: [true, "email must be unique"],
      required: [true, "email is required"],
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },

    otpCode: { type: String },
    otpExpireTime: { type: Date },
    isVerified: {
      type: Boolean,
      default: false,
    },

    publicKey: { type: String },
    privateKey: { type: String },

    profilePic: {
      secure_url: { type: String },
      public_id: { type: String },
    },

    coverPictures: {
      type: [
        {
          secure_url: String,
          public_id: String,
        },
      ],
      validate: [arrayLimit, "{PATH} exceed the limit of 5"],
    },
  },

  
  {
    timestamps: true,
  },
);

export const userModel = model("User", userSchema);
