const express = require("express")
const { verifyToken } = require("../middleware/auth")
const pool = require("../config/database")

const router = express.Router()

router.get("/profile", verifyToken, async (req, res) => {
  try {
    const connection = await pool.getConnection()

    // Use user_type instead of role, contact instead of phone
    const [users] = await connection.execute(
      `SELECT id, name, email, contact, user_type, gender, dob, location, 
       bio, portfolio_url, availability, is_verified, created_at 
       FROM users WHERE id = ?`,
      [req.user.id],
    )

    if (users.length === 0) {
      connection.release()
      return res.status(404).json({ error: "User not found" })
    }

    const user = users[0]
    const userType = user.user_type || req.user.role

    // Get role-specific data
    let roleData = null
    if (userType === "actor") {
      const [actorData] = await connection.execute("SELECT * FROM actors WHERE user_id = ?", [req.user.id])
      roleData = actorData[0]
    } else if (userType === "technician") {
      const [techData] = await connection.execute("SELECT * FROM technicians WHERE user_id = ?", [req.user.id])
      roleData = techData[0]
    } else if (userType === "production_house") {
      const [prodData] = await connection.execute("SELECT * FROM production_houses WHERE user_id = ?", [req.user.id])
      roleData = prodData[0]
    }

    connection.release()

    res.json({
      user: {
        ...user,
        role: user.user_type, // Include role alias for backward compatibility
      },
      roleData,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put("/profile", verifyToken, async (req, res) => {
  try {
    const { 
      name, 
      contact, 
      gender, 
      dob, 
      location, 
      bio, 
      portfolio_url, 
      availability 
    } = req.body
    
    const connection = await pool.getConnection()

    // Build dynamic update query based on provided fields
    const updates = []
    const values = []
    
    if (name !== undefined) {
      updates.push("name = ?")
      values.push(name)
    }
    if (contact !== undefined) {
      updates.push("contact = ?")
      values.push(contact)
    }
    if (gender !== undefined) {
      updates.push("gender = ?")
      values.push(gender)
    }
    if (dob !== undefined) {
      updates.push("dob = ?")
      values.push(dob)
    }
    if (location !== undefined) {
      updates.push("location = ?")
      values.push(location)
    }
    if (bio !== undefined) {
      updates.push("bio = ?")
      values.push(bio)
    }
    if (portfolio_url !== undefined) {
      updates.push("portfolio_url = ?")
      values.push(portfolio_url)
    }
    if (availability !== undefined) {
      updates.push("availability = ?")
      values.push(availability)
    }

    if (updates.length === 0) {
      connection.release()
      return res.status(400).json({ error: "No fields to update" })
    }

    values.push(req.user.id)
    await connection.execute(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
      values
    )

    connection.release()

    res.json({ message: "Profile updated successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get("/actors/:id", async (req, res) => {
  try {
    const connection = await pool.getConnection()

    const [actor] = await connection.execute(
      'SELECT u.*, a.* FROM users u LEFT JOIN actors a ON u.id = a.user_id WHERE u.id = ? AND u.user_type = "actor"',
      [req.params.id],
    )

    connection.release()

    if (actor.length === 0) {
      return res.status(404).json({ error: "Actor not found" })
    }

    res.json(actor[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put("/actors/profile", verifyToken, async (req, res) => {
  try {
    const { category, height_cm, weight_kg, skills, experience_years, audition_link, awards } = req.body
    const connection = await pool.getConnection()

    const [existing] = await connection.execute("SELECT user_id FROM actors WHERE user_id = ?", [req.user.id])

    if (existing.length > 0) {
      await connection.execute(
        "UPDATE actors SET category = ?, height_cm = ?, weight_kg = ?, skills = ?, experience_years = ?, audition_link = ?, awards = ? WHERE user_id = ?",
        [category, height_cm, weight_kg, skills, experience_years, audition_link, awards, req.user.id],
      )
    } else {
      await connection.execute(
        "INSERT INTO actors (user_id, category, height_cm, weight_kg, skills, experience_years, audition_link, awards) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [req.user.id, category, height_cm, weight_kg, skills, experience_years, audition_link, awards],
      )
    }

    connection.release()
    res.json({ message: "Actor profile updated" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get("/actors", async (req, res) => {
  try {
    const { category, gender } = req.query
    let query = 'SELECT u.*, a.* FROM users u LEFT JOIN actors a ON u.id = a.user_id WHERE u.user_type = "actor"'
    const params = []

    if (category) {
      query += " AND a.category = ?"
      params.push(category)
    }
    if (gender) {
      query += " AND u.gender = ?"
      params.push(gender)
    }

    const connection = await pool.getConnection()
    const [actors] = await connection.execute(query, params)
    connection.release()

    res.json(actors)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
