import PicByServiceMan from "../Database/picByServiceManModel.js";
import CampaignModel from "../Database/campaignsModel.js";
import VerificationModel from "../Database/verificationModel.js";

// ✅ Admin: Get all uploads
export const adminGetAllUploads = async (req, res) => {
  try {
    const uploads = await PicByServiceMan.find().populate("campaign");

    // Return empty array if none found
    const uploadsWithClientEmail = uploads.map((upload) => ({
      ...upload.toObject(),
      clientEmail: upload.campaign?.clientEmail || "Unknown",
    }));

    res.status(200).json({
      message: "✅ All uploads fetched successfully",
      data: uploadsWithClientEmail,
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

    // Get campaign details for each upload
    const uploadsWithDetails = await Promise.all(uploads.map(async (upload) => {
      // Get verification status
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
    const upload = await PicByServiceMan.findById(uploadId).populate('campaign');
    if (!upload) {
      console.error(`Upload not found with ID: ${uploadId}`);
      return res.status(404).json({ message: "Upload not found" });
    }
    
    console.log(`Found upload: ${upload._id}, campaign: ${upload.campaignName}`);

    // Update the upload's isVerified status directly
    upload.isVerified = true;
    await upload.save();
    console.log(`Updated upload isVerified status to true`);

    // Find the verification record and update its status if it exists
    const verification = await VerificationModel.findOne({ serviceManUpload: uploadId });
    
    if (verification) {
      verification.status = "Verified";
      verification.verifiedAt = new Date();
      await verification.save();
      console.log(`Updated verification record status to Verified`);
    } else {
      console.log(`No verification record found for upload ${uploadId}, creating one`);
      
      // If no verification record exists, create one
      if (upload.campaign) {
        // Get the first board ID from the campaign if available
        const campaign = await CampaignModel.findById(upload.campaign);
        if (campaign && campaign.selectedBoards && campaign.selectedBoards.length > 0) {
          const newVerification = new VerificationModel({
            campaign: upload.campaign,
            serviceMan: upload.serviceManEmail,
            serviceManUpload: upload._id,
            board: campaign.selectedBoards[0], // Use the first board
            status: "Verified",
            verifiedAt: new Date()
          });
          await newVerification.save();
          console.log(`Created new verification record for upload ${uploadId}`);
        }
      }
    }

    res.status(200).json({
      message: "✅ Upload verified successfully",
      upload: {
        ...upload.toObject(),
        clientEmail: upload.campaign?.clientEmail || "Unknown",
      },
    });
  } catch (err) {
    console.error("Admin verification error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
