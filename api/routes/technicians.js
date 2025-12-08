const express = require("express")
const router = express.Router()
const db = require("../../config/database")
const { verifyToken: authenticateToken } = require("../../middleware/auth")

router.get("/all", authenticateToken, async (req, res) => {
  try {
    const { specialization, experience_min, location, page = 1, limit = 10 } = req.query
    const offset = (page - 1) * limit

    let query = `
      SELECT u.id, u.name, u.email, u.profile_picture, t.specialization, 
             t.experience_years, t.hourly_rate, t.availability, t.portfolio_link,
             AVG(rr.rating) as avg_rating, COUNT(rr.id) as total_reviews
      FROM users u
      JOIN technicians t ON u.id = t.user_id
      LEFT JOIN ratings_reviews rr ON u.id = rr.reviewed_user_id
      WHERE u.is_active = true
    `
    const params = []

    if (specialization) {
      query += ` AND t.specialization = ?`
      params.push(specialization)
    }
    if (experience_min) {
      query += ` AND t.experience_years >= ?`
      params.push(experience_min)
    }
    if (location) {
      query += ` AND u.location LIKE ?`
      params.push(`%${location}%`)
    }

    query += ` GROUP BY u.id ORDER BY u.id LIMIT ? OFFSET ?`
    params.push(Number.parseInt(limit), offset)

    const [technicians] = await db.query(query, params)

    let countQuery = `SELECT COUNT(*) as count FROM technicians t JOIN users u ON t.user_id = u.id WHERE u.is_active = true`
    if (specialization) countQuery += ` AND t.specialization = ?`
    if (experience_min) countQuery += ` AND t.experience_years >= ?`
    if (location) countQuery += ` AND u.location LIKE ?`

    const countParams = []
    if (specialization) countParams.push(specialization)
    if (experience_min) countParams.push(experience_min)
    if (location) countParams.push(`%${location}%`)

    const [[{ count }]] = await db.query(countQuery, countParams)

    res.json({ technicians, total: count, page, limit })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const [technician] = await db.query(
      `
      SELECT u.id, u.name, u.email, u.profile_picture, u.location, u.phone,
             t.specialization, t.experience_years, t.hourly_rate, t.availability,
             t.portfolio_link, t.certifications,
             AVG(rr.rating) as avg_rating, COUNT(rr.id) as total_reviews
      FROM users u
      JOIN technicians t ON u.id = t.user_id
      LEFT JOIN ratings_reviews rr ON u.id = rr.reviewed_user_id
      WHERE u.id = ?
      GROUP BY u.id
    `,
      [req.params.id],
    )

    if (!technician.length) {
      return res.status(404).json({ error: "Technician not found" })
    }

    res.json(technician[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put("/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.id != req.params.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" })
    }

    const { specialization, experience_years, hourly_rate, availability, portfolio_link, certifications } = req.body

    await db.query(
      `
      UPDATE technicians SET
        specialization = ?, experience_years = ?, hourly_rate = ?,
        availability = ?, portfolio_link = ?, certifications = ?
      WHERE user_id = ?
    `,
      [specialization, experience_years, hourly_rate, availability, portfolio_link, certifications, req.params.id],
    )

    res.json({ message: "Technician profile updated" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
