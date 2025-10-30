import mongoose from 'mongoose';

const BoardsSchema = new mongoose.Schema({
  BoardNo: {
    type: String,
    required: true,
    unique: true // prevents duplicates
  },
  Type: {
    type: String,
    enum: ['backlit', 'frontlit'],
    required: true
  },
  Location: {
    type: String,
    required: true,
  },
  Latitude: {
    type: Number,
    required: true
    // unique: false (removed unique constraint if present)
  },
  Longitude: {
    type: Number,
    required: true
    // unique: false (removed unique constraint if present)
  },
  City: {
    type: String,
    required: true
  },
  CreatedAt: {
    type: Date,
    default: Date.now
  },
  UpdatedAt: {
    type: Date,
    default: Date.now
  },
  Height: {
    type: Number,
    required: true
  },
  Width: {
    type: Number,
    required: true
  }
});

// Automatically update `UpdatedAt` before each save
BoardsSchema.pre('save', function (next) {
  this.UpdatedAt = new Date();
  next();
});

const BoardsModel = mongoose.model('Board', BoardsSchema);

export default BoardsModel;
