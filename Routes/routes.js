import express from 'express';
import {
  getAllUsersController,
  loginController,
  registerUserController,
  updateUserController,
  deleteUserController,
} from '../Controllers/authUsersController.js';

import {
  createBoard,
  getBoards,
  updateBoard,
  deleteBoard,
} from '../Controllers/boardsController.js';

import uploadMiddleware from "../Middlewares/multerMiddleware.js";
import { verifyToken } from '../Middlewares/verifyToken.js';

import {
  createCampaign,
  deleteCampaign,
  getAllCampaigns,
  getBoardsByCity,
  getServiceManByCity, // ✅ fixed import name
  updateCampaign,
} from '../Controllers/addCampaignController.js';

import {
  deleteUpload,
  getCampaignsByServiceMan,
  getUploads,
  uploadServiceManPic,
} from '../Controllers/serviceManController.js';


import {
  adminVerifyUploadById,
  adminGetAllUploads,
  adminGetUploadsByServicemanEmail,
} from '../Controllers/verifyUploadController.js';

import { getVerifiedCampaignsForClient } from '../Controllers/verifiedClientCampaignsController.js';

const router = express.Router();

// ====================
// ✅ Auth Routes
// ====================
router.post('/auth/login', loginController);
router.post('/admin/register', registerUserController);
router.get('/users', verifyToken, getAllUsersController);
router.put('/users/:id', verifyToken, updateUserController);
router.delete('/users/:id', verifyToken, deleteUserController);

// ====================
// ✅ Board Routes
// ====================
router.get("/boards", getBoards);
router.post("/boards/create", verifyToken, createBoard);
router.put("/boards/:id", verifyToken, updateBoard);
router.delete("/boards/:id", verifyToken, deleteBoard);
router.get("/boards/city/:city", getBoardsByCity); // ✅ changed path to avoid conflict
router.get("/service-men/city/:city", getServiceManByCity); // ✅ fixed path + import

// ====================
// ✅ Campaign Routes
// ====================
router.post("/campaigns/create", verifyToken, createCampaign);
router.get("/campaigns", verifyToken, getAllCampaigns);
router.delete("/delete-campaigns/:id", verifyToken, deleteCampaign);
router.put("/update-campaigns/:id", verifyToken, updateCampaign);

// ================================
// ✅ Service Man 
// ================================
// route
router.get("/campaigns/service-man/:email", getCampaignsByServiceMan);
router.get("/get-uploads", verifyToken, getUploads);
router.post("/upload-pic", verifyToken, uploadMiddleware, uploadServiceManPic);
// Delete a report by ID
router.delete("/delete-upload/:id", deleteUpload);

// ====================
// ✅ Client Routes
// ====================
router.get("/verifications/client-campaigns/:email", verifyToken, getVerifiedCampaignsForClient);

// =============================
// ✅ Verification Routes
// =============================
router.put('/admin/verify-upload/:uploadId', verifyToken, adminVerifyUploadById);
router.get("/admin-get-uploads", verifyToken, adminGetAllUploads);
router.get("/admin-get-uploads/serviceman/:email", verifyToken, adminGetUploadsByServicemanEmail);

export default router;
