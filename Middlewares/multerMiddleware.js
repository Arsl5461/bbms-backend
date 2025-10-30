import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dkg5m3wty',
  api_key: '958286362687966',
  api_secret: 'fY51RFl3S7lhbhUq6H3ZC7voe-g',
  secure: true
});

// Log Cloudinary configuration status
console.log("Cloudinary configuration status:", cloudinary.config().cloud_name ? "Configured ✅" : "Not configured ❌");

// Configure multer disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueFilename = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
    cb(null, uniqueFilename);
  }
});

// Create uploads directory if it doesn't exist
import fs from 'fs';
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

const fileFilter = (req, file, cb) => {
  // Check if it's an image file
  const filetypes = /jpeg|jpg|png|gif/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    return cb(new Error("Only image files are allowed!"), false);
  }
};

// Configure multer with limits
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
}).single('image');

// Wrapper function to handle file upload and Cloudinary upload
const uploadMiddleware = (req, res, next) => {
  upload(req, res, async function(err) {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    try {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "campaign-uploads",
        transformation: [{ width: 1000, height: 1000, crop: "limit" }]
      });

      // Add Cloudinary URL to request
      req.file.cloudinaryUrl = result.secure_url;
      
      // Delete local file
      fs.unlinkSync(req.file.path);
      
      next();
    } catch (error) {
      // Delete local file on error
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(500).json({ message: "Error uploading to Cloudinary" });
    }
  });
};

export default uploadMiddleware;
