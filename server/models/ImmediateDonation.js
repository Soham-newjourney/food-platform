const mongoose = require("mongoose")

const immediateDonationSchema = new mongoose.Schema(
{
    donor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Donor",
        required: true
    },
    foodDescription: {
        type: String,
        required: true
    },
    quantity: {
        type: String,
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    status: {
        type: String,
        enum: ["open", "claimed", "processing", "completed", "expired"],
        default: "open"
    },
    claimedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NGO",
        default: null
    },
    otpCode: {
        type: String
    },
    otpVerified: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        required: true
    }
},
{
    timestamps: true
}
)

immediateDonationSchema.index({ location: "2dsphere" })

module.exports = mongoose.model("ImmediateDonation", immediateDonationSchema)