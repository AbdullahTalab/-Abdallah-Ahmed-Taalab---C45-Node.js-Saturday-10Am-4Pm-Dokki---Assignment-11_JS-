import Joi from "joi";

export const signupSchema = Joi.object({
  userName: Joi.string().min(3).max(20).required().messages({
    "string.empty": "Username is required",
    "string.min": "Username must be at least 3 characters",
  }),

  email: Joi.string().email().required(),
  password: Joi.string()
    .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters, include uppercase, lowercase, and numbers",
    }),
  age: Joi.number().integer().min(18).max(90),
  gender: Joi.string().valid("male", "female").default("male"),
}).required();

export const updateCoverPictureSchema = Joi.object({
  files: Joi.array()
    .items(Joi.object().required())
    .min(1)
    .max(5)
    .required()
    .messages({
      "array.min": "Please upload at least one image",
      "array.mix": "Maximum 5 images allowed, please remove some buddy!🙂",
    }),
}).required();
