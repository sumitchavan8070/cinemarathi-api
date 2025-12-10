const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const pool = require("../config/database")

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.user_type || user.role, // Support both user_type and role
      is_verified: user.is_verified,
    },
    process.env.JWT_SECRET || "your_secret_key",
    { expiresIn: "7d" },
  )
}

const register = async (req, res) => {
  try {
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
      availability 
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
        0 // is_verified defaults to 0
      ]
    )

    const userId = result.insertId

    // Create default subscription with plan_id 6
    try {
      // Get plan details to calculate subscription end date
      const [plans] = await connection.execute(
        "SELECT * FROM premium_plans WHERE id = ?",
        [6]
      )

      if (plans.length > 0) {
        const plan = plans[0]
        const subscriptionStart = new Date()
        // Calculate end date based on duration_days if available, otherwise set to 1 year
        const durationDays = plan.duration_days || 365
        const subscriptionEnd = new Date(subscriptionStart.getTime() + durationDays * 24 * 60 * 60 * 1000)

        await connection.execute(
          `INSERT INTO user_subscriptions (user_id, plan_id, subscription_start, subscription_end, is_active)
           VALUES (?, ?, ?, ?, ?)`,
          [userId, 6, subscriptionStart, subscriptionEnd, true]
        )
      } else {
        // If plan_id 6 doesn't exist, create subscription with default 1 year duration
        const subscriptionStart = new Date()
        const subscriptionEnd = new Date(subscriptionStart.getTime() + 365 * 24 * 60 * 60 * 1000)
        
        await connection.execute(
          `INSERT INTO user_subscriptions (user_id, plan_id, subscription_start, subscription_end, is_active)
           VALUES (?, ?, ?, ?, ?)`,
          [userId, 6, subscriptionStart, subscriptionEnd, true]
        )
      }
    } catch (subscriptionError) {
      // Log error but don't fail registration if subscription creation fails
      console.error("Error creating default subscription:", subscriptionError.message)
      // Continue with registration even if subscription fails
    }

    connection.release()

    const token = generateToken({
      id: userId,
      email,
      name,
      user_type,
      is_verified: false,
    })

    res.status(201).json({
      message: "User registered successfully",
      userId: userId,
      token,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" })
    }

    const connection = await pool.getConnection()

    // Try both password and password_hash column names
    const [users] = await connection.execute("SELECT * FROM users WHERE email = ?", [email])

    connection.release()

    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const user = users[0]
    
    // Check for password in either 'password' or 'password_hash' column
    const userPassword = user.password || user.password_hash
    
    if (!userPassword) {
      console.error(`Login attempt for ${email}: User found but no password field exists`)
      return res.status(401).json({ error: "Invalid credentials - no password set for user" })
    }

    const passwordMatch = await bcrypt.compare(password, userPassword)
    
    if (!passwordMatch) {
      console.error(`Login attempt for ${email}: Password mismatch`)
    }

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const token = generateToken(user)

    res.json({
      message: "Login successful",
      userId: user.id,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.user_type || user.role, // Support both user_type and role
      },
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports = { register, login, generateToken }
