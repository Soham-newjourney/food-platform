const ImmediateDonation = require("../models/ImmediateDonation")
const ScheduledDonation = require("../models/ScheduledDonation")
const BeneficiaryRequest = require("../models/BeneficiaryRequest")
const Donor = require("../models/Donor")
const NGO = require("../models/NGO")

function calculateDistance(lat1, lon1, lat2, lon2) {

    const R = 6371

    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
}

const createImmediateDonation = async (req, res) => {

    try {

        if (req.user.role !== "donor") {
            return res.status(403).json({ message: "Only donors can create donations" })
        }

        const { foodDescription, quantity, location } = req.body

        if (!foodDescription || !quantity || !location) {
            return res.status(400).json({ message: "All fields are required" })
        }

        if (
            location.type !== "Point" ||
            !Array.isArray(location.coordinates) ||
            location.coordinates.length !== 2 ||
            location.coordinates.some(coord =>
                coord === null || coord === undefined || isNaN(coord)
            )
        ) {
            return res.status(400).json({
                message: "Invalid location coordinates"
            })
        }

        const expiryTime = new Date()
        expiryTime.setHours(expiryTime.getHours() + 3)

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString()

        const donation = new ImmediateDonation({
            donor: req.user.id,
            foodDescription,
            quantity,
            location,
            expiresAt: expiryTime,
            otpCode
        })

        await donation.save()

        res.status(201).json({
            message: "Immediate donation created",
            donationId: donation._id
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server error" })
    }

}

// const createImmediateDonation = async (req, res) => {
// console.log("NEARBY API HIT")
//     try {

//         if (req.user.role !== "donor") {
//             return res.status(403).json({ message: "Only donors can create donations" })
//         }

//         if (
//             !req.body.location ||
//             req.body.location.type !== "Point" ||
//             !Array.isArray(req.body.location.coordinates) ||
//             req.body.location.coordinates.length !== 2 ||
//             req.body.location.coordinates.some(coord => 
//                 coord === null || coord === undefined || isNaN(coord)
//             )
//         ) {
//             return res.status(400).json({
//                 message: "Invalid location coordinates"
//             })
//         }

//         const { foodDescription, quantity, location } = req.body

//         if (!foodDescription || !quantity || !location) {
//             return res.status(400).json({ message: "All fields are required" })
//         }

//         const expiryTime = new Date()
//         expiryTime.setHours(expiryTime.getHours() + 3)

//         const otpCode = Math.floor(100000 + Math.random() * 900000).toString()

//         const donation = new ImmediateDonation({
//             donor: req.user.id,
//             foodDescription,
//             quantity,
//             location,
//             expiresAt: expiryTime,
//             otpCode: otpCode
//         })

//         await donation.save()

//         res.status(201).json({
//             message: "Immediate donation created",
//             donationId: donation._id
//         })

//     } catch (error) {
//         console.log(error)
//         res.status(500).json({ message: "Server error" })
//     }

// }

const getNearbyImmediateDonations = async (req, res) => {

    try {

        if (req.user.role !== "ngo") {
            return res.status(403).json({ message: "Only NGOs can view donations" })
        }

        const { longitude, latitude } = req.query

        if (!longitude || !latitude) {
            return res.status(400).json({ message: "Location required" })
        }
        await ImmediateDonation.updateMany(
            {
                status: "open",
                expiresAt: { $lte: new Date() }
            },
            {
                status: "expired"
            }
        )
        const donations = await ImmediateDonation.find({
            status: "open",
            expiresAt: { $gt: new Date() },
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [
                            parseFloat(longitude),
                            parseFloat(latitude)
                        ]
                    }
                }
            }
        })
        .limit(10)
        .populate("donor", "name phone")

                const nearbyDonations = donations.map(d => {

                const donationLat = d.location.coordinates[1]
                const donationLon = d.location.coordinates[0]

                const distance = calculateDistance(
                    latitude,
                    longitude,
                    donationLat,
                    donationLon
                )

                return {
                    ...d.toObject(),
                    distance: distance.toFixed(2)
                }
                })

        res.status(200).json(donations)

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server error" })
    }

}

const claimImmediateDonation = async (req, res) => {

    try {

        if (req.user.role !== "ngo") {
            return res.status(403).json({ message: "Only NGOs can claim donations" })
        }

        const { donationId } = req.params

        const donation = await ImmediateDonation.findOneAndUpdate(
            {
                _id: donationId,
                status: "open",
                expiresAt: { $gt: new Date() }
            },
            {
                status: "claimed",
                claimedBy: req.user.id
            },
            { new: true }
        )

        if (!donation) {
            return res.status(400).json({ message: "Donation not available" })
        }

        res.status(200).json({
            message: "Donation claimed successfully",
            donationId: donation._id
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server error" })
    }

}

const verifyDonationOtp = async (req, res) => {

    try {

        if (req.user.role !== "ngo") {
            return res.status(403).json({ message: "Only NGOs can verify OTP" })
        }

        const { donationId } = req.params
        const { otp } = req.body

        if (!otp) {
            return res.status(400).json({ message: "OTP required" })
        }

        const donation = await ImmediateDonation.findById(donationId)

        if (!donation) {
            return res.status(404).json({ message: "Donation not found" })
        }

        if (donation.claimedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized for this donation" })
        }

        if (donation.status !== "claimed") {
            return res.status(400).json({ message: "Donation not in claim state" })
        }

        if (donation.otpCode !== otp) {
            return res.status(400).json({ message: "Invalid OTP" })
        }

        donation.status = "completed"
        donation.otpVerified = true

        await donation.save()

        res.status(200).json({
            message: "Donation completed successfully"
        })

        donation.status = "processing"
        donation.claimedBy = req.user.id
        await donation.save()

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server error" })
    }

}

const createScheduledDonation = async (req, res) => {

    try {

        if (req.user.role !== "donor") {
            return res.status(403).json({ message: "Only donors can create scheduled donations" })
        }

        const { foodDescription, quantity, pickupDate, location } = req.body

        if (!foodDescription || !quantity || !pickupDate || !location) {
            return res.status(400).json({ message: "All fields are required" })
        }

        const donation = new ScheduledDonation({
            donor: req.user.id,
            foodDescription,
            quantity,
            pickupDate,
            location
        })

        await donation.save()

        res.status(201).json({
            message: "Scheduled donation created",
            donationId: donation._id
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server error" })
    }

}

const getNearbyScheduledDonations = async (req, res) => {

    try {

        if (req.user.role !== "ngo") {
            return res.status(403).json({ message: "Only NGOs can view scheduled donations" })
        }

        const { longitude, latitude } = req.query

        if (!longitude || !latitude) {
            return res.status(400).json({ message: "Location required" })
        }

        const donations = await ScheduledDonation.find({
            status: "scheduled",
            pickupDate: { $gte: new Date() },
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [
                            parseFloat(longitude),
                            parseFloat(latitude)
                        ]
                    }
                }
            }
        })
        .limit(10)
        .populate("donor", "name phone")

        res.status(200).json(donations)

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server error" })
    }

}

const claimScheduledDonation = async (req, res) => {

    try {

        if (req.user.role !== "ngo") {
            return res.status(403).json({ message: "Only NGOs can claim scheduled donations" })
        }

        const { donationId } = req.params

        const donation = await ScheduledDonation.findOneAndUpdate(
            {
                _id: donationId,
                status: "scheduled",
                pickupDate: { $gte: new Date() }
            },
            {
                status: "claimed",
                claimedBy: req.user.id
            },
            { new: true }
        )

        if (!donation) {
            return res.status(400).json({ message: "Donation not available" })
        }

        res.status(200).json({
            message: "Scheduled donation claimed",
            donationId: donation._id
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server error" })
    }

}

const getPlatformAnalytics = async (req, res) => {

    try {

        const totalImmediate = await ImmediateDonation.countDocuments()
        const totalScheduled = await ScheduledDonation.countDocuments()

        const completedImmediate = await ImmediateDonation.countDocuments({
            status: "completed"
        })

        const completedScheduled = await ScheduledDonation.countDocuments({
            status: "completed"
        })

        const activeImmediate = await ImmediateDonation.countDocuments({
            status: { $in: ["open", "claimed"] }
        })

        const activeScheduled = await ScheduledDonation.countDocuments({
            status: { $in: ["scheduled", "claimed"] }
        })

        const totalDonors = await Donor.countDocuments()
        const totalNgos = await NGO.countDocuments()

        res.status(200).json({
            totalImmediate,
            totalScheduled,
            completedImmediate,
            completedScheduled,
            activeImmediate,
            activeScheduled,
            totalDonors,
            totalNgos
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server error" })
    }

}

const createBeneficiaryRequest = async (req, res) => {

    try {

        if (req.user.role !== "beneficiary") {
            return res.status(403).json({ message: "Only beneficiaries can create requests" })
        }

        const { description, quantityNeeded, location } = req.body

        if (!description || !quantityNeeded || !location) {
            return res.status(400).json({ message: "All fields are required" })
        }

        const request = new BeneficiaryRequest({
            beneficiary: req.user.id,
            description,
            quantityNeeded,
            location
        })

        await request.save()

        res.status(201).json({
            message: "Request created successfully",
            requestId: request._id
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server error" })
    }

}

const getNearbyBeneficiaryRequests = async (req, res) => {

    try {

        if (req.user.role !== "ngo") {
            return res.status(403).json({ message: "Only NGOs can view beneficiary requests" })
        }

        const { longitude, latitude } = req.query

        if (!longitude || !latitude) {
            return res.status(400).json({ message: "Location required" })
        }

        const requests = await BeneficiaryRequest.find({
            status: "open",
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [
                            parseFloat(longitude),
                            parseFloat(latitude)
                        ]
                    }
                }
            }
        })
        .limit(10)
        .populate("beneficiary", "name phone")

        res.status(200).json(requests)

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server error" })
    }

}

const fulfillBeneficiaryRequest = async (req, res) => {

    try {

        if (req.user.role !== "ngo") {
            return res.status(403).json({ message: "Only NGOs can fulfill requests" })
        }

        const { requestId } = req.params

        const request = await BeneficiaryRequest.findOneAndUpdate(
            {
                _id: requestId,
                status: "open"
            },
            {
                status: "fulfilled",
                fulfilledBy: req.user.id
            },
            { new: true }
        )

        if (!request) {
            return res.status(400).json({ message: "Request not available" })
        }

        res.status(200).json({
            message: "Request fulfilled successfully",
            requestId: request._id
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server error" })
    }

}

const getMyBeneficiaryRequests = async (req, res) => {

    try {

        if (req.user.role !== "beneficiary") {
            return res.status(403).json({ message: "Unauthorized" })
        }

        const requests = await BeneficiaryRequest.find({
            beneficiary: req.user.id
        })

        res.status(200).json(requests)

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server error" })
    }

}

const ChatMessage = require("../models/ChatMessage")

const getChatHistory = async (req, res) => {

    try {

        const { roomId } = req.params

        const messages = await ChatMessage.find({ roomId })
            .sort({ createdAt: 1 })

        res.status(200).json(messages)

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server error" })
    }

}

const getMyImmediateDonations = async (req, res) => {

    try {

        if (req.user.role !== "donor") {
            return res.status(403).json({ message: "Unauthorized" })
        }

        const donations = await ImmediateDonation.find({
            donor: req.user.id
        }).sort({ createdAt: -1 })

        res.status(200).json(donations)

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server error" })
    }

}

const completeImmediateDonation = async (req, res) => {

    try {

        const { donationId } = req.params

        const donation = await ImmediateDonation.findById(donationId)

        if (!donation) {
            return res.status(404).json({ message: "Donation not found" })
        }

        if (donation.status !== "processing") {
            return res.status(400).json({ message: "Donation not in processing state" })
        }

        donation.status = "completed"
        donation.otpVerified = true

        await donation.save()

        res.status(200).json({ message: "Donation completed successfully" })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server error" })
    }

}

const getMyScheduledDonations = async (req, res) => {

    try {

        if (req.user.role !== "donor") {
            return res.status(403).json({ message: "Unauthorized" })
        }

        const donations = await ScheduledDonation.find({
            donor: req.user.id
        }).sort({ createdAt: -1 })

        res.status(200).json(donations)

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server error" })
    }

}

module.exports = {
    createImmediateDonation,
    getNearbyImmediateDonations,
    claimImmediateDonation,
    verifyDonationOtp,
    createScheduledDonation,
    getNearbyScheduledDonations,
    claimScheduledDonation,
    getPlatformAnalytics,
    createBeneficiaryRequest,
    getNearbyBeneficiaryRequests,
    fulfillBeneficiaryRequest,
    getMyBeneficiaryRequests,
    getChatHistory,
    getMyImmediateDonations,
    completeImmediateDonation,
    getMyScheduledDonations,
}