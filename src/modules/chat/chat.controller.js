import { getChatHistory, startChat, saveMessage } from "./service/chat.service.js"

export const chatController = (io) => {
    io.on("connection", (socket) => {
        console.log("A user connected:", socket.id)

        socket.on("joinChat", async ({ chatId }) => {
            socket.join(chatId)
            console.log(`User joined chat: ${chatId}`)
        })

        socket.on("getChatHistory", async ({ userId, hrId }, callback) => {
            try {
                const messages = await getChatHistory({ userId, hrId })
                callback({ success: true, messages })
            } catch (error) {
                callback({ success: false, error: error.message })
            }
        })

        socket.on("startChat", async ({ hrId, userId }, callback) => {
            try {
                const chat = await startChat({ hrId, userId })
                callback({ success: true, chat })
            } catch (error) {
                callback({ success: false, error: error.message })
            }
        })

        socket.on("sendMessage", async ({ sender, receiver, text }) => {
            try {
                const message = await saveMessage({ sender, receiver, text })
                io.to(receiver).emit("newMessage", message)
                socket.emit("messageSent", message)
            } catch (error) {
                socket.emit("messageError", error.message)
            }
        })

        // Disconnect
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id)
        })
    })
}
