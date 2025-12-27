const db = require("../config/database")
const { uploadBufferToS3 } = require("../config/s3")

/**
 * Upload profile image for the authenticated user.
 * Expects `file` field in multipart/form-data.
 */
const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded. Use `file` field." })
    }

    // Fetch user's name from database
    const [users] = await db.query("SELECT name FROM users WHERE id = ?", [userId])
    const userName = users.length > 0 ? users[0].name : "user"

    // Sanitize user name: remove special chars, convert spaces to hyphens, lowercase
    const sanitizedName = userName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, "") // Remove leading/trailing hyphens
      .substring(0, 50) // Limit length

    const { buffer, mimetype, originalname } = req.file

    // Store all profile images directly under `profiles/` with user ID and name
    const folder = "profiles"

    const { key, url } = await uploadBufferToS3({
      buffer,
      mimetype,
      folder,
      originalName: originalname,
      customPrefix: `${userId}-${sanitizedName}`, // Add user ID and name prefix
    })

    // Store URL in users table for avatar/profile image
    await db.query("UPDATE users SET profile_image_url = ? WHERE id = ?", [url, userId])

    return res.json({
      message: "Profile image uploaded successfully",
      key,
      url,
    })
  } catch (error) {
    console.error("[Upload] Error uploading profile image:", error)
    return res.status(500).json({ error: error.message })
  }
}

/**
 * Generic file upload endpoint for authenticated users.
 * Expects `file` field in multipart/form-data and optional `folder` in body/query.
 * Does NOT store anything in DB, just returns S3 key + URL so
 * other APIs can decide how/where to store it.
 */
const uploadFile = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded. Use `file` field." })
    }

    const folderFromRequest = req.body.folder || req.query.folder
    // Provide some sane default if no folder passed
    const baseFolder = folderFromRequest && folderFromRequest.trim() !== "" ? folderFromRequest : "uploads"

    const userScopedFolder = `${baseFolder.replace(/[^a-zA-Z0-9/_-]/g, "_")}/${req.user.id}`

    const { buffer, mimetype, originalname } = req.file

    const { key, url } = await uploadBufferToS3({
      buffer,
      mimetype,
      folder: userScopedFolder,
      originalName: originalname,
    })

    return res.json({
      message: "File uploaded successfully",
      key,
      url,
      folder: userScopedFolder,
    })
  } catch (error) {
    console.error("[Upload] Error uploading file:", error)
    return res.status(500).json({ error: error.message })
  }
}

module.exports = {
  uploadProfileImage,
  uploadFile,
}



