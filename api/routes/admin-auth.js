const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { verifyToken, isAdmin } = require("../../middleware/auth")

// Admin Login - Verify credentials from database
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" })
    }

    const pool = require("../../config/database")
    const connection = await pool.getConnection()

    const query = "SELECT * FROM users WHERE email = ? AND user_type = 'admin'"
    const [result] = await connection.execute(query, [email])

    if (result.length === 0) {
      connection.release()
      return res.status(401).json({ error: "Invalid email or password" })
    }

    const user = result[0]
    connection.release()

    // Check for password in either 'password' or 'password_hash' column
    const userPassword = user.password_hash || user.password
    
    if (!userPassword) {
      return res.status(401).json({ error: "Invalid email or password" })
    }

    const passwordValid = await bcrypt.compare(password, userPassword)

    if (!passwordValid) {
      return res.status(401).json({ error: "Invalid email or password" })
    }

    if (!user.is_verified) {
      return res.status(403).json({ error: "Account not verified by superadmin" })
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.user_type, // Map user_type to role for JWT
        is_verified: user.is_verified,
      },
      process.env.JWT_SECRET || "your_secret_key",
      { expiresIn: "7d" },
    )

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.user_type, // Map user_type to role for response
      },
    })
  } catch (error) {
    console.error("[v0] Admin login error:", error)
    res.status(500).json({ error: "Server error", message: error.message })
  }
})

// Verify admin token
router.post("/verify", verifyToken, isAdmin, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  })
})

// Logout (client-side token removal)
router.post("/logout", verifyToken, (req, res) => {
  res.json({ success: true, message: "Logged out successfully" })
})

module.exports = router
