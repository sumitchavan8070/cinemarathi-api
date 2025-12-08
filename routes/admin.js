const express = require("express")
const { verifyToken, isAdmin } = require("../middleware/auth")
const pool = require("../config/database")

const router = express.Router()

router.get("/dashboard", verifyToken, isAdmin, async (req, res) => {
  try {
    const connection = await pool.getConnection()

    // Get all stats
    const [totalUsers] = await connection.execute("SELECT COUNT(*) as count FROM users")
    const [totalCasting] = await connection.execute("SELECT COUNT(*) as count FROM casting_calls")
    const [totalApplications] = await connection.execute("SELECT COUNT(*) as count FROM applications")
    const [recentUsers] = await connection.execute(
      "SELECT id, name, email, user_type as role, created_at FROM users ORDER BY created_at DESC LIMIT 10",
    )

    connection.release()

    res.json({
      totalUsers: totalUsers[0].count,
      totalCastingCalls: totalCasting[0].count,
      totalApplications: totalApplications[0].count,
      recentUsers,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get("/users", verifyToken, isAdmin, async (req, res) => {
  try {
    const { user_type } = req.query
    let query = "SELECT id, name, email, contact as phone, user_type as role, gender, is_verified, created_at FROM users"
    const params = []

    if (user_type) {
      query += " WHERE user_type = ?"
      params.push(user_type)
    }

    query += " ORDER BY created_at DESC"

    const connection = await pool.getConnection()
    const [users] = await connection.execute(query, params)
    connection.release()

    res.json({ users })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put("/users/:id/verify", verifyToken, isAdmin, async (req, res) => {
  try {
    const { is_verified } = req.body
    const connection = await pool.getConnection()

    await connection.execute("UPDATE users SET is_verified = ? WHERE id = ?", [is_verified, req.params.id])

    connection.release()

    res.json({ message: "User verification status updated" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put("/users/:id/suspend", verifyToken, isAdmin, async (req, res) => {
  try {
    // Note: Your schema doesn't have is_active, so we'll use is_verified = 0 to suspend
    // Or you can add an is_active column later
    const connection = await pool.getConnection()
    await connection.execute("UPDATE users SET is_verified = 0 WHERE id = ?", [req.params.id])
    connection.release()
    res.json({ message: "User suspended" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.delete("/users/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const connection = await pool.getConnection()
    await connection.execute("DELETE FROM users WHERE id = ?", [req.params.id])
    connection.release()
    res.json({ message: "User deleted" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get("/casting-calls", verifyToken, isAdmin, async (req, res) => {
  try {
    const connection = await pool.getConnection()
    const [calls] = await connection.execute(
      `SELECT cc.*, u.name as production_house_name,
              COUNT(DISTINCT a.id) as total_applications
       FROM casting_calls cc 
       JOIN users u ON cc.production_house_id = u.id 
       LEFT JOIN applications a ON cc.id = a.casting_call_id
       GROUP BY cc.id
       ORDER BY cc.created_at DESC`,
    )
    connection.release()

    res.json({ casting_calls: calls })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get("/casting-calls/:id/applications", verifyToken, isAdmin, async (req, res) => {
  try {
    const connection = await pool.getConnection()
    const [applications] = await connection.execute(
      `SELECT a.*, u.name as applicant_name, u.email as applicant_email
       FROM applications a
       JOIN users u ON a.applicant_id = u.id
       WHERE a.casting_call_id = ?`,
      [req.params.id]
    )
    connection.release()

    res.json({ applications })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put("/casting-calls/:id/approve", verifyToken, isAdmin, async (req, res) => {
  try {
    const connection = await pool.getConnection()
    // Try to update is_approved, if column doesn't exist, just return success
    try {
      await connection.execute("UPDATE casting_calls SET is_approved = 1 WHERE id = ?", [req.params.id])
    } catch (err) {
      // If column doesn't exist, we can't approve but don't fail
      if (err.message && err.message.includes("Unknown column")) {
        connection.release()
        return res.json({ message: "Approval feature not available (is_approved column missing)" })
      }
      throw err
    }
    connection.release()
    res.json({ message: "Casting call approved successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put("/casting-calls/:id/reject", verifyToken, isAdmin, async (req, res) => {
  try {
    const connection = await pool.getConnection()
    // Try to update is_approved, if column doesn't exist, delete the casting call instead
    try {
      await connection.execute("UPDATE casting_calls SET is_approved = 0 WHERE id = ?", [req.params.id])
    } catch (err) {
      // If column doesn't exist, delete the casting call
      if (err.message && err.message.includes("Unknown column")) {
        await connection.execute("DELETE FROM applications WHERE casting_call_id = ?", [req.params.id])
        await connection.execute("DELETE FROM casting_calls WHERE id = ?", [req.params.id])
        connection.release()
        return res.json({ message: "Casting call deleted successfully" })
      }
      throw err
    }
    connection.release()
    res.json({ message: "Casting call rejected successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.delete("/casting-calls/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const connection = await pool.getConnection()

    // Delete related applications first
    await connection.execute("DELETE FROM applications WHERE casting_call_id = ?", [req.params.id])
    await connection.execute("DELETE FROM casting_calls WHERE id = ?", [req.params.id])

    connection.release()

    res.json({ message: "Casting call deleted" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get("/news", verifyToken, isAdmin, async (req, res) => {
  try {
    const connection = await pool.getConnection()
    const [news] = await connection.execute("SELECT * FROM news_feed ORDER BY created_at DESC")
    connection.release()

    res.json(news)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post("/news", verifyToken, isAdmin, async (req, res) => {
  try {
    const { title, content, image_url } = req.body
    const connection = await pool.getConnection()

    const [result] = await connection.execute("INSERT INTO news_feed (title, content, image_url) VALUES (?, ?, ?)", [
      title,
      content,
      image_url || null,
    ])

    connection.release()

    res.status(201).json({
      message: "News created",
      newsId: result.insertId,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.delete("/news/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const connection = await pool.getConnection()
    await connection.execute("DELETE FROM news_feed WHERE id = ?", [req.params.id])
    connection.release()

    res.json({ message: "News deleted" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get("/featured-profiles", verifyToken, isAdmin, async (req, res) => {
  try {
    const connection = await pool.getConnection()
    const [featured] = await connection.execute(
      "SELECT f.*, u.name, u.email, u.user_type as role FROM featured_profiles f JOIN users u ON f.user_id = u.id ORDER BY f.featured_date DESC",
    )
    connection.release()

    res.json(featured)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post("/featured-profiles", verifyToken, isAdmin, async (req, res) => {
  try {
    const { user_id } = req.body
    const connection = await pool.getConnection()

    const [result] = await connection.execute(
      "INSERT INTO featured_profiles (user_id, featured_date) VALUES (?, CURDATE())",
      [user_id],
    )

    connection.release()

    res.status(201).json({
      message: "Profile featured",
      featuredId: result.insertId,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get("/subscriptions", verifyToken, isAdmin, async (req, res) => {
  try {
    const connection = await pool.getConnection()
    
    // Use LEFT JOIN in case premium_plans table doesn't exist or has missing data
    const [subs] = await connection.execute(
      `SELECT s.id, s.user_id, s.plan_id, 
              s.start_date,
              s.end_date,
              s.is_active,
              u.name as user_name, u.email, 
              COALESCE(p.name, 'Unknown Plan') as plan_name, 
              COALESCE(p.price, 0) as price 
       FROM user_subscriptions s 
       LEFT JOIN users u ON s.user_id = u.id 
       LEFT JOIN premium_plans p ON s.plan_id = p.id 
       ORDER BY s.start_date DESC`,
    )
    connection.release()

    res.json({ subscriptions: subs })
  } catch (error) {
    console.error("[Admin] Subscriptions fetch error:", error)
    res.status(500).json({ error: error.message })
  }
})

router.put("/subscriptions/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const { plan_id, start_date, end_date, is_active } = req.body
    const connection = await pool.getConnection()

    // Build update query dynamically
    const updates = []
    const params = []

    if (plan_id !== undefined) {
      updates.push("plan_id = ?")
      params.push(plan_id)
    }
    if (start_date !== undefined) {
      updates.push("start_date = ?")
      params.push(start_date)
    }
    if (end_date !== undefined) {
      updates.push("end_date = ?")
      params.push(end_date)
    }
    if (is_active !== undefined) {
      updates.push("is_active = ?")
      params.push(is_active ? 1 : 0)
    }

    if (updates.length === 0) {
      connection.release()
      return res.status(400).json({ error: "No fields to update" })
    }

    params.push(req.params.id)

    await connection.execute(
      `UPDATE user_subscriptions SET ${updates.join(", ")} WHERE id = ?`,
      params
    )

    connection.release()
    res.json({ message: "Subscription updated successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post("/subscriptions", verifyToken, isAdmin, async (req, res) => {
  try {
    const { user_id, plan_id, start_date, end_date, is_active } = req.body

    if (!user_id || !plan_id || !start_date || !end_date) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const connection = await pool.getConnection()
    const [result] = await connection.execute(
      "INSERT INTO user_subscriptions (user_id, plan_id, start_date, end_date, is_active) VALUES (?, ?, ?, ?, ?)",
      [user_id, plan_id, start_date, end_date, is_active ? 1 : 0]
    )
    connection.release()

    res.status(201).json({ message: "Subscription created successfully", id: result.insertId })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.delete("/subscriptions/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const connection = await pool.getConnection()
    await connection.execute("DELETE FROM user_subscriptions WHERE id = ?", [req.params.id])
    connection.release()
    res.json({ message: "Subscription deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
