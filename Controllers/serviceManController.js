// // import PicByServiceMan from "../Database/picByServiceManModel.js";
// // import Campaign from "../Database/campaignsModel.js";
// // import Board from "../Database/boardsModel.js";
// // import path from "path";
// // // Upload and Save to MongoDB
// // export const uploadServiceManPic = async (req, res) => {
// //   try {
// //     const {
// //       campaignName,
// //       serviceManEmail,
// //       liveLocation,
// //       city,
// //       latitude,
// //       longitude,
// //       dateTime,
// //     } = req.body;

// //     // Validation
// //     if (
// //       !req.file ||
// //       !campaignName ||
// //       !serviceManEmail ||
// //       !liveLocation ||
// //       !city ||
// //       !latitude ||
// //       !longitude ||
// //       !dateTime
// //     ) {
// //       console.error("Validation failed. req.file:", req.file); // Log req.file
// //       return res.status(400).json({ message: "All fields and image are required." });
// //     }

// //     console.log("req.file object after multer processing:", req.file); // Add this line
// //     const imageUrl = req.file.secure_url; // Use secure_url from Cloudinary
// //     const sendUrl = req.file.url; // Use url from Cloudinary

// //     console.log("Creating new entry with serviceManEmail:", serviceManEmail);
    
// //     const newEntry = new PicByServiceMan({
// //       campaignName,
// //       serviceManEmail,
// //       liveLocation,
// //       city,
// //       latitude: parseFloat(latitude),
// //       longitude: parseFloat(longitude),
// //       dateTime,
// //       imageUrl: imageUrl, // Store secure_url
// //       sendUrl: sendUrl, // Store the send URL
// //     });

// //     await newEntry.save();
// //     console.log("Saved new entry:", newEntry);
// //     console.log("Saved serviceManEmail:", newEntry.serviceManEmail);

// //     res.status(201).json({
// //       message: "Upload successful",
// //       data: newEntry,
// //     });
// //   } catch (error) {
// //     console.error("Upload error:", error);
// //     res.status(500).json({ message: "Server error during upload." });
// //   }
// // };

// // // Get all uploads by a specific service man
// // import VerificationModel from "../Database/verificationModel.js"; // ✅ import verification model


// // export const getUploads = async (req, res) => {
// //   try {
// //     const email = req.query.email;

// //     if (!email) {
// //       return res.status(400).json({ message: "Email is required in query" });
// //     }

// //     const uploads = await PicByServiceMan.find({ serviceManEmail: email }).sort({ createdAt: -1 });

// //     const uploadsWithStatus = await Promise.all(
// //       uploads.map(async (upload) => {
// //         const verification = await VerificationModel.findOne({
// //           serviceManUpload: upload._id,
// //           status: "Verified",
// //         });

// //         return {
// //           ...upload.toObject(),
// //           isVerified: !!verification,
// //         };
// //       })
// //     );

// //     return res.status(200).json({ data: uploadsWithStatus });
// //   } catch (error) {
// //     console.error("Error fetching uploads:", error);
// //     return res.status(500).json({ message: "Failed to fetch uploads" });
// //   }
// // };

// // // ✅ Get campaigns assigned to a specific serviceman


// // export const getCampaignsByServiceMan = async (req, res) => {
// //   try {
// //     const { email } = req.params;

// //     if (!email) {
// //       return res.status(400).json({ message: "Email is required" });
// //     }

// //     // Fetch campaigns directly by serviceManEmail
// //     const campaigns = await Campaign.find({ serviceManEmail: email }).populate("selectedBoards").lean();

// //     if (!campaigns.length) {
// //       return res.status(404).json({ message: "No campaigns found for this service man" });
// //     }

// //     res.status(200).json({ data: campaigns });
// //   } catch (error) {
// //     console.error("Error fetching campaigns by service man:", error);
// //     res.status(500).json({ message: "Server error" });
// //   }
// // };
// import PicByServiceMan from "../Database/picByServiceManModel.js";
// import Campaign from "../Database/campaignsModel.js";
// import VerificationModel from "../Database/verificationModel.js"; // ✅ already imported

// // Upload and Save to MongoDB
// export const uploadServiceManPic = async (req, res) => {
//   try {
//     const {
//       campaignName,
//       serviceManEmail,
//       liveLocation,
//       city,
//       latitude,
//       longitude,
//       dateTime,
//     } = req.body;

//     // Basic validation
//     if (
//       !req.file ||
//       !campaignName ||
//       !serviceManEmail ||
//       !liveLocation ||
//       !city ||
//       !latitude ||
//       !longitude
//     ) {
//       console.error("Validation failed. req.file:", req.file);
//       return res.status(400).json({ message: "All fields and an image are required." });
//     }

//     console.log("File after multer processing:", req.file);

//     // Multer-storage-cloudinary puts secure URL in `path`
//     const cloudinaryUrl = req.file.path || req.file.secure_url || req.file.url;

//     if (!cloudinaryUrl) {
//       return res.status(500).json({ message: "Image upload failed, no Cloudinary URL found." });
//     }

//     const newEntry = new PicByServiceMan({
//       campaignName,
//       serviceManEmail,
//       liveLocation,
//       city,
//       latitude: parseFloat(latitude),
//       longitude: parseFloat(longitude),
//       dateTime: dateTime || Date.now(),
//       imageUrl: cloudinaryUrl, // ✅ secure URL
//       sendUrl: cloudinaryUrl, // ✅ same for now, can be different if needed
//     });

//     await newEntry.save();
//     console.log("✅ Saved new entry:", newEntry);

//     res.status(201).json({
//       message: "Upload successful",
//       data: newEntry,
//     });
//   } catch (error) {
//     console.error("Upload error:", error);
//     res.status(500).json({ message: "Server error during upload." });
//   }
// };

// // Get all uploads by a specific service man
// export const getUploads = async (req, res) => {
//   try {
//     const email = req.query.email;

//     if (!email) {
//       return res.status(400).json({ message: "Email is required in query" });
//     }

//     const uploads = await PicByServiceMan.find({ serviceManEmail: email }).sort({ createdAt: -1 });

//     const uploadsWithStatus = await Promise.all(
//       uploads.map(async (upload) => {
//         const verification = await VerificationModel.findOne({
//           serviceManUpload: upload._id,
//           status: "Verified",
//         });

//         return {
//           ...upload.toObject(),
//           isVerified: !!verification,
//         };
//       })
//     );

//     return res.status(200).json({ data: uploadsWithStatus });
//   } catch (error) {
//     console.error("Error fetching uploads:", error);
//     return res.status(500).json({ message: "Failed to fetch uploads" });
//   }
// };

// // Get campaigns assigned to a specific serviceman
// export const getCampaignsByServiceMan = async (req, res) => {
//   try {
//     const { email } = req.params;

//     if (!email) {
//       return res.status(400).json({ message: "Email is required" });
//     }

//     const campaigns = await Campaign.find({ serviceManEmail: email })
//       .populate("selectedBoards")
//       .lean();

//     if (!campaigns.length) {
//       return res.status(404).json({ message: "No campaigns found for this service man" });
//     }

//     res.status(200).json({ data: campaigns });
//   } catch (error) {
//     console.error("Error fetching campaigns by service man:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
import PicByServiceMan from "../Database/picByServiceManModel.js";
import Campaign from "../Database/campaignsModel.js";
import VerificationModel from "../Database/verificationModel.js";

// ----------------------------
// Upload and Save a Report
// ----------------------------
export const uploadServiceManPic = async (req, res) => {
  console.log("Attempting to upload a report...");

  try {
    const {
      campaignName,
      serviceManEmail,
      liveLocation,
      city,
      latitude,
      longitude,
      dateTime,
    } = req.body;

    console.log("Request body:", req.body);

    // --- Enhanced Validation ---
    if (!req.file) {
      console.error("Validation failed: No file was uploaded.");
      return res.status(400).json({ message: "Image is required." });
    }

    console.log("File received:", req.file);

    const requiredFields = {
      campaignName,
      serviceManEmail,
      liveLocation,
      city,
      latitude,
      longitude,
    };

    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value) {
        console.error(`Validation failed: Missing field '${field}'.`);
        return res.status(400).json({ message: `Field '${field}' is required.` });
      }
    }

    // --- Cloudinary URL Check ---
    const cloudinaryUrl = req.file.cloudinaryUrl;
    if (!cloudinaryUrl) {
      console.error("Upload to Cloudinary failed: No URL found in req.file.", req.file);
      return res.status(500).json({ message: "Image upload failed, no Cloudinary URL found." });
    }

    console.log("Cloudinary URL:", cloudinaryUrl);

    // --- Database Operations ---
    console.log(`Finding campaign: '${campaignName}'`);
    const campaign = await Campaign.findOne({ name: campaignName });
    if (!campaign) {
      console.warn(`Campaign '${campaignName}' not found.`);
      // Decide if this is an error or not. For now, we'll allow it and set campaign to null.
    } else {
      console.log("Campaign found:", campaign._id);
    }

    const newEntry = new PicByServiceMan({
      campaignName,
      serviceManEmail,
      liveLocation,
      city,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      dateTime: dateTime || new Date(),
      imageUrl: cloudinaryUrl,
      sendUrl: cloudinaryUrl, // You can customize this if needed
      campaign: campaign ? campaign._id : null,
    });

    console.log("Saving new report to database...");
    await newEntry.save();
    console.log("Report saved successfully:", newEntry._id);

    // --- Create Verification Records ---
    if (campaign && Array.isArray(campaign.selectedBoards) && campaign.selectedBoards.length > 0) {
      console.log(`Creating ${campaign.selectedBoards.length} verification records...`);
      for (const boardId of campaign.selectedBoards) {
        const verification = new VerificationModel({
          campaign: campaign._id,
          serviceMan: newEntry.serviceManEmail,
          serviceManUpload: newEntry._id,
          board: boardId,
          status: "Pending",
        });
        await verification.save();
        console.log(`Verification record created for board ${boardId}`);
      }
    } else {
      console.log("No boards found for this campaign, skipping verification records.");
    }

    res.status(201).json({ message: "Upload successful", data: newEntry });

  } catch (error) {
    console.error("--- An error occurred during report upload ---");
    console.error(error);
    res.status(500).json({ message: "An unexpected server error occurred." });
  }
};


// ----------------------------
// Get all uploads by a Service Man
// ----------------------------
export const getUploads = async (req, res) => {
  try {
    const email = req.query.email;

    if (!email) {
      return res.status(400).json({ message: "Email is required in query" });
    }

    const uploads = await PicByServiceMan.find({ serviceManEmail: email }).sort({ createdAt: -1 });

    const uploadsWithStatus = await Promise.all(
      uploads.map(async (upload) => {
        const verification = await VerificationModel.findOne({
          serviceManUpload: upload._id,
          status: "Verified",
        });
        return { ...upload.toObject(), isVerified: !!verification };
      })
    );

    return res.status(200).json({ data: uploadsWithStatus });
  } catch (error) {
    console.error("Error fetching uploads:", error);
    return res.status(500).json({ message: "Failed to fetch uploads" });
  }
};

// ----------------------------
// Delete a Report by ID
// ----------------------------
export const deleteUpload = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Report ID is required" });
    }

    const deleted = await PicByServiceMan.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json({ message: "Report deleted successfully" });
  } catch (error) {
    console.error("Error deleting report:", error);
    res.status(500).json({ message: "Failed to delete report" });
  }
};

// ----------------------------
// Get Campaigns Assigned to Service Man
// ----------------------------
export const getCampaignsByServiceMan = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const campaigns = await Campaign.find({ 
      serviceManEmail: { $in: [email] }  // This will match if email is in the serviceManEmail array
    }).populate("selectedBoards").lean();

    if (!campaigns.length) {
      return res.status(404).json({ message: "No campaigns found for this service man" });
    }

    res.status(200).json({ data: campaigns });
  } catch (error) {
    console.error("Error fetching campaigns by service man:", error);
    res.status(500).json({ message: "Server error" });
  }
};
