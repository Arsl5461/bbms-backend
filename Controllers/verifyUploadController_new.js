import PicByServiceMan from "../Database/picByServiceManModel.js";
import CampaignModel from "../Database/campaignsModel.js";
import VerificationModel from "../Database/verificationModel.js";

// ✅ Admin: Get all uploads
export const adminGetAllUploads = async (req, res) => {
  try {
    const uploads = await PicByServiceMan.find().populate("campaign");

    // Get verification status for each upload
    const uploadsWithStatus = await Promise.all(uploads.map(async (upload) => {
      const verification = await VerificationModel.findOne({ 
        serviceManUpload: upload._id 
      });
      
      return {
        ...upload.toObject(),
        clientEmail: upload.campaign?.clientEmail || "Unknown",
        isVerified: verification ? verification.status === "Verified" : false
      };
    }));

    res.status(200).json({
      message: "✅ All uploads fetched successfully",
      data: uploadsWithStatus,
    });
  } catch (err) {
    console.error("Admin get uploads error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Admin: Get uploads by serviceman email
export const adminGetUploadsByServicemanEmail = async (req, res) => {
  const { email } = req.params;
  
  try {
    if (!email) {
      return res.status(400).json({ message: "Email parameter is required" });
    }
    
    const uploads = await PicByServiceMan.find({ 
      serviceManEmail: email 
    }).populate("campaign").sort({ dateTime: -1 });

    if (uploads.length === 0) {
      return res.status(404).json({ 
        message: "No uploads found for this serviceman",
        data: []
      });
    }

    // Get verification status for each upload
    const uploadsWithDetails = await Promise.all(uploads.map(async (upload) => {
      const verification = await VerificationModel.findOne({ 
        serviceManUpload: upload._id 
      });
      
      // Get campaign details
      const campaign = upload.campaign ? upload.campaign : 
        await CampaignModel.findOne({ name: upload.campaignName });
      
      return {
        ...upload.toObject(),
        clientEmail: campaign?.clientEmail || "Unknown",
        isVerified: verification ? verification.status === "Verified" : false,
        campaignDetails: campaign ? {
          startDate: campaign.startDate,
          endDate: campaign.endDate
        } : null
      };
    }));

    res.status(200).json({
      message: "✅ Serviceman uploads fetched successfully",
      data: uploadsWithDetails,
    });
  } catch (err) {
    console.error("Admin get serviceman uploads error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Admin: Verify upload by ID
export const adminVerifyUploadById = async (req, res) => {
  const { uploadId } = req.params;

  try {
    console.log(`Verifying upload with ID: ${uploadId}`);
    
    // Find the upload
    const upload = await PicByServiceMan.findById(uploadId);
    if (!upload) {
      console.error(`Upload not found with ID: ${uploadId}`);
      return res.status(404).json({ message: "Upload not found" });
    }
    
    // Find or create verification record
    let verification = await VerificationModel.findOne({ 
      serviceManUpload: uploadId 
    });

    if (!verification) {
      // Get campaign ID based on campaign name
      const campaign = await CampaignModel.findOne({ 
        name: upload.campaignName 
      });

      if (!campaign) {
        return res.status(404).json({ 
          message: "Associated campaign not found" 
        });
      }

      verification = new VerificationModel({
        campaign: campaign._id,
        serviceManUpload: upload._id,
        serviceMan: upload.serviceManEmail,
        status: 'Verified',
        verifiedAt: new Date()
      });
    } else {
      verification.status = 'Verified';
      verification.verifiedAt = new Date();
    }

    await verification.save();
    console.log(`Verification record created/updated for upload: ${upload._id}`);

    res.status(200).json({
      message: "✅ Upload verified successfully",
      data: {
        uploadId: upload._id,
        verificationId: verification._id,
        status: verification.status
      }
    });
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({ 
      message: "Failed to verify upload",
      error: err.message 
    });
  }
};