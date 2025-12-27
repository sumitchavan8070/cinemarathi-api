const express = require("express")
const multer = require("multer")
const { verifyToken: authenticateToken } = require("../../middleware/auth")
const { uploadProfileImage, uploadFile } = require("../../controllers/uploadController")

const router = express.Router()

// Use in-memory storage; files go straight to S3
const storage = multer.memoryStorage()

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
})

// Upload profile image for current user
// POST /api/upload/profile
// multipart/form-data with "file" field
router.post("/profile", authenticateToken, upload.single("file"), uploadProfileImage)

// Generic upload endpoint
// POST /api/upload/file
// multipart/form-data with "file" field and optional "folder" in body/query
router.post("/file", authenticateToken, upload.single("file"), uploadFile)

module.exports = router










