const express = require("express")
const multer = require("multer")
const router = express.Router()
const db = require("../../config/database")
const { verifyToken: authenticateToken } = require("../../middleware/auth")
const {
  uploadPortfolioImages,
  uploadSinglePortfolioImage,
  getPortfolioImages,
  getPortfolioImagesByUserId,
  updatePortfolioImage,
  deletePortfolioImage,
  clearPortfolioImages,
} = require("../../controllers/portfolioController")

// Multer configuration for portfolio uploads
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB per file
  },
})

// ================= NEW PORTFOLIO IMAGES API (Array-based) =================

// Upload a single portfolio image (appends to existing portfolio)
// POST /api/portfolio/image
// multipart/form-data with "file" field (single file)
router.post("/image", authenticateToken, upload.single("file"), uploadSinglePortfolioImage)

// Upload portfolio images (up to 6 images)
// POST /api/portfolio/images
// multipart/form-data with "files" field (array)
router.post("/images", authenticateToken, upload.array("files", 6), uploadPortfolioImages)

// Get portfolio images for authenticated user
// GET /api/portfolio/images
router.get("/images", authenticateToken, getPortfolioImages)

// Get portfolio images by user ID (for viewing other users' portfolios)
// GET /api/portfolio/images/user/:user_id
router.get("/images/user/:user_id", authenticateToken, getPortfolioImagesByUserId)

// Update portfolio image at specific index (1-6)
// PUT /api/portfolio/images/:index
// multipart/form-data with "file" field
router.put("/images/:index", authenticateToken, upload.single("file"), updatePortfolioImage)

// Delete portfolio image at specific index (1-6)
// DELETE /api/portfolio/images/:index
router.delete("/images/:index", authenticateToken, deletePortfolioImage)

// Clear all portfolio images
// DELETE /api/portfolio/images
router.delete("/images", authenticateToken, clearPortfolioImages)

// ================= OLD PORTFOLIO ITEMS API (Legacy - for backward compatibility) =================

router.get("/user/:user_id", authenticateToken, async (req, res) => {
  try {
    const [portfolio] = await db.query(
      `
      SELECT * FROM portfolio_items
      WHERE user_id = ?
      ORDER BY created_at DESC
    `,
      [req.params.user_id],
    )

    res.json(portfolio)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post("/", authenticateToken, async (req, res) => {
  try {
    const { title, description, media_url, media_type, work_date } = req.body

    const [result] = await db.query(
      `
      INSERT INTO portfolio_items (user_id, title, description, media_url, media_type, work_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [req.user.id, title, description, media_url, media_type, work_date],
    )

    res.json({ message: "Portfolio item added", id: result.insertId })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const [item] = await db.query(
      `
      SELECT * FROM portfolio_items WHERE id = ? AND user_id = ?
    `,
      [req.params.id, req.user.id],
    )

    if (!item.length) {
      return res.status(404).json({ error: "Portfolio item not found" })
    }

    const { title, description, media_url, work_date } = req.body

    await db.query(
      `
      UPDATE portfolio_items SET title = ?, description = ?, media_url = ?, work_date = ?
      WHERE id = ?
    `,
      [title, description, media_url, work_date, req.params.id],
    )

    res.json({ message: "Portfolio item updated" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const [item] = await db.query(
      `
      SELECT * FROM portfolio_items WHERE id = ? AND user_id = ?
    `,
      [req.params.id, req.user.id],
    )

    if (!item.length) {
      return res.status(404).json({ error: "Portfolio item not found" })
    }

    await db.query(`DELETE FROM portfolio_items WHERE id = ?`, [req.params.id])

    res.json({ message: "Portfolio item deleted" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
