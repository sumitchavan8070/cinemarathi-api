const express = require("express")
const router = express.Router()
const db = require("../../config/database")
const { verifyToken: authenticateToken } = require("../../middleware/auth")

router.get("/casting-calls", authenticateToken, async (req, res) => {
  try {
    const { role, gender, location, min_budget, max_budget, keyword, page = 1, limit = 10 } = req.query
    const offset = (page - 1) * limit

    let query = `
      SELECT cc.*, u.name as production_house_name, u.profile_picture,
             COUNT(DISTINCT a.id) as total_applications
      FROM casting_calls cc
      JOIN users u ON cc.production_house_id = u.id
      LEFT JOIN applications a ON cc.id = a.casting_call_id
      WHERE cc.audition_date >= CURDATE()
    `
    const params = []

    if (role) {
      query += ` AND cc.role LIKE ?`
      params.push(`%${role}%`)
    }
    if (gender) {
      query += ` AND (cc.gender = ? OR cc.gender = 'any')`
      params.push(gender)
    }
    if (location) {
      query += ` AND cc.location LIKE ?`
      params.push(`%${location}%`)
    }
    if (min_budget) {
      query += ` AND cc.budget_per_day >= ?`
      params.push(min_budget)
    }
    if (max_budget) {
      query += ` AND cc.budget_per_day <= ?`
      params.push(max_budget)
    }
    if (keyword) {
      query += ` AND (cc.project_title LIKE ? OR cc.description LIKE ? OR cc.skills_required LIKE ?)`
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`)
    }

    query += ` GROUP BY cc.id ORDER BY cc.created_at DESC LIMIT ? OFFSET ?`
    params.push(Number.parseInt(limit), offset)

    const [castingCalls] = await db.query(query, params)

    let countQuery = `SELECT COUNT(DISTINCT cc.id) as count FROM casting_calls cc WHERE cc.audition_date >= CURDATE()`
    if (role) countQuery += ` AND cc.role LIKE ?`
    if (gender) countQuery += ` AND (cc.gender = ? OR cc.gender = 'any')`
    if (location) countQuery += ` AND cc.location LIKE ?`
    if (min_budget) countQuery += ` AND cc.budget_per_day >= ?`
    if (max_budget) countQuery += ` AND cc.budget_per_day <= ?`

    const [[{ count }]] = await db.query(countQuery, params.slice(0, -2))

    res.json({ castingCalls, total: count, page, limit })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get("/profiles", authenticateToken, async (req, res) => {
  try {
    const { category, min_experience, skills, location, page = 1, limit = 10 } = req.query
    const offset = (page - 1) * limit

    let query = `
      SELECT u.id, u.name, u.email, u.profile_picture, u.location,
             a.category, a.experience_years, a.skills,
             AVG(rr.rating) as avg_rating, COUNT(rr.id) as total_reviews
      FROM users u
      JOIN actors a ON u.id = a.user_id
      LEFT JOIN ratings_reviews rr ON u.id = rr.reviewed_user_id
      WHERE u.is_active = true
    `
    const params = []

    if (category) {
      query += ` AND a.category = ?`
      params.push(category)
    }
    if (min_experience) {
      query += ` AND a.experience_years >= ?`
      params.push(min_experience)
    }
    if (skills) {
      query += ` AND a.skills LIKE ?`
      params.push(`%${skills}%`)
    }
    if (location) {
      query += ` AND u.location LIKE ?`
      params.push(`%${location}%`)
    }

    query += ` GROUP BY u.id ORDER BY RAND() LIMIT ? OFFSET ?`
    params.push(Number.parseInt(limit), offset)

    const [profiles] = await db.query(query, params)
    res.json({ profiles, page, limit })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get("/trending", authenticateToken, async (req, res) => {
  try {
    const [trendingCastings] = await db.query(`
      SELECT cc.*, u.name as production_house_name,
             COUNT(a.id) as application_count
      FROM casting_calls cc
      JOIN users u ON cc.production_house_id = u.id
      LEFT JOIN applications a ON cc.id = a.casting_call_id
      GROUP BY cc.id
      ORDER BY application_count DESC
      LIMIT 5
    `)

    const [trendingProfiles] = await db.query(`
      SELECT u.id, u.name, u.profile_picture,
             AVG(rr.rating) as avg_rating, COUNT(rr.id) as total_reviews
      FROM users u
      JOIN actors a ON u.id = a.user_id
      LEFT JOIN ratings_reviews rr ON u.id = rr.reviewed_user_id
      WHERE u.is_active = true
      GROUP BY u.id
      HAVING avg_rating >= 4.5
      ORDER BY total_reviews DESC
      LIMIT 5
    `)

    res.json({ trendingCastings: trendingCastings, trendingProfiles: trendingProfiles })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
