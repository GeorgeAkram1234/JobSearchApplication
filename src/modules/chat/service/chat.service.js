import chatModel from "../../models/chat.model.js";
import messageModel from "../../models/message.model.js";
import userModel from "../../models/user.model.js";


export const getChatHistory = async ({ userId, hrId }) => {
    return await messageModel.find({
        $or: [
            { sender: userId, receiver: hrId },
            { sender: hrId, receiver: userId }
        ]
    }).sort({ createdAt: 1 }).populate("sender receiver", "firstName lastName email");
};

export const startChat = async ({ hrId, userId }) => {
    const hr = await userModel.findOne({ _id: hrId, role: { $in: ["hr", "admin"] } });
    if (!hr) throw new Error("Only HR or Company Owner can start a chat.");

    let chat = await chatModel.findOne({
        participants: { $all: [hrId, userId] }
    });

    if (!chat) {
        chat = await chatModel.create({ participants: [hrId, userId] });
    }

    return chat;
};


export const saveMessage = async ({ sender, receiver, text }) => {
    const message = await messageModel.create({ sender, receiver, text });
    return message.populate("sender receiver", "firstName lastName");
};
