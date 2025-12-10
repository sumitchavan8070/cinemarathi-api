const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")

// Load environment variables FIRST before requiring database config
dotenv.config()

const pool = require("./config/database")
const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/users")
const castingRoutes = require("./routes/casting")
const chatRoutes = require("./routes/chat")
const ratingsRoutes = require("./routes/ratings")
const premiumRoutes = require("./routes/premium")
const adminRoutes = require("./routes/admin")
const adminAuthRoutes = require("./api/routes/admin-auth")
const techniciansRoutes = require("./api/routes/technicians")
const subscriptionsRoutes = require("./api/routes/subscriptions")
const searchRoutes = require("./api/routes/search")
const notificationsRoutes = require("./api/routes/notifications")
const portfolioRoutes = require("./api/routes/portfolio")
const eventsRoutes = require("./api/routes/events")
const adminAnalyticsRoutes = require("./api/routes/admin-analytics")

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now()
  
  // Log request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  
  // Log body if it exists and is not empty
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0 && req.method !== 'GET') {
    console.log('  Body:', JSON.stringify(req.body, null, 2))
  }
  
  // Log query params if they exist
  if (req.query && typeof req.query === 'object' && Object.keys(req.query).length > 0) {
    console.log('  Query:', req.query)
  }
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start
    const statusColor = res.statusCode >= 400 ? '\x1b[31m' : res.statusCode >= 300 ? '\x1b[33m' : '\x1b[32m'
    console.log(`  ${statusColor}${res.statusCode}\x1b[0m - ${duration}ms`)
  })
  
  next()
})

app.use((req, res, next) => {
  req.db = pool
  next()
})

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/casting", castingRoutes)
app.use("/api/chat", chatRoutes)
app.use("/api/ratings", ratingsRoutes)
app.use("/api/premium", premiumRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/admin-auth", adminAuthRoutes)
app.use("/api/technicians", techniciansRoutes)
app.use("/api/subscriptions", subscriptionsRoutes)
app.use("/api/search", searchRoutes)
app.use("/api/notifications", notificationsRoutes)
app.use("/api/portfolio", portfolioRoutes)
app.use("/api/events", eventsRoutes)
app.use("/api/admin/analytics", adminAnalyticsRoutes)

// Health check
app.get("/", (req, res) => {
  res.json({ status: "API is running" })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
