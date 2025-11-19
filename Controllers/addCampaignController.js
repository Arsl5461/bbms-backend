// controllers/campaignController.js
import Campaign from "../Database/campaignsModel.js";
import Board from "../Database/boardsModel.js";
import mongoose from "mongoose";
import UserModel from "../Database/userModel.js";

// // ✅ Create Campaign
// export const createCampaign = async (req, res) => {
//   try {
//     console.log("Creating campaign with data:", req.body);
//     console.log("Request body type:", typeof req.body);
//     console.log("Full request body:", JSON.stringify(req.body, null, 2));
    
//     // Validate selectedBoards are valid ObjectIds
//     if (req.body.selectedBoards && Array.isArray(req.body.selectedBoards)) {
//       for (const boardId of req.body.selectedBoards) {
//         if (!mongoose.Types.ObjectId.isValid(boardId)) {
//           return res.status(400).json({ 
//             message: `Invalid board ID: ${boardId}` 
//           });
//         }
//       }
//     }
    
//     if (req.body.serviceManEmail && !Array.isArray(req.body.serviceManEmail)) {
//       req.body.serviceManEmail = [req.body.serviceManEmail];
//     }

//     // Extract only the fields we need from req.body
//     const campaignData = {
//       name: req.body.name,
//       startDate: req.body.startDate,
//       endDate: req.body.endDate,
//       noOfBoards: req.body.noOfBoards,
//       selectedBoards: req.body.selectedBoards,
//       clientEmail: req.body.clientEmail,
//       clientName: req.body.clientName,
//       serviceManEmail: req.body.serviceManEmail,
//       city: req.body.city
//     };

//     const campaign = new Campaign(campaignData);
//     console.log("Campaign object created:", campaign);
    
//     await campaign.save();
//     console.log("Campaign saved successfully");
    
//     await campaign.populate("selectedBoards");
//     console.log("Campaign populated with boards");

//     res.status(201).json(campaign);
//   } catch (error) {
//     console.error("Campaign creation error:", error);
//     console.error("Error name:", error.name);
//     console.error("Error message:", error.message);
//     console.error("Error stack:", error.stack);
    
//     // Handle Mongoose validation errors
//     if (error.name === "ValidationError") {
//       console.log("Validation Error Details:", error);
//       console.log("Error fields:", Object.keys(error.errors));
//       const messages = Object.values(error.errors).map((err) => err.message);
//       return res.status(400).json({ 
//         message: messages.join(", "),
//         fields: Object.keys(error.errors),
//         details: error.errors
//       });
//     }

//     // Handle duplicate key errors
//     if (error.code === 11000) {
//       const field = Object.keys(error.keyPattern)[0];
//       return res.status(400).json({ message: `${field} already exists` });
//     }

//     // Handle cast errors (invalid ObjectId)
//     if (error.name === "CastError") {
//       return res.status(400).json({ 
//         message: `Invalid ${error.path}: ${error.value}` 
//       });
//     }

//     // Fallback for unexpected server errors
//     res.status(500).json({ 
//       message: "Server error while creating campaign.",
//       error: error.message,
//       details: error.stack
//     });
//   }
// };


// Create Campaign
export const createCampaign = async (req, res) => {
  try {
    // Validate required fields
    const requiredFields = ['name', 'startDate', 'endDate', 'selectedBoards', 'clientEmail', 'clientName', 'serviceManEmail'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    // Check for at least one city (either 'city' or 'cities')
    const hasCity = req.body.city || (Array.isArray(req.body.cities) && req.body.cities.length > 0);
    if (!hasCity) {
      missingFields.push('city or cities');
    }
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate selectedBoards are valid ObjectIds
    if (req.body.selectedBoards && Array.isArray(req.body.selectedBoards)) {
      for (const boardId of req.body.selectedBoards) {
        if (!mongoose.Types.ObjectId.isValid(boardId)) {
          return res.status(400).json({
            message: `Invalid board ID: ${boardId}`
          });
        }
      }
    }

    if (req.body.serviceManEmail && !Array.isArray(req.body.serviceManEmail)) {
      req.body.serviceManEmail = [req.body.serviceManEmail];
    }

    // Handle cities - support both 'city' (string) and 'cities' (array)
    let cities = [];
    if (Array.isArray(req.body.cities) && req.body.cities.length > 0) {
      cities = req.body.cities;
    } else if (req.body.city) {
      cities = [req.body.city];
    }

    // Extract only the fields we need from req.body
    const campaignData = {
      name: req.body.name,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      noOfBoards: req.body.noOfBoards,
      selectedBoards: req.body.selectedBoards,
      clientEmail: req.body.clientEmail,
      clientName: req.body.clientName,
      serviceManEmail: req.body.serviceManEmail,
      cities: cities,
      city: cities[0] || '' // Keep first city for backward compatibility
    };

    const campaign = new Campaign(campaignData);
    console.log("Campaign object created:", campaign);

    await campaign.save();
    console.log("Campaign saved successfully");

    await campaign.populate("selectedBoards");
    console.log("Campaign populated with boards");

    res.status(201).json(campaign);
  } catch (error) {
    console.error("Campaign creation error:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      console.log("Validation Error Details:", error);
      console.log("Error fields:", Object.keys(error.errors));
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        message: messages.join(", "),
        fields: Object.keys(error.errors),
        details: error.errors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ message: `${field} already exists` });
    }

    // Handle cast errors (invalid ObjectId)
    if (error.name === "CastError") {
      return res.status(400).json({
        message: `Invalid ${error.path}: ${error.value}`
      });
    }

    // Fallback for unexpected server errors
    res.status(500).json({
      message: "Server error while creating campaign.",
      error: error.message,
      details: error.stack
    });
  }
};


// ✅ Get All Campaigns
export const getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find().populate("selectedBoards");
    res.status(200).json(campaigns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get Single Campaign by ID
export const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate("selectedBoards");
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });
    res.status(200).json(campaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update Campaign
export const updateCampaign = async (req, res) => {
  try {
    // Handle cities - support both 'city' (string) and 'cities' (array)
    if (req.body.cities || req.body.city) {
      let cities = [];
      if (Array.isArray(req.body.cities) && req.body.cities.length > 0) {
        cities = req.body.cities;
      } else if (req.body.city) {
        cities = [req.body.city];
      }
      
      // Update both fields for consistency
      req.body.cities = cities;
      req.body.city = cities[0] || '';
    }

    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("selectedBoards");
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });
    res.status(200).json(campaign);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Delete Campaign
export const deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });
    res.status(200).json({ message: "Campaign deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get Boards By City (case-insensitive, flexible field name)
// export const getBoardsByCity = async (req, res) => {
//   try {
//     const { city } = req.params;

//     if (!city) {
//       return res.status(400).json({ message: "City parameter is required" });
//     }

//     // Case-insensitive search for both possible field names
//     const boards = await Board.find({
//       $or: [
//         { city: { $regex: new RegExp(`^${city}$`, "i") } },
//         { City: { $regex: new RegExp(`^${city}$`, "i") } }
//       ]
//     });

//     if (!boards || boards.length === 0) {
//       return res.status(404).json({ message: "No boards found in this city" });
//     }

//     res.status(200).json(boards);
//   } catch (error) {
//     console.error("Error fetching boards by city:", error);
//     res.status(500).json({ message: error.message || "Server error" });
//   }
// };
// ✅ Get Boards By City (excluding already used boards)
export const getBoardsByCity = async (req, res) => {
  try {
    const { city } = req.params;

    if (!city) {
      return res.status(400).json({ message: "City parameter is required" });
    }

    // 1️⃣ Find all boards already assigned to any campaign
    const campaigns = await Campaign.find({}, "selectedBoards");
    const usedBoardIds = campaigns
      .flatMap(c => c.selectedBoards)
      .map(id => id.toString());

    // 2️⃣ Find boards in the given city that are NOT in usedBoardIds
    const boards = await Board.find({
      $and: [
        {
          $or: [
            { city: { $regex: new RegExp(`^${city}$`, "i") } },
            { City: { $regex: new RegExp(`^${city}$`, "i") } }
          ]
        },
        { _id: { $nin: usedBoardIds } }
      ]
    });

    if (!boards || boards.length === 0) {
      return res.status(404).json({ message: "No available boards found in this city" });
    }

    res.status(200).json(boards);
  } catch (error) {
    console.error("Error fetching boards by city:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};


// ✅ Get Service Man(s) By City
export const getServiceManByCity = async (req, res) => {
  try {
    const { city } = req.params;
    const servicemen = await UserModel.find({ city: city, role: "serviceman" }).select("-password");
    // Return empty array instead of 404 - this is valid (no service men in this city)
    res.status(200).json(servicemen);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};