const express = require("express")
const { verifyToken } = require("../middleware/auth")
const pool = require("../config/database")

const router = express.Router()

router.get("/plans", async (req, res) => {
  try {
    const connection = await pool.getConnection()
    const [plans] = await connection.execute("SELECT * FROM premium_plans")
    connection.release()

    res.json(plans)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post("/subscribe", verifyToken, async (req, res) => {
  try {
    const { plan_id } = req.body
    const connection = await pool.getConnection()

    // Get plan details
    const [plans] = await connection.execute("SELECT * FROM premium_plans WHERE id = ?", [plan_id])

    if (plans.length === 0) {
      connection.release()
      return res.status(404).json({ error: "Plan not found" })
    }

    const plan = plans[0]
    // Use MySQL DATE_ADD function for accurate date calculation
    const durationDays = plan.duration_days || 365

    const [result] = await connection.execute(
      "INSERT INTO user_subscriptions (user_id, plan_id, start_date, end_date, is_active) VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? DAY), ?)",
      [req.user.id, plan_id, durationDays, true],
    )
    
    // Get the actual dates that were inserted
    const [insertedSub] = await connection.execute(
      "SELECT start_date, end_date FROM user_subscriptions WHERE id = ?",
      [result.insertId]
    )
    
    const startDate = insertedSub[0].start_date
    const endDate = insertedSub[0].end_date

    connection.release()

    res.status(201).json({
      message: "Subscription created",
      subscriptionId: result.insertId,
      startDate,
      endDate,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get("/my-subscription", verifyToken, async (req, res) => {
  try {
    const connection = await pool.getConnection()
    const [subscriptions] = await connection.execute(
      "SELECT s.*, p.name, p.features FROM user_subscriptions s JOIN premium_plans p ON s.plan_id = p.id WHERE s.user_id = ? AND s.is_active = true AND end_date > NOW() ORDER BY s.end_date DESC LIMIT 1",
      [req.user.id],
    )

    connection.release()

    res.json(subscriptions[0] || null)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
