const express = require("express")
const { register, login, changePassword } = require("../controllers/authController")
const { verifyToken } = require("../middleware/auth")
const pool = require("../config/database")

const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.post("/change-password", verifyToken, changePassword)

// Public delete account request endpoint
router.post("/delete-account-request", async (req, res) => {
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
        console.error("[Auth] Error creating delete_account_requests table:", err)
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
    console.error("[Auth] Delete account request error:", error)
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
