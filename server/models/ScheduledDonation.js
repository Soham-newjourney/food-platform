const mongoose = require("mongoose")

const scheduledDonationSchema = new mongoose.Schema(
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
    pickupDate: {
        type: Date,
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
        enum: ["scheduled", "claimed", "completed"],
        default: "scheduled"
    },
    claimedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NGO",
        default: null
    }
},
{
    timestamps: true
}
)

scheduledDonationSchema.index({ location: "2dsphere" })

module.exports = mongoose.model("ScheduledDonation", scheduledDonationSchema)