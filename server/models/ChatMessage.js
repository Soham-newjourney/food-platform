const mongoose = require("mongoose")

const chatMessageSchema = new mongoose.Schema(
{
    roomId: {
        type: String,
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    senderRole: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    }
},
{
    timestamps: true
}
)

module.exports = mongoose.model("ChatMessage", chatMessageSchema)