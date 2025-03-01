import { Server } from "socket.io";
import { logoutSocketId, registerSocket } from "./service/auth.service.js";
import { hrSockets } from "../../DB/model/User.model.js";


export const runIo = (httpServer) => {
    const io = new Server(httpServer, { cors: '*' });

    io.on('connection', async (socket) => {
        console.log("New socket connected:", socket.id);

        await registerSocket(socket);
        await logoutSocketId(socket);

        socket.on("joinHR", ({ companyId }) => {
            socket.join(companyId);
            hrSockets.set(socket.id, companyId);
            console.log(`HR joined company room: ${companyId}`);
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.id);
            hrSockets.delete(socket.id);
        });
    });

    return io;
};



