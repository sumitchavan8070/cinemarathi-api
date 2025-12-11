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

router.post("/users", verifyToken, isAdmin, async (req, res) => {
  try {
    const bcrypt = require("bcryptjs")
    const {
      name,
      email,
      password,
      user_type,
      gender,
      dob,
      location,
      contact,
      bio,
      portfolio_url,
      availability,
      is_verified,
      is_premium,
    } = req.body

    if (!name || !email || !password || !user_type) {
      return res.status(400).json({ error: "Missing required fields: name, email, password, and user_type are required" })
    }

    const connection = await pool.getConnection()

    // Check if user exists
    const [existing] = await connection.execute("SELECT id FROM users WHERE email = ?", [email])

    if (existing.length > 0) {
      connection.release()
      return res.status(400).json({ error: "Email already registered" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user with all fields from schema
    const [result] = await connection.execute(
      `INSERT INTO users (
        name, email, password_hash, user_type, gender, dob, 
        location, contact, bio, portfolio_url, availability, is_verified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        hashedPassword,
        user_type,
        gender || null,
        dob || null,
        location || null,
        contact || null,
        bio || null,
        portfolio_url || null,
        availability || null,
        is_verified !== undefined ? (is_verified ? 1 : 0) : 0,
      ],
    )

    const userId = result.insertId

    // Create subscription based on is_premium flag
    if (user_type !== "admin") {
      try {
        if (is_premium) {
          // Create lifetime premium subscription
          // Deactivate any existing subscriptions first (shouldn't be any for new user, but safe to do)
          await connection.execute(
            "UPDATE user_subscriptions SET is_active = 0 WHERE user_id = ? AND is_active = 1",
            [userId]
          )

          // Find lifetime plan or use plan_id 7
          const [lifetimePlan] = await connection.execute(
            "SELECT id FROM premium_plans WHERE name = 'Lifetime Premium' OR id = 7 LIMIT 1"
          )
          const finalPlanId = lifetimePlan.length > 0 ? lifetimePlan[0].id : 7

          // Check if is_lifetime column exists
          const [columns] = await connection.execute(
            "SHOW COLUMNS FROM user_subscriptions LIKE 'is_lifetime'"
          )
          const hasLifetimeColumn = columns.length > 0

          // Set end_date far in the future (year 2100)
          const finalEndDate = "2100-12-31 23:59:59"

          if (hasLifetimeColumn) {
            await connection.execute(
              `INSERT INTO user_subscriptions (user_id, plan_id, start_date, end_date, is_active, is_lifetime)
               VALUES (?, ?, NOW(), ?, ?, ?)`,
              [userId, finalPlanId, finalEndDate, true, 1]
            )
          } else {
            await connection.execute(
              `INSERT INTO user_subscriptions (user_id, plan_id, start_date, end_date, is_active)
               VALUES (?, ?, NOW(), ?, ?)`,
              [userId, finalPlanId, finalEndDate, true]
            )
          }
        } else {
          // Create default subscription with plan_id 6
          const [plans] = await connection.execute("SELECT * FROM premium_plans WHERE id = ?", [6])

          if (plans.length > 0) {
            const plan = plans[0]
            const durationDays = plan.duration_days || 365

            await connection.execute(
              `INSERT INTO user_subscriptions (user_id, plan_id, start_date, end_date, is_active)
               VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? DAY), ?)`,
              [userId, 6, durationDays, true],
            )
          } else {
            await connection.execute(
              `INSERT INTO user_subscriptions (user_id, plan_id, start_date, end_date, is_active)
               VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 365 DAY), ?)`,
              [userId, 6, true],
            )
          }
        }
      } catch (subscriptionError) {
        console.error("Error creating subscription:", subscriptionError.message)
        // Don't fail user creation if subscription creation fails
      }
    }

    connection.release()

    res.status(201).json({
      message: is_premium ? "User created successfully with lifetime premium access" : "User created successfully",
      userId: userId,
      is_premium: is_premium || false,
    })
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

router.post("/casting-calls", verifyToken, isAdmin, async (req, res) => {
  try {
    const {
      production_house_id,
      project_title,
      role,
      gender,
      min_age,
      max_age,
      skills_required,
      location,
      budget_per_day,
      audition_date,
      description,
    } = req.body

    if (!production_house_id || !project_title || !role) {
      return res.status(400).json({ error: "Missing required fields: production_house_id, project_title, and role are required" })
    }

    const connection = await pool.getConnection()

    // Verify production house exists
    const [productionHouses] = await connection.execute(
      "SELECT id FROM users WHERE id = ? AND user_type = 'production_house'",
      [production_house_id]
    )

    if (productionHouses.length === 0) {
      connection.release()
      return res.status(404).json({ error: "Production house not found" })
    }

    // Check if is_approved column exists
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM casting_calls LIKE 'is_approved'"
    )
    const hasApprovalColumn = columns.length > 0

    // Insert casting call
    let result
    if (hasApprovalColumn) {
      [result] = await connection.execute(
        `INSERT INTO casting_calls (
          production_house_id, project_title, role, gender, min_age, max_age,
          skills_required, location, budget_per_day, audition_date, description, is_approved
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          production_house_id,
          project_title,
          role,
          gender || null,
          min_age || null,
          max_age || null,
          skills_required || null,
          location || null,
          budget_per_day || null,
          audition_date || null,
          description || null,
          1 // Auto-approve when created by admin
        ]
      )
    } else {
      [result] = await connection.execute(
        `INSERT INTO casting_calls (
          production_house_id, project_title, role, gender, min_age, max_age,
          skills_required, location, budget_per_day, audition_date, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          production_house_id,
          project_title,
          role,
          gender || null,
          min_age || null,
          max_age || null,
          skills_required || null,
          location || null,
          budget_per_day || null,
          audition_date || null,
          description || null
        ]
      )
    }

    connection.release()

    res.status(201).json({
      message: "Casting call created successfully",
      castingCallId: result.insertId,
    })
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
    // Use start_date and end_date (actual column names in database)
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
    // Use start_date and end_date (actual column names in database)
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
      return res.status(400).json({ error: "Missing required fields: user_id, plan_id, start_date, end_date" })
    }

    const connection = await pool.getConnection()
    // Use start_date and end_date (actual column names in database)
    const [result] = await connection.execute(
      "INSERT INTO user_subscriptions (user_id, plan_id, start_date, end_date, is_active) VALUES (?, ?, ?, ?, ?)",
      [user_id, plan_id, start_date, end_date, is_active !== undefined ? (is_active ? 1 : 0) : 1]
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

// Get users without any active subscription
router.get("/users/without-subscription", verifyToken, isAdmin, async (req, res) => {
  try {
    const connection = await pool.getConnection()
    const [users] = await connection.execute(
      `SELECT DISTINCT u.id, u.name, u.email, u.user_type, u.created_at
       FROM users u
       LEFT JOIN user_subscriptions us ON u.id = us.user_id AND us.is_active = 1
       WHERE us.id IS NULL
       AND u.user_type != 'admin'
       ORDER BY u.created_at DESC`
    )
    connection.release()

    res.json({ users })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Assign lifetime/premium plan to user
router.post("/users/:userId/assign-premium", verifyToken, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params
    const { plan_id, is_lifetime, end_date } = req.body
    
    const connection = await pool.getConnection()

    // Check if user exists
    const [users] = await connection.execute("SELECT id FROM users WHERE id = ?", [userId])
    if (users.length === 0) {
      connection.release()
      return res.status(404).json({ error: "User not found" })
    }

    // Deactivate any existing active subscriptions
    await connection.execute(
      "UPDATE user_subscriptions SET is_active = 0 WHERE user_id = ? AND is_active = 1",
      [userId]
    )

    // Determine plan_id - use provided one or find lifetime plan
    let finalPlanId = plan_id
    if (!finalPlanId) {
      const [lifetimePlan] = await connection.execute(
        "SELECT id FROM premium_plans WHERE name = 'Lifetime Premium' LIMIT 1"
      )
      if (lifetimePlan.length > 0) {
        finalPlanId = lifetimePlan[0].id
      } else {
        // If no lifetime plan exists, use plan_id 6 as fallback
        finalPlanId = 6
      }
    }

    // Determine end_date
    let finalEndDate = end_date
    if (is_lifetime) {
      // Set end_date far in the future (year 2100)
      finalEndDate = "2100-12-31 23:59:59"
    } else if (!finalEndDate) {
      // Get plan duration or default to 1 year
      const [plans] = await connection.execute("SELECT duration_days FROM premium_plans WHERE id = ?", [finalPlanId])
      const durationDays = plans.length > 0 ? (plans[0].duration_days || 365) : 365
      finalEndDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ')
    }

    // Check if is_lifetime column exists
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM user_subscriptions LIKE 'is_lifetime'"
    )
    const hasLifetimeColumn = columns.length > 0

    // Insert new subscription
    if (hasLifetimeColumn) {
      await connection.execute(
        `INSERT INTO user_subscriptions (user_id, plan_id, start_date, end_date, is_active, is_lifetime)
         VALUES (?, ?, NOW(), ?, ?, ?)`,
        [userId, finalPlanId, finalEndDate, true, is_lifetime ? 1 : 0]
      )
    } else {
      await connection.execute(
        `INSERT INTO user_subscriptions (user_id, plan_id, start_date, end_date, is_active)
         VALUES (?, ?, NOW(), ?, ?, ?)`,
        [userId, finalPlanId, finalEndDate, true]
      )
    }

    connection.release()

    res.json({
      message: is_lifetime ? "Lifetime premium assigned successfully" : "Premium plan assigned successfully",
      userId: parseInt(userId),
      plan_id: finalPlanId,
      is_lifetime: is_lifetime || false,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get all lifetime/premium users
router.get("/premium-users", verifyToken, isAdmin, async (req, res) => {
  try {
    const connection = await pool.getConnection()
    
    // Check if is_lifetime column exists
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM user_subscriptions LIKE 'is_lifetime'"
    )
    const hasLifetimeColumn = columns.length > 0

    let query = `
      SELECT DISTINCT
        u.id,
        u.name,
        u.email,
        u.user_type,
        us.plan_id,
        us.start_date,
        us.end_date,
        us.is_active,
        pp.name as plan_name,
        pp.price as plan_price
    `
    
    if (hasLifetimeColumn) {
      query += `, us.is_lifetime`
    } else {
      query += `, CASE WHEN us.end_date >= '2100-01-01' THEN 1 ELSE 0 END as is_lifetime`
    }
    
    query += `
      FROM users u
      INNER JOIN user_subscriptions us ON u.id = us.user_id
      LEFT JOIN premium_plans pp ON us.plan_id = pp.id
      WHERE us.is_active = 1
      AND (${hasLifetimeColumn ? 'us.is_lifetime = 1' : "us.end_date >= '2100-01-01'"})
      ORDER BY us.start_date DESC
    `

    const [premiumUsers] = await connection.execute(query)
    connection.release()

    res.json({ premium_users: premiumUsers })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Remove premium/lifetime access
router.delete("/users/:userId/remove-premium", verifyToken, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params
    const connection = await pool.getConnection()

    // Deactivate all active subscriptions for this user
    await connection.execute(
      "UPDATE user_subscriptions SET is_active = 0 WHERE user_id = ? AND is_active = 1",
      [userId]
    )

    connection.release()

    res.json({ message: "Premium access removed successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
