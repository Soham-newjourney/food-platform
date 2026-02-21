const bcrypt = require("bcryptjs")

const Donor = require("../models/Donor")
const Beneficiary = require("../models/Beneficiary")
const NGO = require("../models/NGO")



const register = async (req, res) => {
    // console.log(req.body)
    console.log("REGISTER HIT")
    try {
        
        const { name, email, password, phone, role, location } = req.body

        if (!name || !email || !password || !phone || !role || !location) {
            return res.status(400).json({ message: "All fields are required" })
        }

        let Model

        if (role === "donor") {
            Model = Donor
        }
        else if (role === "beneficiary") {
            Model = Beneficiary
        }
        else if (role === "ngo") {
            Model = NGO
        }
        else {
            return res.status(400).json({ message: "Invalid role" })
        }

        const existingUser = await Model.findOne({ email })

        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = new Model({
            name,
            email,
            password: hashedPassword,
            phone,
            location
        })

        await newUser.save()

        res.status(201).json({
            message: "User registered successfully"
        })

    } catch (error) {
    console.log("ERROR REGISTER:")
    console.log(error)
    console.log(error.errors)
    res.status(500).json({ message: error.message })
}

}

const jwt = require("jsonwebtoken")
const Admin = require("../models/Admin")

const login = async (req, res) => {

    try {

        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required" })
        }

        let user = await Donor.findOne({ email })
        let role = "donor"

        if (!user) {
            user = await Beneficiary.findOne({ email })
            role = "beneficiary"
        }

        if (!user) {
            user = await NGO.findOne({ email })
            role = "ngo"
        }

        if (!user) {
            user = await Admin.findOne({ email })
            role = "admin"
        }

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" })
        }

        const token = jwt.sign(
            { id: user._id, role: role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        )

        res.status(200).json({
            token,
            role
        })

    } catch (error) {
        res.status(500).json({ message: "Server error" })
    }

}

module.exports = {
    register,
    login
}

