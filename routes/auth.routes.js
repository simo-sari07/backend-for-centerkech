const express = require("express")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const { verifyToken } = require("../middleware/auth.middleware")

const router = express.Router()

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      })
    }

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Verify password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" })

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    })

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during login",
    })
  }
})

// Logout route
router.post("/logout", (req, res) => {
  res.clearCookie("token")
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  })
})

// Get current user
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({
      success: false,
      message: "Server error getting user data",
    })
  }
})

// Create initial admin user (should be protected in production)
router.post("/setup", async (req, res) => {
  try {
    // Check if any users exist
    const userCount = await User.countDocuments()

    if (userCount > 0 && process.env.NODE_ENV === "production") {
      return res.status(403).json({
        success: false,
        message: "Setup already completed",
      })
    }

    const { email, password, name } = req.body

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      })
    }

    // Create admin user
    const newUser = new User({
      email,
      password,
      name,
      role: "admin",
    })

    await newUser.save()

    res.status(201).json({
      success: true,
      message: "Admin user created successfully",
    })
  } catch (error) {
    console.error("Setup error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during setup",
    })
  }
})

module.exports = router
