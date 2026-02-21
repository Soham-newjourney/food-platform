const mongoose = require("mongoose")

const beneficiaryRequestSchema = new mongoose.Schema(
{
    beneficiary: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Beneficiary",
        required: true
    },
    description: {
        type: String,
        required: true
    },
    quantityNeeded: {
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
        enum: ["open", "fulfilled"],
        default: "open"
    },
    fulfilledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NGO",
        default: null
    }
},
{
    timestamps: true
}
)

beneficiaryRequestSchema.index({ location: "2dsphere" })

module.exports = mongoose.model("BeneficiaryRequest", beneficiaryRequestSchema)