const express = require("express")
const multer = require("multer")
const { verifyToken, isAdmin } = require("../../middleware/auth")
const { listBanners, uploadBanner, updateBanner, deleteBanner } = require("../../controllers/bannerController")

const router = express.Router()

// Use in-memory storage; files go straight to S3
const storage = multer.memoryStorage()

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Only image files are allowed"), false)
    }
  },
})

// List all banners
// GET /api/admin/banners
router.get("/", verifyToken, isAdmin, listBanners)

// Upload a new banner
// POST /api/admin/banners
// multipart/form-data with "file" field
router.post("/", verifyToken, isAdmin, upload.single("file"), uploadBanner)

// Update/replace a banner
// PUT /api/admin/banners/:filename
// multipart/form-data with "file" field
router.put("/:filename", verifyToken, isAdmin, upload.single("file"), updateBanner)

// Delete a banner
// DELETE /api/admin/banners/:filename
router.delete("/:filename", verifyToken, isAdmin, deleteBanner)

module.exports = router

