import joi from "joi";

const emailRegex = /^[a-zA-Z]{1,}\d{0,}[a-zA-Z0-9]{1,}[@][a-z]{1,}(\.com|\.edu|\.net){1,3}$/;
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
const phoneRegex = /^(002|\+2)?01[0125][0-9]{8}$/;

export const signupSchema = {
  body: joi.object({
    userName: joi.string().min(2).max(20).required(),
    email: joi.string().regex(emailRegex).required().messages({
      "string.pattern.base": "Email format is invalid.",
    }),
    password: joi.string().regex(passwordRegex).required().messages({
        "string.pattern.base": "Password must be 8+ chars, with upper, lower, and numbers",
    }),
    confirmPassword: joi.string().valid(joi.ref("password")).required(),
    phone: joi.string().regex(phoneRegex).required(),
  }).required(),
  
  
  file: joi.object().required() 
};