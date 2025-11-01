// Dotenv Configuration
import dotenv from "dotenv";
dotenv.config();

import path from "path";
import express from "express";
import './config/cloudinary.js'; // Cloudinary is configured on import
import { connectDB } from "./Utills/mongooseConn.js";
import routes from "./Routes/routes.js";

const app = express();
import cors from "cors";

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.query.email) {
    console.log('Query email:', req.query.email);
  }
  next();
});

// Routes
app.use('/api',routes);
// To store pic locally
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    message: 'Internal server error',
    error: error.message,
    stack: error.stack
  });
});

// Start server only after DB connects
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
});
