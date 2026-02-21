const express = require("express")
const { protect } = require("../middleware/authMiddleware")
const {
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
} = require("../controllers/donationController")

const router = express.Router()

router.post("/immediate", protect, createImmediateDonation)

router.get("/immediate/nearby", protect, getNearbyImmediateDonations)

router.patch("/immediate/claim/:donationId", protect, claimImmediateDonation)

router.patch("/immediate/verify/:donationId", protect, verifyDonationOtp)

router.post("/scheduled", protect, createScheduledDonation)

router.get("/scheduled/nearby", protect, getNearbyScheduledDonations)

router.patch("/scheduled/claim/:donationId", protect, claimScheduledDonation)

router.get("/analytics/platform", protect, getPlatformAnalytics)

router.post("/beneficiary/request", protect, createBeneficiaryRequest)

router.get("/beneficiary/nearby", protect, getNearbyBeneficiaryRequests)

router.patch("/beneficiary/fulfill/:requestId", protect, fulfillBeneficiaryRequest)

router.get("/beneficiary/my", protect, getMyBeneficiaryRequests)

router.get("/chat/:roomId", protect, getChatHistory)

router.get("/immediate/my", protect, getMyImmediateDonations)

router.patch("/immediate/complete/:donationId", protect, completeImmediateDonation)

router.get("/scheduled/my", protect, getMyScheduledDonations)
module.exports = router