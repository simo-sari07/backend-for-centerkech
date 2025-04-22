const mongoose = require("mongoose")

const locationSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: (v) => v.length === 2,
        message: (props) => `${props.value} is not a valid coordinate pair!`,
      },
    },
    hours: {
      type: String,
      required: true,
    },
    specialties: {
      type: [String],
      default: [],
    },
    image: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
)

const Location = mongoose.model("Location", locationSchema)

module.exports = Location
