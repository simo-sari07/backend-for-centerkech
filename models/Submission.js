const mongoose = require("mongoose")

const submissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    tel: {
      type: String,
      required: true,
      trim: true,
    },
    formation: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      default: "",
    },
    source: {
      type: String,
      enum: ["join", "contact", "services"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "contacted", "enrolled", "rejected"],
      default: "pending",
    },
    notes: {
      type: String,
      default: "",
    },
    contactedAt: {
      type: Date,
      default: null,
    },
    // Relation with User model
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Update the updatedAt field before saving
submissionSchema.pre("save", function (next) {
  this.updatedAt = new Date()

  // Set contactedAt when status changes to contacted
  if (this.isModified("status") && this.status === "contacted" && !this.contactedAt) {
    this.contactedAt = new Date()
  }

  next()
})

const Submission = mongoose.model("Submission", submissionSchema)

module.exports = Submission
