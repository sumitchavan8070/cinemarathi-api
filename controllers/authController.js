const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const pool = require("../config/database")

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      is_verified: user.is_verified,
    },
    process.env.JWT_SECRET || "your_secret_key",
    { expiresIn: "7d" },
  )
}

const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, gender } = req.body

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Missing required fields" })
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

    // Create user
    const [result] = await connection.execute(
      "INSERT INTO users (name, email, password, phone, role, gender) VALUES (?, ?, ?, ?, ?, ?)",
      [name, email, hashedPassword, phone || null, role, gender || null],
    )

    connection.release()

    const token = generateToken({
      id: result.insertId,
      email,
      name,
      role,
      is_verified: false,
    })

    res.status(201).json({
      message: "User registered successfully",
      userId: result.insertId,
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

    const [users] = await connection.execute("SELECT * FROM users WHERE email = ?", [email])

    connection.release()

    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const user = users[0]
    const passwordMatch = await bcrypt.compare(password, user.password)

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
        role: user.role,
      },
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports = { register, login, generateToken }
