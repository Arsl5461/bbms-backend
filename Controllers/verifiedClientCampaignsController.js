import VerificationModel from "../Database/verificationModel.js"
import CampaignModel from "../Database/campaignsModel.js";

export const getVerifiedCampaignsForClient = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ message: "Client email is required" });
    }
    
    console.log('Fetching campaigns for client email:', email);

    // Step 1: Find all campaigns for this client
    const clientCampaigns = await CampaignModel.find({ 
      clientEmail: email 
    }).populate('selectedBoards');

    console.log('Found campaigns:', clientCampaigns);

    if (!clientCampaigns.length) {
      return res.status(200).json({ 
        message: "No campaigns found for this client",
        data: [] 
      });
    }

    // Step 2: Get verifications for these campaigns
    const campaignIds = clientCampaigns.map(camp => camp._id);
    const verifications = await VerificationModel.find({
      campaign: { $in: campaignIds }
    }).populate('serviceMan').populate('serviceManUpload');

    // Step 3: Combine campaign data with verification status
    const campaignsWithVerification = clientCampaigns.map(campaign => {
      const campaignVerifications = verifications.filter(
        v => v.campaign.toString() === campaign._id.toString()
      );
      
      return {
        ...campaign.toObject(),
        verifications: campaignVerifications,
        verificationStatus: campaignVerifications.length ? 
          campaignVerifications.some(v => v.status === 'Verified') ? 'Verified' : 'Pending'
          : 'Not Started'
      };
    });

    console.log('Campaigns with verification:', campaignsWithVerification);
    res.status(200).json({ 
      message: "Campaigns retrieved successfully",
      data: campaignsWithVerification 
    });
  } catch (error) {
    console.error("Error fetching verified campaigns for client:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};