import { messageModel } from "../../DB/model/index.js";
import { userModel } from "../../DB/model/index.js";

export const getMessages = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const messages = await messageModel.find({ receiverId: userId });
    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    return next(new Error(error.message));
  }
};

export const sendMessage = async (req, res, next) => {
  const { message } = req.body;
  const { receiverId } = req.params;

  const user = await userModel.findById(receiverId);
  if (!user) {
    return next(new Error("User not found!", { cause: 404 }));
  }

  const newMessage = await messageModel.create({
    message,
    receiverId,
  });

  return res.status(201).json({
    message: "Message sent successfully!🤑",
    newMessage,
  });
};
