// models/Campaign.js
import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    // Explicitly define the fields we want
    name: {
      type: String,
      required: true,
      unique: true
    },
    clientName: {
      type: String,
      required: true
    },
    clientEmail: {
      type: String,
      required: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
    },
    serviceManEmail: {
      type: [String],
      required: false,
      default: []
    },
    city: {
      type: String,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    noOfBoards: {
      type: Number,
      required: true
    },
    selectedBoards: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Board"
        }
      ],
      validate: {
        validator: function(v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "At least one board must be selected"
      }
    },
    price: {
      type: Number,
      default: 0,
      min: [0, "Price cannot be negative"]
    }
  },
  { timestamps: true }
);

export default mongoose.model("Campaign", campaignSchema);
