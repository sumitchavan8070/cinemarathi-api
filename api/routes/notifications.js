const express = require("express")
const router = express.Router()
const db = require("../../config/database")
const { verifyToken: authenticateToken } = require("../../middleware/auth")

router.get("/", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const offset = (page - 1) * limit

    const [notifications] = await db.query(
      `
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `,
      [req.user.id, Number.parseInt(limit), offset],
    )

    const [[{ count }]] = await db.query(
      `
      SELECT COUNT(*) as count FROM notifications WHERE user_id = ?
    `,
      [req.user.id],
    )

    res.json({ notifications, total: count, page, limit })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get("/unread/count", authenticateToken, async (req, res) => {
  try {
    const [[{ count }]] = await db.query(
      `
      SELECT COUNT(*) as count FROM notifications
      WHERE user_id = ? AND is_read = false
    `,
      [req.user.id],
    )

    res.json({ unread_count: count })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put("/:id/read", authenticateToken, async (req, res) => {
  try {
    const [notification] = await db.query(
      `
      SELECT * FROM notifications WHERE id = ? AND user_id = ?
    `,
      [req.params.id, req.user.id],
    )

    if (!notification.length) {
      return res.status(404).json({ error: "Notification not found" })
    }

    await db.query(
      `
      UPDATE notifications SET is_read = true WHERE id = ?
    `,
      [req.params.id],
    )

    res.json({ message: "Notification marked as read" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put("/all/read", authenticateToken, async (req, res) => {
  try {
    await db.query(
      `
      UPDATE notifications SET is_read = true WHERE user_id = ?
    `,
      [req.user.id],
    )

    res.json({ message: "All notifications marked as read" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const [notification] = await db.query(
      `
      SELECT * FROM notifications WHERE id = ? AND user_id = ?
    `,
      [req.params.id, req.user.id],
    )

    if (!notification.length) {
      return res.status(404).json({ error: "Notification not found" })
    }

    await db.query(`DELETE FROM notifications WHERE id = ?`, [req.params.id])

    res.json({ message: "Notification deleted" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
