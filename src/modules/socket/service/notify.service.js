import { authentication } from "../../../middleware/socket/auth.middleware.js";
import * as dbService from '../../../DB/db.service.js';
import chatModel from "../../../DB/model/Chat.model.js";

export const sendNotificationToHR = (socket, io) => {
    socket.on('HRnotification', async (notification) => {

        const { data, valid } = await authentication({ socket });
        if (!valid) {
            return socket.emit("socket_Error", data);
        }

        const userId = data.user._id;
        const { message, receiverId, senderId, jobId, companyId } = notification;

        console.log({ userId, message, senderId, receiverId, jobId, companyId });

        const chat = await dbService.findOneAndUpdate({
            model: chatModel,
            filter: { senderId, receiverId },
            data: { $push: { messages: { message, senderId: userId } } },
        });

        if (!chat) {
            await dbService.create({
                model: chatModel,
                data: { senderId: userId, receiverId, messages: [{ message, senderId: userId }] },
            });
        }

        io.to(companyId).emit("newApplication", {
            jobId,
            companyId,
            senderId,
            message: "A new application has been submitted!",
        });

        return "Done";
    });
};
