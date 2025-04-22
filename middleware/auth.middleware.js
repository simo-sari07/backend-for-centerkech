const jwt = require("jsonwebtoken")

// Verify JWT token middleware
const verifyToken = (req, res, next) => {
  try {
    // Get token from cookie or authorization header
    const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(" ")[1])

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded

    next()
  } catch (error) {
    console.error("Token verification error:", error)
    res.status(401).json({
      success: false,
      message: "Invalid token",
    })
  }
}

module.exports = { verifyToken }
