import mongoose from 'mongoose';

const picByServiceManSchema = new mongoose.Schema(
  {
    campaignName: {
      type: String,
      required: [true, 'Campaign name is required'],
      trim: true,
    },
    serviceManEmail: {
      type: String,
      required: [true, 'Service man email is required'],
      trim: true,
      lowercase: true,
    },
    liveLocation: {
      type: String,
      required: [true, 'Live location is required'],
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
    dateTime: {
      type: Date,
      default: Date.now,
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
    },
    sendUrl: {
      type: String,
      required: [true, 'Send URL is required'],
      trim: true,
    },
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const PicByServiceMan = mongoose.model('PicByServiceMan', picByServiceManSchema);

export default PicByServiceMan;
