import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dkg5m3wty',
  api_key: process.env.CLOUDINARY_API_KEY || '958286362687966',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'fY51RFl3S7lhbhUq6H3ZC7voe-g',
  secure: true
});

// Log Cloudinary configuration status
console.log("Cloudinary configuration status:", cloudinary.config().cloud_name ? "Configured ✅" : "Not configured ❌");

// Configure multer with memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG and PNG images are allowed'), false);
  }
};

// Configure multer with limits
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
}).single('image');

// Wrapper function to handle file upload and Cloudinary upload
const uploadMiddleware = (req, res, next) => {
  upload(req, res, async function(err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum size is 5MB' });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    try {
      // Convert buffer to base64
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "campaign-uploads",
        resource_type: "auto",
        transformation: [
          { quality: "auto:good" },
          { width: 1200, height: 1200, crop: "limit" }
        ]
      });

      // Add Cloudinary URL to request
      req.file.cloudinaryUrl = result.secure_url;
      next();
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return res.status(500).json({ 
        message: "Error uploading to cloud storage",
        error: error.message 
      });
    }
  });
};

export default uploadMiddleware;
