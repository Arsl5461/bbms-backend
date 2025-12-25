import multer from "multer";

// Configure multer with memory storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname)
  }
});
// Using disk storage temporarily to ensure file handle for Nodemailer
// Or use memoryStorage if we want to stream buffer directly.
// Nodemailer supports buffer. Let's use diskStorage for simplicity as per controller logic (req.file.path).
// Actually controller logic: fs.unlink(req.file.path). So it expects disk storage.

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'application/pdf'
  ];
  if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.pptx')) {
    cb(null, true);
  } else {
    cb(new Error('Only PPTX and PDF files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit for reports
  }
}).single('file');

const reportUploadMiddleware = (req, res, next) => {
  upload(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

export default reportUploadMiddleware;
