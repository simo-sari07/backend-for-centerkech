const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")
const path = require("path")
const cookieParser = require("cookie-parser")
const authRoutes = require("./routes/auth.routes")
const adminRoutes = require("./routes/admin.routes")
const formRoutes = require("./routes/form.routes")
const contentRoutes = require("./routes/content.routes")
const { verifyToken } = require("./middleware/auth.middleware")

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  }),
)

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/forms", formRoutes)
app.use("/api/content", contentRoutes)
app.use("/api/admin", verifyToken, adminRoutes)

// Serve admin panel in production
if (process.env.NODE_ENV === "production") {
  app.use("/sariadmin", express.static(path.join(__dirname, "../frontend/build")))

  app.get("/sariadmin/*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/build/index.html"))
  })
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
