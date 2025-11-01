import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary with environment variables or defaults
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dkg5m3wty',
  api_key: process.env.CLOUDINARY_API_KEY || '958286362687966',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'fY51RFl3S7lhbhUq6H3ZC7voe-g',
  secure: true
});

// Log configuration status
console.log('Cloudinary Configuration:', {
  cloud_name: cloudinary.config().cloud_name,
  configured: !!cloudinary.config().api_key
});

// Export configured cloudinary instance
export default cloudinary;
