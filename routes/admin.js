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

// Get all premium users (users with active subscriptions)
router.get("/premium-users", verifyToken, isAdmin, async (req, res) => {
  try {
    const connection = await pool.getConnection()
    
    // Get all active premium users with their subscription details
    const [premiumUsers] = await connection.execute(
      `SELECT 
        u.id,
        u.name,
        u.email,
        s.id as subscription_id,
        s.plan_id,
        s.start_date,
        s.end_date,
        s.is_active,
        COALESCE(p.name, 'Unknown Plan') as plan_name,
        COALESCE(p.price, 0) as price,
        CASE 
          WHEN s.end_date IS NULL THEN 1
          WHEN p.duration_days >= 365 OR p.name LIKE '%Lifetime%' OR p.id = 7 THEN 1
          ELSE 0
        END as is_lifetime
       FROM user_subscriptions s
       INNER JOIN users u ON s.user_id = u.id
       LEFT JOIN premium_plans p ON s.plan_id = p.id
       WHERE s.is_active = 1 
         AND (s.end_date IS NULL OR s.end_date >= CURDATE())
       ORDER BY s.start_date DESC`
    )
    
    connection.release()
    
    res.json({ premium_users: premiumUsers })
  } catch (error) {
    console.error("[Admin] Premium users fetch error:", error)
    res.status(500).json({ error: error.message })
  }
})

// Assign premium access to a user
router.post("/users/:id/assign-premium", verifyToken, isAdmin, async (req, res) => {
  try {
    const { is_lifetime, plan_id } = req.body
    const userId = req.params.id
    const connection = await pool.getConnection()
    
    // Check if user exists
    const [users] = await connection.execute("SELECT id FROM users WHERE id = ?", [userId])
    if (users.length === 0) {
      connection.release()
      return res.status(404).json({ error: "User not found" })
    }
    
    // If plan_id is provided, use it; otherwise find or create a lifetime plan
    let finalPlanId = plan_id
    
    if (!finalPlanId) {
      if (is_lifetime) {
        // Try to find a lifetime plan
        const [lifetimePlans] = await connection.execute(
          "SELECT id FROM premium_plans WHERE name LIKE '%Lifetime%' OR duration_days >= 365 OR id = 7 LIMIT 1"
        )
        
        if (lifetimePlans.length > 0) {
          finalPlanId = lifetimePlans[0].id
        } else {
          // Create a default lifetime plan if none exists
          const [newPlan] = await connection.execute(
            "INSERT INTO premium_plans (name, price, duration_days, features) VALUES (?, ?, ?, ?)",
            ["Lifetime Premium", 0, 99999, JSON.stringify(["Lifetime Access"])]
          )
          finalPlanId = newPlan.insertId
        }
      } else {
        // Default to a 1-year plan
        const [yearlyPlans] = await connection.execute(
          "SELECT id FROM premium_plans WHERE duration_days = 365 OR name LIKE '%Yearly%' LIMIT 1"
        )
        
        if (yearlyPlans.length > 0) {
          finalPlanId = yearlyPlans[0].id
        } else {
          // Create a default yearly plan
          const [newPlan] = await connection.execute(
            "INSERT INTO premium_plans (name, price, duration_days, features) VALUES (?, ?, ?, ?)",
            ["Yearly Premium", 0, 365, JSON.stringify(["Premium Access"])]
          )
          finalPlanId = newPlan.insertId
        }
      }
    }
    
    // Deactivate any existing active subscriptions for this user
    await connection.execute(
      "UPDATE user_subscriptions SET is_active = 0 WHERE user_id = ? AND is_active = 1",
      [userId]
    )
    
    // Create new subscription
    let endDate = null
    if (is_lifetime) {
      // Lifetime subscription - set end_date to far future or NULL
      endDate = null // NULL means never expires
    } else {
      // Calculate end date based on plan duration
      const [planDetails] = await connection.execute(
        "SELECT duration_days FROM premium_plans WHERE id = ?",
        [finalPlanId]
      )
      const durationDays = planDetails.length > 0 ? (planDetails[0].duration_days || 365) : 365
      // Set end date using MySQL DATE_ADD
      const [dateResult] = await connection.execute(
        "SELECT DATE_ADD(NOW(), INTERVAL ? DAY) as end_date",
        [durationDays]
      )
      endDate = dateResult[0].end_date
    }
    
    // Insert new subscription
    const [result] = await connection.execute(
      "INSERT INTO user_subscriptions (user_id, plan_id, start_date, end_date, is_active) VALUES (?, ?, NOW(), ?, 1)",
      [userId, finalPlanId, endDate]
    )
    
    connection.release()
    
    res.status(201).json({
      message: "Premium access assigned successfully",
      subscription_id: result.insertId,
    })
  } catch (error) {
    console.error("[Admin] Assign premium error:", error)
    res.status(500).json({ error: error.message })
  }
})

// Remove premium access from a user
router.delete("/users/:id/remove-premium", verifyToken, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id
    const connection = await pool.getConnection()
    
    // Deactivate all active subscriptions for this user
    const [result] = await connection.execute(
      "UPDATE user_subscriptions SET is_active = 0 WHERE user_id = ? AND is_active = 1",
      [userId]
    )
    
    connection.release()
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "No active premium subscription found for this user" })
    }
    
    res.json({ message: "Premium access removed successfully" })
  } catch (error) {
    console.error("[Admin] Remove premium error:", error)
    res.status(500).json({ error: error.message })
  }
})

// Submit delete account request
router.post("/delete-account-request", verifyToken, isAdmin, async (req, res) => {
  try {
    const { email, password, reason } = req.body

    if (!email || !password || !reason) {
      return res.status(400).json({ error: "Email, password, and reason are required" })
    }

    if (reason.trim().length < 10) {
      return res.status(400).json({ error: "Reason must be at least 10 characters long" })
    }

    const connection = await pool.getConnection()

    // Verify user credentials
    const [users] = await connection.execute(
      "SELECT id, email, password_hash, password FROM users WHERE email = ?",
      [email]
    )

    if (users.length === 0) {
      connection.release()
      return res.status(404).json({ error: "User not found with this email" })
    }

    const user = users[0]
    const userPassword = user.password_hash || user.password

    if (!userPassword) {
      connection.release()
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Verify password
    const bcrypt = require("bcryptjs")
    const passwordValid = await bcrypt.compare(password, userPassword)

    if (!passwordValid) {
      connection.release()
      return res.status(401).json({ error: "Invalid email or password" })
    }

    // Create delete_account_requests table if it doesn't exist
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS delete_account_requests (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          email VARCHAR(255) NOT NULL,
          reason TEXT NOT NULL,
          status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
          requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          processed_at TIMESTAMP NULL,
          processed_by INT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_user_id (user_id),
          INDEX idx_status (status),
          INDEX idx_requested_at (requested_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `)
    } catch (err) {
      // Table might already exist or there's a different error
      if (!err.message.includes("already exists")) {
        console.error("[Admin] Error creating delete_account_requests table:", err)
      }
    }

    // Check if user already has a pending request
    const [existingRequests] = await connection.execute(
      "SELECT id FROM delete_account_requests WHERE user_id = ? AND status = 'pending'",
      [user.id]
    )

    if (existingRequests.length > 0) {
      connection.release()
      return res.status(400).json({ 
        error: "You already have a pending delete account request. Please wait for it to be processed." 
      })
    }

    // Insert the delete account request
    const [result] = await connection.execute(
      "INSERT INTO delete_account_requests (user_id, email, reason, status) VALUES (?, ?, ?, 'pending')",
      [user.id, email, reason.trim()]
    )

    connection.release()

    res.status(201).json({
      message: "Delete account request submitted successfully",
      request_id: result.insertId,
      status: "pending",
    })
  } catch (error) {
    console.error("[Admin] Delete account request error:", error)
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
