const express = require("express")
const { verifyToken } = require("../middleware/auth")
const pool = require("../config/database")

const router = express.Router()

router.post("/create", verifyToken, async (req, res) => {
  try {
    const { reviewed_user_id, rating, review } = req.body

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" })
    }

    const connection = await pool.getConnection()

    const [result] = await connection.execute(
      "INSERT INTO ratings_reviews (reviewer_id, reviewed_user_id, rating, review) VALUES (?, ?, ?, ?)",
      [req.user.id, reviewed_user_id, rating, review || null],
    )

    connection.release()

    res.status(201).json({
      message: "Rating submitted",
      ratingId: result.insertId,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get("/user/:userId", async (req, res) => {
  try {
    const connection = await pool.getConnection()
    const [ratings] = await connection.execute(
      "SELECT r.*, u.name as reviewer_name FROM ratings_reviews r JOIN users u ON r.reviewer_id = u.id WHERE r.reviewed_user_id = ? ORDER BY r.created_at DESC",
      [req.params.userId],
    )

    // Calculate average rating
    const avgRating =
      ratings.length > 0 ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(2) : 0

    connection.release()

    res.json({
      average_rating: avgRating,
      total_reviews: ratings.length,
      ratings,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
