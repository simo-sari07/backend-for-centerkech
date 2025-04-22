const express = require("express")
const Content = require("../models/Content")
const Location = require("../models/Location")
const { verifyToken } = require("../middleware/auth.middleware")

const router = express.Router()

// Get all content (public)
router.get("/", async (req, res) => {
  try {
    const { type } = req.query

    const query = {}
    if (type) query.type = type

    const content = await Content.find(query)

    // Transform to key-value format
    const contentMap = {}
    content.forEach((item) => {
      contentMap[item.key] = item.data
    })

    res.status(200).json({
      success: true,
      data: contentMap,
    })
  } catch (error) {
    console.error("Get content error:", error)
    res.status(500).json({
      success: false,
      message: "Error retrieving content",
    })
  }
})

// Update content (admin only)
router.put("/:key", verifyToken, async (req, res) => {
  try {
    const { key } = req.params
    const { type, data } = req.body

    if (!type || !data) {
      return res.status(400).json({
        success: false,
        message: "Type and data are required",
      })
    }

    // Update or create content
    const content = await Content.findOneAndUpdate(
      { key },
      {
        type,
        data,
        lastUpdated: new Date(),
        updatedBy: req.user.id,
      },
      { new: true, upsert: true },
    )

    res.status(200).json({
      success: true,
      message: "Content updated successfully",
      data: content,
    })
  } catch (error) {
    console.error("Update content error:", error)
    res.status(500).json({
      success: false,
      message: "Error updating content",
    })
  }
})

// Get all locations (public)
router.get("/locations", async (req, res) => {
  try {
    const locations = await Location.find()

    res.status(200).json({
      success: true,
      data: locations,
    })
  } catch (error) {
    console.error("Get locations error:", error)
    res.status(500).json({
      success: false,
      message: "Error retrieving locations",
    })
  }
})

// Get location by ID (public)
router.get("/locations/:id", async (req, res) => {
  try {
    const location = await Location.findOne({ id: req.params.id })

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      })
    }

    res.status(200).json({
      success: true,
      data: location,
    })
  } catch (error) {
    console.error("Get location error:", error)
    res.status(500).json({
      success: false,
      message: "Error retrieving location",
    })
  }
})

// Create or update location (admin only)
router.put("/locations/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params
    const locationData = req.body

    // Validate required fields
    if (!locationData.name || !locationData.address || !locationData.coordinates) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      })
    }

    // Update or create location
    const location = await Location.findOneAndUpdate({ id }, { ...locationData, id }, { new: true, upsert: true })

    res.status(200).json({
      success: true,
      message: "Location updated successfully",
      data: location,
    })
  } catch (error) {
    console.error("Update location error:", error)
    res.status(500).json({
      success: false,
      message: "Error updating location",
    })
  }
})

// Delete location (admin only)
router.delete("/locations/:id", verifyToken, async (req, res) => {
  try {
    const location = await Location.findOneAndDelete({ id: req.params.id })

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "Location deleted successfully",
    })
  } catch (error) {
    console.error("Delete location error:", error)
    res.status(500).json({
      success: false,
      message: "Error deleting location",
    })
  }
})

module.exports = router
