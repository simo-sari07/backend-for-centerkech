const express = require("express")
const Submission = require("../models/Submission")
const User = require("../models/User")
const { verifyToken } = require("../middleware/auth.middleware")

const router = express.Router()

// Get dashboard statistics
router.get("/dashboard/stats", verifyToken, async (req, res) => {
  try {
    // Get user statistics
    const totalUsers = await User.countDocuments()
    const activeUsers = await User.countDocuments({ isActive: true })
    const inactiveUsers = await User.countDocuments({ isActive: false })
    const students = await User.countDocuments({ role: "student" })
    const teachers = await User.countDocuments({ role: "teacher" })
    const admins = await User.countDocuments({ role: "admin" })

    // Get submission statistics
    const totalSubmissions = await Submission.countDocuments()
    const pendingSubmissions = await Submission.countDocuments({ status: "pending" })
    const contactedSubmissions = await Submission.countDocuments({ status: "contacted" })
    const enrolledSubmissions = await Submission.countDocuments({ status: "enrolled" })
    const rejectedSubmissions = await Submission.countDocuments({ status: "rejected" })

    // Get submissions by source
    const joinSubmissions = await Submission.countDocuments({ source: "join" })
    const contactSubmissions = await Submission.countDocuments({ source: "contact" })
    const servicesSubmissions = await Submission.countDocuments({ source: "services" })

    // Get recent submissions with user details
    const recentSubmissions = await Submission.find().sort({ createdAt: -1 }).limit(10).populate("user", "name email")

    res.status(200).json({
      success: true,
      data: {
        stats: {
          users: {
            total: totalUsers,
            active: activeUsers,
            inactive: inactiveUsers,
            students,
            teachers,
            admins,
          },
          submissions: {
            total: totalSubmissions,
            pending: pendingSubmissions,
            contacted: contactedSubmissions,
            enrolled: enrolledSubmissions,
            rejected: rejectedSubmissions,
            sources: {
              join: joinSubmissions,
              contact: contactSubmissions,
              services: servicesSubmissions,
            },
          },
        },
        recentSubmissions,
      },
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard statistics",
    })
  }
})

// Get admin users (admin only)
router.get("/users", verifyToken, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      data: users,
    })
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({
      success: false,
      message: "Error retrieving users",
    })
  }
})

// Create new user (admin only)
router.post("/users", verifyToken, async (req, res) => {
  try {
    const { email, password, name, role } = req.body

    // Validate input
    if (!email || !password || !name || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      })
    }

    // Create new user
    const newUser = new User({
      email,
      password,
      name,
      role,
    })

    await newUser.save()

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    })
  } catch (error) {
    console.error("Create user error:", error)
    res.status(500).json({
      success: false,
      message: "Error creating user",
    })
  }
})

module.exports = router
