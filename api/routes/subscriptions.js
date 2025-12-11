const express = require("express")
const router = express.Router()
const db = require("../../config/database")
const { verifyToken: authenticateToken } = require("../../middleware/auth")

router.get("/plans", async (req, res) => {
  try {
    const [plans] = await db.query("SELECT * FROM premium_plans ORDER BY duration_days")
    res.json(plans)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get("/status", authenticateToken, async (req, res) => {
  try {
    const [subscription] = await db.query(
      `
      SELECT us.id, us.user_id, us.plan_id, us.start_date as subscription_start,
             us.end_date as subscription_end, us.is_active,
             pp.name, pp.price, pp.features
      FROM user_subscriptions us
      JOIN premium_plans pp ON us.plan_id = pp.id
      WHERE us.user_id = ? AND us.is_active = true
      ORDER BY us.end_date DESC
      LIMIT 1
    `,
      [req.user.id],
    )

    if (!subscription.length) {
      return res.json({ message: "No active subscription", isActive: false })
    }

    const sub = subscription[0]
    res.json({
      isActive: new Date(sub.subscription_end) > new Date(),
      ...sub,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post("/subscribe", authenticateToken, async (req, res) => {
  try {
    const { plan_id } = req.body

    const [plan] = await db.query("SELECT * FROM premium_plans WHERE id = ?", [plan_id])
    if (!plan.length) {
      return res.status(404).json({ error: "Plan not found" })
    }

    const planDetails = plan[0]
    // Use MySQL DATE_ADD function for accurate date calculation
    const durationDays = planDetails.duration_days || 365

    const [result] = await db.query(
      `
      INSERT INTO user_subscriptions (user_id, plan_id, start_date, end_date, is_active)
      VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? DAY), true)
    `,
      [req.user.id, plan_id, durationDays],
    )
    
    // Get the actual dates that were inserted
    const [insertedSub] = await db.query(
      "SELECT start_date, end_date FROM user_subscriptions WHERE id = ?",
      [result.insertId]
    )
    
    const subscriptionEnd = insertedSub[0].end_date

    res.json({
      message: "Subscription created",
      subscription_id: result.insertId,
      plan: planDetails,
      subscription_end: subscriptionEnd,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post("/cancel", authenticateToken, async (req, res) => {
  try {
    await db.query(
      `
      UPDATE user_subscriptions
      SET is_active = false
      WHERE user_id = ? AND is_active = true
    `,
      [req.user.id],
    )

    res.json({ message: "Subscription cancelled" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
