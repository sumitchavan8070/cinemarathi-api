const express = require("express")
const { verifyToken } = require("../middleware/auth")
const pool = require("../config/database")

const router = express.Router()

router.post("/send", verifyToken, async (req, res) => {
  try {
    const { receiver_id, message } = req.body
    const connection = await pool.getConnection()

    const [result] = await connection.execute(
      "INSERT INTO chat_messages (sender_id, receiver_id, message) VALUES (?, ?, ?)",
      [req.user.id, receiver_id, message],
    )

    connection.release()

    res.status(201).json({
      message: "Message sent",
      messageId: result.insertId,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get("/history/:userId", verifyToken, async (req, res) => {
  try {
    const connection = await pool.getConnection()
    const [messages] = await connection.execute(
      "SELECT * FROM chat_messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY sent_at ASC",
      [req.user.id, req.params.userId, req.params.userId, req.user.id],
    )
    connection.release()

    res.json(messages)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get("/conversations", verifyToken, async (req, res) => {
  try {
    const connection = await pool.getConnection()
    const [conversations] = await connection.execute(
      `SELECT DISTINCT 
        CASE 
          WHEN sender_id = ? THEN receiver_id 
          ELSE sender_id 
        END as other_user_id,
        u.name, u.email,
        MAX(sent_at) as last_message_time
      FROM chat_messages
      JOIN users u ON u.id = CASE 
        WHEN sender_id = ? THEN receiver_id 
        ELSE sender_id 
      END
      WHERE sender_id = ? OR receiver_id = ?
      GROUP BY other_user_id
      ORDER BY last_message_time DESC`,
      [req.user.id, req.user.id, req.user.id, req.user.id],
    )
    connection.release()

    res.json(conversations)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put("/mark-read/:userId", verifyToken, async (req, res) => {
  try {
    const connection = await pool.getConnection()
    await connection.execute("UPDATE chat_messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ?", [
      req.params.userId,
      req.user.id,
    ])
    connection.release()

    res.json({ message: "Messages marked as read" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
