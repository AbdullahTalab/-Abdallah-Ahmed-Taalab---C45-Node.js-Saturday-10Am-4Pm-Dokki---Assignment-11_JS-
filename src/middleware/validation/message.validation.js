import Joi from "joi";

export const sendMessageSchema = {
  body: Joi.object({
    message: Joi.string().min(1).max(500).required().messages({
      "string.empty": "You can't send an empty message, buddy!",
      "any.required": "Message is required",
    }),
  }),
  params: Joi.object({
    receiverId:
      Joi >
      string().hex().length().required().messages({
        "string.length": "Invalid receiver ID format",
        "any.required": "Receiver ID is required",
      }),
  }),
};
