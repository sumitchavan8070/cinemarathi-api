const bcrypt = require("bcryptjs")
const pool = require("../config/database")

async function createAdmin() {
  const email = process.argv[2] || "admin@cinemarathi.com"
  const password = process.argv[3] || "admin123"
  const name = process.argv[4] || "Admin User"

  try {
    const connection = await pool.getConnection()

    // Check if admin already exists
    const [existing] = await connection.execute("SELECT id FROM users WHERE email = ? AND user_type = 'admin'", [email])

    if (existing.length > 0) {
      console.log(`Admin user with email ${email} already exists!`)
      console.log("To update the password, you can run:")
      console.log(`UPDATE users SET password_hash = ? WHERE email = ? AND user_type = 'admin'`)
      connection.release()
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create admin user (note: no is_active column in your schema)
    const [result] = await connection.execute(
      "INSERT INTO users (name, email, password_hash, user_type, is_verified) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashedPassword, "admin", 1]
    )

    connection.release()

    console.log("✅ Admin user created successfully!")
    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)
    console.log(`User ID: ${result.insertId}`)
    console.log("\nYou can now login at: http://localhost:3000/admin/login")
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message)
    process.exit(1)
  }
}

createAdmin()

