const express = require("express")
const router = express.Router()
const db = require("../../config/database")
const { verifyToken: authenticateToken } = require("../../middleware/auth")

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
