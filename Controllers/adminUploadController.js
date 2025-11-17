import PicByAdmin from '../Database/picByAdmin.js';
import PicByServiceMan from '../Database/picByServiceManModel.js';
import CampaignModel from '../Database/campaignsModel.js';
import cloudinary from '../config/cloudinary.js';

export const uploadCampaignImage = async (req, res) => {
  try {
    const { campaignId, location, city, latitude, longitude } = req.body;
    const adminEmail = req.user?.email;

    // Validate request
    if (!adminEmail) {
      return res.status(401).json({ 
        success: false, 
        message: "Admin email not found in request" 
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "No image file provided" 
      });
    }

    if (!campaignId) {
      return res.status(400).json({ 
        success: false,
        message: "Campaign ID is required" 
      });
    }

    // Find campaign
    const campaign = await CampaignModel.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ 
        success: false,
        message: "Campaign not found" 
      });
    }

    // Get Cloudinary URL from middleware
    const cloudinaryUrl = req.file.cloudinaryUrl;
    if (!cloudinaryUrl) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload image to cloud storage"
      });
    }

    // Create new admin upload record with correct field names
    const newUpload = new PicByAdmin({
      campaign: campaignId,
      campaignName: campaign.title || campaign.name || 'Unknown Campaign',
      uploadedBy: adminEmail,
      role: 'admin',
      location: location || 'Unknown',
      city: city || campaign.city || 'Unknown',
      latitude: parseFloat(latitude || 0),
      longitude: parseFloat(longitude || 0),
      imageUrl: cloudinaryUrl
    });

    await newUpload.save();

    res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        _id: newUpload._id,
        imageUrl: newUpload.imageUrl,
        location: newUpload.location,
        uploadedDate: newUpload.uploadDate
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false,
      message: "Error uploading image",
      error: error.message 
    });
  }
};

export const getCampaignImages = async (req, res) => {
  try {
    const { campaignId } = req.params;

    if (!campaignId) {
      return res.status(400).json({ 
        success: false,
        message: "Campaign ID is required" 
      });
    }

    // Verify campaign exists
    const campaign = await CampaignModel.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ 
        success: false,
        message: "Campaign not found" 
      });
    }

    console.log('Fetching images for campaign:', campaignId);

    // Get admin uploads
    const adminUploads = await PicByAdmin.find({ campaign: campaignId }).lean();
    console.log('Found admin uploads:', adminUploads.length);

    // Get serviceman uploads
    const servicemanUploads = await PicByServiceMan.find({ campaign: campaignId }).lean();
    console.log('Found serviceman uploads:', servicemanUploads.length);

    // Transform admin uploads
    const processedAdminUploads = adminUploads.map(upload => ({
      _id: upload._id,
      imageUrl: upload.imageUrl || upload.url || '',
      uploadedAt: upload.uploadedAt || upload.createdAt || new Date(),
      role: 'admin',
      uploadedBy: upload.adminEmail || 'Admin',
      location: upload.location || '',
      coordinates: upload.coordinates || null
    }));

    // Transform serviceman uploads
    const processedServicemanUploads = servicemanUploads.map(upload => ({
      _id: upload._id,
      imageUrl: upload.imageUrl || upload.url || '',
      uploadedAt: upload.uploadedAt || upload.createdAt || new Date(),
      role: 'serviceman',
      uploadedBy: upload.serviceManEmail || 'Unknown Serviceman',
      location: upload.location || '',
      coordinates: upload.coordinates || null
    }));

    // Combine and sort all uploads
    const allImages = [...processedAdminUploads, ...processedServicemanUploads]
      .filter(img => img.imageUrl) // Only include images with valid URLs
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    console.log('Total processed images:', allImages.length);

    return res.status(200).json({
      success: true,
      message: allImages.length > 0 ? 'Images retrieved successfully' : 'No images found for this campaign',
      data: allImages
    });

  } catch (error) {
    console.error('Error fetching campaign images:', error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching campaign images",
      error: error.message 
    });
  }
};

export const deleteCampaignImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    
    if (!imageId) {
      return res.status(400).json({ 
        success: false,
        message: "Image ID is required" 
      });
    }

    // Try to find and delete the image from admin uploads first
    const deletedAdminImage = await PicByAdmin.findByIdAndDelete(imageId);
    
    if (!deletedAdminImage) {
      // If not found in admin uploads, try serviceman uploads
      const deletedServicemanImage = await PicByServiceMan.findByIdAndDelete(imageId);
      
      if (!deletedServicemanImage) {
        return res.status(404).json({ 
          success: false,
          message: "Image not found" 
        });
      }
    }

    // Get the image that was deleted (either admin or serviceman)
    const deletedImage = deletedAdminImage || deletedServicemanImage;

    // Delete from Cloudinary if URL exists
    if (deletedImage.imageUrl) {
      try {
        // Extract public ID from Cloudinary URL
        const urlParts = deletedImage.imageUrl.split('/');
        const publicId = urlParts[urlParts.length - 1].split('.')[0];
        
        await cloudinary.uploader.destroy(publicId);
        console.log('Deleted from Cloudinary:', publicId);
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
        // Continue with response even if Cloudinary delete fails
      }
    }

    res.status(200).json({
      success: true,
      message: "Image deleted successfully"
    });

  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ 
      success: false,
      message: "Error deleting image",
      error: error.message 
    });
  }
};