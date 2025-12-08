const bcrypt = require("bcryptjs")

const password = process.argv[2] || "admin123"

bcrypt.hash(password, 10).then((hash) => {
  console.log("\n✅ Password hash generated:")
  console.log(hash)
  console.log("\n📝 Use this hash in your SQL INSERT query:")
  console.log(`INSERT INTO users (user_type, name, email, password_hash, is_verified) VALUES ('admin', 'Admin User', 'admin@cinemarathi.com', '${hash}', 1);\n`)
}).catch((error) => {
  console.error("Error generating hash:", error)
})

