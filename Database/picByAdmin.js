import mongoose from 'mongoose';

const picByAdminSchema = new mongoose.Schema(
  {
    campaignName: {
      type: String,
      required: [true, 'Campaign name is required'],
      trim: true,
    },
    uploadedBy: {
      type: String,
      required: [true, 'Admin email is required'],
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      default: 'admin',
      enum: ['admin', 'serviceman'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: false,
    },
    boardDetails: {
      type: String, // e.g. "Board 123 - Gulberg"
      required: false,
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    }
  },
  {
    timestamps: true,
  }
);

const PicByAdmin = mongoose.model('PicByAdmin', picByAdminSchema);

export default PicByAdmin;
