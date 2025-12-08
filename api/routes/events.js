const express = require("express")
const router = express.Router()
const db = require("../../config/database")
const { verifyToken: authenticateToken } = require("../../middleware/auth")

router.get("/upcoming", authenticateToken, async (req, res) => {
  try {
    const { location, type, page = 1, limit = 10 } = req.query
    const offset = (page - 1) * limit

    let query = `
      SELECT * FROM events
      WHERE event_date >= CURDATE() AND is_active = true
    `
    const params = []

    if (location) {
      query += ` AND location LIKE ?`
      params.push(`%${location}%`)
    }
    if (type) {
      query += ` AND event_type = ?`
      params.push(type)
    }

    query += ` ORDER BY event_date ASC LIMIT ? OFFSET ?`
    params.push(Number.parseInt(limit), offset)

    const [events] = await db.query(query, params)

    const [[{ count }]] = await db.query(`
      SELECT COUNT(*) as count FROM events WHERE event_date >= CURDATE() AND is_active = true
    `)

    res.json({ events, total: count, page, limit })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const [event] = await db.query(
      `
      SELECT e.*, COUNT(er.id) as registered_count
      FROM events e
      LEFT JOIN event_registrations er ON e.id = er.event_id
      WHERE e.id = ?
      GROUP BY e.id
    `,
      [req.params.id],
    )

    if (!event.length) {
      return res.status(404).json({ error: "Event not found" })
    }

    res.json(event[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post("/:id/register", authenticateToken, async (req, res) => {
  try {
    const [existing] = await db.query(
      `
      SELECT * FROM event_registrations WHERE event_id = ? AND user_id = ?
    `,
      [req.params.id, req.user.id],
    )

    if (existing.length) {
      return res.status(400).json({ error: "Already registered for this event" })
    }

    const [result] = await db.query(
      `
      INSERT INTO event_registrations (event_id, user_id)
      VALUES (?, ?)
    `,
      [req.params.id, req.user.id],
    )

    res.json({ message: "Registered for event", registration_id: result.insertId })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post("/:id/unregister", authenticateToken, async (req, res) => {
  try {
    await db.query(
      `
      DELETE FROM event_registrations WHERE event_id = ? AND user_id = ?
    `,
      [req.params.id, req.user.id],
    )

    res.json({ message: "Unregistered from event" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
