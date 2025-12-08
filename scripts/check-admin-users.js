const pool = require("../config/database")

async function checkAdminUsers() {
  try {
    const connection = await pool.getConnection()

    // Check for admin users
    const [admins] = await connection.execute(
      "SELECT id, name, email, user_type, is_verified, created_at FROM users WHERE user_type = 'admin'"
    )

    connection.release()

    if (admins.length === 0) {
      console.log("❌ No admin users found in the database.")
      console.log("\nTo create an admin user, run:")
      console.log("  npm run create-admin")
      return
    }

    console.log(`✅ Found ${admins.length} admin user(s):\n`)
    console.log("┌─────┬──────────────────────┬──────────────────────────────┬──────────┬─────────────┬─────────────────────┐")
    console.log("│ ID  │ Name                 │ Email                        │ Type     │ Verified    │ Created At          │")
    console.log("├─────┼──────────────────────┼──────────────────────────────┼──────────┼─────────────┼─────────────────────┤")

    admins.forEach((admin) => {
      const id = String(admin.id).padEnd(4)
      const name = (admin.name || "").padEnd(20).substring(0, 20)
      const email = (admin.email || "").padEnd(28).substring(0, 28)
      const userType = (admin.user_type || "").padEnd(8)
      const verified = admin.is_verified ? "✅ Yes" : "❌ No"
      const verifiedStr = verified.padEnd(11)
      const createdAt = admin.created_at ? new Date(admin.created_at).toLocaleString() : "N/A"
      const createdAtStr = createdAt.padEnd(19).substring(0, 19)

      console.log(`│ ${id} │ ${name} │ ${email} │ ${userType} │ ${verifiedStr} │ ${createdAtStr} │`)
    })

    console.log("└─────┴──────────────────────┴──────────────────────────────┴──────────┴─────────────┴─────────────────────┘")

    console.log("\n📝 Notes:")
    console.log("  - Only users with is_verified = 1 (or true) can login")
    console.log("  - To create a new admin user, run: npm run create-admin")

    // Check which admins can actually login
    const loginableAdmins = admins.filter((admin) => admin.is_verified)
    if (loginableAdmins.length === 0) {
      console.log("\n⚠️  WARNING: No admin users can login!")
      console.log("   All admin users are either not verified or inactive.")
    } else {
      console.log(`\n✅ ${loginableAdmins.length} admin user(s) can login:`)
      loginableAdmins.forEach((admin) => {
        console.log(`   - ${admin.email} (${admin.name})`)
      })
    }
  } catch (error) {
    console.error("❌ Error checking admin users:", error.message)
    console.error("\nMake sure:")
    console.error("  1. Your database is running")
    console.error("  2. Database credentials in .env are correct")
    console.error("  3. The 'users' table exists")
    process.exit(1)
  }
}

checkAdminUsers()

