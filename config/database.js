const mysql = require("mysql2/promise")

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USERNAME || "root",
  database: process.env.DB_NAME || "CineMarathi",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

// Only include password if it's set and not empty
if (process.env.DB_PASSWORD && process.env.DB_PASSWORD.trim() !== "") {
  dbConfig.password = process.env.DB_PASSWORD
}

const pool = mysql.createPool(dbConfig)

module.exports = pool
