const mongoose = require("mongoose")

const ngoSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
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
    verificationStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    complianceDocumentPath: {
        type: String
    },
    isSuspended: {
        type: Boolean,
        default: false
    }
},
{
    timestamps: true
}
)

ngoSchema.index({ location: "2dsphere" })

module.exports = mongoose.model("NGO", ngoSchema)