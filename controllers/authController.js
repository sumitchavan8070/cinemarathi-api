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
      availability,
      skills,
      profession,
      instagram,
      youtube
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

    // If user is an actor, create actor profile with skills and profession
    if (user_type === "actor") {
      try {
        // Convert skills array to JSON string if it's an array
        let skillsValue = null
        if (skills) {
          if (Array.isArray(skills)) {
            skillsValue = JSON.stringify(skills)
          } else if (typeof skills === 'string') {
            // If it's already a string, try to parse it or use as is
            try {
              JSON.parse(skills) // Validate it's valid JSON
              skillsValue = skills
            } catch {
              // If not valid JSON, wrap it in array
              skillsValue = JSON.stringify([skills])
            }
          }
        }

        // Use profession as category, or use profession field if it exists
        const category = profession || null

        // Try to insert with all new columns (profession, instagram, youtube)
        try {
          await connection.execute(
            `INSERT INTO actors (user_id, category, skills, profession, instagram, youtube) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, category, skillsValue, profession || null, instagram || null, youtube || null]
          )
        } catch (columnError) {
          // If new columns don't exist, try with profession only
          if (columnError.message.includes("Unknown column 'profession'") || 
              columnError.message.includes("Unknown column 'instagram'") ||
              columnError.message.includes("Unknown column 'youtube'")) {
            try {
              // Try with profession only
              await connection.execute(
                `INSERT INTO actors (user_id, category, skills, profession) 
                 VALUES (?, ?, ?, ?)`,
                [userId, category, skillsValue, profession || null]
              )
            } catch (professionError) {
              // If profession also doesn't exist, insert without it
              if (professionError.message.includes("Unknown column 'profession'")) {
                await connection.execute(
                  `INSERT INTO actors (user_id, category, skills) 
                   VALUES (?, ?, ?)`,
                  [userId, category, skillsValue]
                )
              } else {
                throw professionError
              }
            }
          } else {
            throw columnError
          }
        }
      } catch (actorError) {
        console.error("Error creating actor profile:", actorError.message)
        // Continue with registration even if actor profile creation fails
      }
    }

    // Create default subscription with plan_id 6
    try {
      // Get plan details to calculate subscription end date
      const [plans] = await connection.execute(
        "SELECT * FROM premium_plans WHERE id = ?",
        [6]
      )

      if (plans.length > 0) {
        const plan = plans[0]
        // Use MySQL DATE_ADD function for accurate date calculation
        // Calculate end date based on duration_days if available, otherwise set to 1 year
        const durationDays = plan.duration_days || 365
        
        await connection.execute(
          `INSERT INTO user_subscriptions (user_id, plan_id, start_date, end_date, is_active)
           VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? DAY), ?)`,
          [userId, 6, durationDays, true]
        )
      } else {
        // If plan_id 6 doesn't exist, create subscription with default 1 year duration (365 days)
        await connection.execute(
          `INSERT INTO user_subscriptions (user_id, plan_id, start_date, end_date, is_active)
           VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 365 DAY), ?)`,
          [userId, 6, true]
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
      return res.status(200).json({ status: 0, msg: "" })
    }

    const connection = await pool.getConnection()

    // Try both password and password_hash column names
    const [users] = await connection.execute("SELECT * FROM users WHERE email = ?", [email])

    connection.release()

    if (users.length === 0) {
      return res.status(200).json({ status: 0, msg: "" })
    }

    const user = users[0]
    
    // Check for password in either 'password' or 'password_hash' column
    const userPassword = user.password || user.password_hash
    
    if (!userPassword) {
      console.error(`Login attempt for ${email}: User found but no password field exists`)
      return res.status(200).json({ status: 0, msg: "" })
    }

    const passwordMatch = await bcrypt.compare(password, userPassword)
    
    if (!passwordMatch) {
      console.error(`Login attempt for ${email}: Password mismatch`)
      return res.status(200).json({ status: 0, msg: "" })
    }

    const token = generateToken(user)

    res.json({
      status: 1,
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
    console.error("[Login API] Error:", error)
    res.status(200).json({ status: 0, msg: "" })
  }
}

module.exports = { register, login, generateToken }
