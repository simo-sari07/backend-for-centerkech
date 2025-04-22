const express = require("express")
const Submission = require("../models/Submission")
const { verifyToken } = require("../middleware/auth.middleware")

const router = express.Router()

// Submit form (public route)
router.post("/submit", async (req, res) => {
  try {
    const { name, email, tel, formation, message, source } = req.body

    // Validate required fields
    if (!name || !email || !tel || !formation || !source) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      })
    }

    // Create new submission
    const newSubmission = new Submission({
      name,
      email,
      tel,
      formation,
      message: message || "",
      source,
    })

    await newSubmission.save()

    res.status(201).json({
      success: true,
      message: "Form submitted successfully",
      data: {
        id: newSubmission._id,
      },
    })
  } catch (error) {
    console.error("Form submission error:", error)
    res.status(500).json({
      success: false,
      message: "Error submitting form",
    })
  }
})

// Get all submissions (admin only)
router.get("/", verifyToken, async (req, res) => {
  try {
    const { status, source, sort = "-createdAt", page = 1, limit = 10 } = req.query

    // Build query
    const query = {}
    if (status) query.status = status
    if (source) query.source = source

    // Count total documents
    const total = await Submission.countDocuments(query)

    // Get paginated submissions
    const submissions = await Submission.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number.parseInt(limit))

    res.status(200).json({
      success: true,
      data: {
        submissions,
        pagination: {
          total,
          page: Number.parseInt(page),
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error("Get submissions error:", error)
    res.status(500).json({
      success: false,
      message: "Error retrieving submissions",
    })
  }
})

// Get submission by ID (admin only)
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      })
    }

    res.status(200).json({
      success: true,
      data: submission,
    })
  } catch (error) {
    console.error("Get submission error:", error)
    res.status(500).json({
      success: false,
      message: "Error retrieving submission",
    })
  }
})

// Update submission status (admin only)
router.patch("/:id/status", verifyToken, async (req, res) => {
  try {
    const { status, notes } = req.body

    // Validate status
    if (!status || !["pending", "contacted", "enrolled", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      })
    }

    const submission = await Submission.findById(req.params.id)

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      })
    }

    // Update submission
    submission.status = status
    if (notes !== undefined) submission.notes = notes

    await submission.save()

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: submission,
    })
  } catch (error) {
    console.error("Update status error:", error)
    res.status(500).json({
      success: false,
      message: "Error updating status",
    })
  }
})

// Delete submission (admin only)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const submission = await Submission.findByIdAndDelete(req.params.id)

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "Submission deleted successfully",
    })
  } catch (error) {
    console.error("Delete submission error:", error)
    res.status(500).json({
      success: false,
      message: "Error deleting submission",
    })
  }
})

module.exports = router
