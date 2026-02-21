const http = require("http")
const { Server } = require("socket.io")
const express = require("express")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const cors = require("cors")
const path = require("path")
const ChatMessage = require("./models/ChatMessage")



const authRoutes = require("./routes/authRoutes")
const testRoutes = require("./routes/testRoutes")
const donationRoutes = require("./routes/donationRoutes")

dotenv.config()

const app = express()


app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/test", testRoutes)
app.use("/api/donations", donationRoutes)

app.use(express.static(path.join(__dirname, "../client")))

app.use((req, res) => {
    res.sendFile(path.join(__dirname, "../client/index.html"))
})

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB Connected")
})
.catch((err) => {
    console.log("Database connection error:")
    console.log(err.message)
})

app.get("/", (req, res) => {
    res.send("Server and Database are running")
})

const PORT = process.env.PORT || 5000

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: "*"
    }
})

server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
})

io.on("connection", (socket) => {

    console.log("User connected:", socket.id)

    socket.on("joinRoom", (roomId) => {
        socket.join(roomId)
        console.log("Joined room:", roomId)
    })

    socket.on("sendMessage", async (data) => {
        try {

            const newMessage = new ChatMessage({
                roomId: data.roomId,
                senderId: data.senderId,
                senderRole: data.senderRole,
                message: data.message
            })

            await newMessage.save()

            io.to(data.roomId).emit("receiveMessage", {
                roomId: data.roomId,
                senderId: data.senderId,
                senderRole: data.senderRole,
                message: data.message,
                createdAt: newMessage.createdAt
            })

        } catch (error) {
            console.log("Chat save error:", error)
        }

    })

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id)
    })

})