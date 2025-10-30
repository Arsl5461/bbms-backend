// models/Campaign.js
import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true // still unique for campaign name
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
      required: false
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
          return v && v.length > 0;
        },
        message: "At least one board must be selected"
      }
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price must be a positive number"]
    }
  },
  { timestamps: true }
);

export default mongoose.model("Campaign", campaignSchema);
