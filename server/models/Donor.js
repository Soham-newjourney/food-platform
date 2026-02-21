const mongoose = require("mongoose")

const donorSchema = new mongoose.Schema(
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
    isSuspended: {
        type: Boolean,
        default: false
    }
},
{
    timestamps: true
}
)

donorSchema.index({ location: "2dsphere" })

module.exports = mongoose.model("Donor", donorSchema)