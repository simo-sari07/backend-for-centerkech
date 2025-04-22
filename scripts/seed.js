const mongoose = require("mongoose")
const dotenv = require("dotenv")
const User = require("../models/User")
const Location = require("../models/Location")
const Content = require("../models/Content")

// Load environment variables
dotenv.config()

// Sample data
const adminUser = {
  name: "Admin User",
  email: "admin@centerkech.com",
  password: "admin123",
  role: "admin",
}

const locations = [
  {
    id: "centre-1",
    name: "Centre Sidi Youssef Ben Ali",
    address: "Diour Chouhadaa SYBA Marrakech",
    phone: "+212 6 75 77 58 84",
    email: "contact@centerkech.com",
    coordinates: [31.606, -7.9614],
    hours: "Lun-Ven: 9h-18h, Sam: 9h-13h",
    specialties: ["Langues", "Informatique", "Mathématiques"],
    image: "https://mma.prnewswire.com/media/1888550/Center_Midnight_Logo.jpg?p=facebook",
  },
  {
    id: "centre-2",
    name: "Centre M'Hamid",
    address: "M'Hamid - Marrakech",
    phone: "+212 6 75 77 58 84",
    email: "contact@centerkech.com",
    coordinates: [31.5933, -8.0211],
    hours: "Lun-Ven: 8h30-19h, Sam: 9h-14h",
    specialties: ["Sciences", "Robotique", "Arts Plastiques"],
    image: "https://mma.prnewswire.com/media/1888550/Center_Midnight_Logo.jpg?p=facebook",
  },
  {
    id: "centre-3",
    name: "Centre Moussa Ibn Noussaire",
    address: "Av. Moussa Ibn Noussaire, SYBA",
    phone: "+212 6 75 77 58 84",
    email: "contact@centerkech.com",
    coordinates: [31.6092, -7.9587],
    hours: "Lun-Ven: 9h-20h, Sam-Dim: 10h-16h",
    specialties: ["Musique", "Théâtre", "Développement Personnel"],
    image: "https://mma.prnewswire.com/media/1888550/Center_Midnight_Logo.jpg?p=facebook",
  },
]

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err)
    process.exit(1)
  })

// Seed function
const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({})
    await Location.deleteMany({})

    console.log("Existing data cleared")

    // Create admin user
    const user = new User(adminUser)
    await user.save()
    console.log("Admin user created")

    // Create locations
    await Location.insertMany(locations)
    console.log("Locations created")

    console.log("Database seeded successfully")
    process.exit(0)
  } catch (error) {
    console.error("Error seeding database:", error)
    process.exit(1)
  }
}

// Run the seed function
seedDatabase()
