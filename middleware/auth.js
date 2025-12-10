const jwt = require("jsonwebtoken")

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "No token provided" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key")

    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role || decoded.user_type, // Support both role and user_type
      user_type: decoded.role || decoded.user_type, // Add user_type for consistency
      is_verified: decoded.is_verified,
    }

    next()
  } catch (error) {
    return res.status(401).json({ error: "Invalid token", message: error.message })
  }
}

const isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" })
  }
  next()
}

module.exports = { verifyToken, isAdmin }
