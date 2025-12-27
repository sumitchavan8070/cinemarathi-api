const db = require("../config/database")
const { uploadBufferToS3 } = require("../config/s3")

/**
 * Upload a single portfolio image (appends to existing portfolio)
 * Expects `file` field in multipart/form-data (single file)
 * Stores images in portfolio folder with naming: userid-name_index.jpg
 */
const uploadSinglePortfolioImage = async (req, res) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded. Use `file` field." })
    }

    // Fetch user's name from database
    const [users] = await db.query("SELECT name, portfolio_images FROM users WHERE id = ?", [userId])
    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    const userName = users[0].name || "user"

    // Sanitize user name
    const sanitizedName = userName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 50)

    // Get existing portfolio images
    let existingImages = []
    if (users[0].portfolio_images) {
      try {
        let portfolioData = users[0].portfolio_images
        
        // Handle different data types
        if (typeof portfolioData === 'string') {
          try {
            portfolioData = JSON.parse(portfolioData)
          } catch (e) {
            portfolioData = [portfolioData]
          }
        }
        
        if (Array.isArray(portfolioData)) {
          existingImages = portfolioData.filter(url => url && typeof url === 'string')
        }
      } catch (e) {
        console.warn("[Portfolio Single Upload] Error parsing existing portfolio_images:", e.message)
        existingImages = []
      }
    }

    // Check if adding new image would exceed 6 total
    if (existingImages.length >= 6) {
      return res.status(400).json({
        error: `Maximum 6 portfolio images allowed. You already have ${existingImages.length} images.`,
      })
    }

    // Calculate next index
    const index = existingImages.length + 1

    // Upload file
    const { buffer, mimetype, originalname } = req.file
    const customPrefix = `${userId}-${sanitizedName}_${index}`

    const { key, url } = await uploadBufferToS3({
      buffer,
      mimetype,
      folder: "portfolio",
      originalName: originalname,
      customPrefix,
    })

    // Add new image to array
    const allImages = [...existingImages, url]

    // Update database with JSON array
    await db.query("UPDATE users SET portfolio_images = ? WHERE id = ?", [
      JSON.stringify(allImages),
      userId,
    ])
    
    console.log(`[Portfolio Single Upload] Successfully saved ${allImages.length} images to database for user ${userId}`)

    return res.json({
      status: 1,
      message: "Portfolio image uploaded successfully",
      image: {
        index,
        url,
        key,
      },
      total_images: allImages.length,
      portfolio: allImages,
    })
  } catch (error) {
    console.error("[Portfolio] Error uploading single portfolio image:", error)
    return res.status(500).json({ error: error.message })
  }
}

/**
 * Upload portfolio images (up to 6 images)
 * Expects `files` field in multipart/form-data (array of files)
 * Stores images in portfolio folder with naming: userid-name_index.jpg
 */
const uploadPortfolioImages = async (req, res) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded. Use `files` field (array)." })
    }

    // Maximum 6 portfolio images
    if (req.files.length > 6) {
      return res.status(400).json({ error: "Maximum 6 portfolio images allowed" })
    }

    // Fetch user's name from database
    const [users] = await db.query("SELECT name FROM users WHERE id = ?", [userId])
    const userName = users.length > 0 ? users[0].name : "user"

    // Sanitize user name
    const sanitizedName = userName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 50)

    // Get existing portfolio images
    const [existingPortfolio] = await db.query(
      "SELECT portfolio_images FROM users WHERE id = ?",
      [userId]
    )

    let existingImages = []
    if (existingPortfolio.length > 0 && existingPortfolio[0].portfolio_images) {
      try {
        let portfolioData = existingPortfolio[0].portfolio_images
        
        // Handle different data types
        if (typeof portfolioData === 'string') {
          // Try to parse as JSON first
          try {
            portfolioData = JSON.parse(portfolioData)
          } catch (e) {
            // If parsing fails, it's a plain string URL - wrap it in array
            portfolioData = [portfolioData]
          }
        }
        
        // Ensure it's an array
        if (Array.isArray(portfolioData)) {
          existingImages = portfolioData.filter(url => url && typeof url === 'string')
        }
        
        console.log(`[Portfolio Upload] Found ${existingImages.length} existing images for user ${userId}`)
      } catch (e) {
        console.warn("[Portfolio Upload] Error parsing existing portfolio_images:", e.message)
        existingImages = []
      }
    } else {
      console.log(`[Portfolio Upload] No existing portfolio images for user ${userId}`)
    }

    // Check if adding new images would exceed 6 total
    if (existingImages.length + req.files.length > 6) {
      return res.status(400).json({
        error: `Cannot upload ${req.files.length} images. You already have ${existingImages.length} images. Maximum 6 images allowed.`,
      })
    }

    const uploadedImages = []

    // Upload each file
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i]
      const { buffer, mimetype, originalname } = file

      // Calculate index (1-6)
      const index = existingImages.length + i + 1

      // Create filename: userid-name_index.jpg
      const customPrefix = `${userId}-${sanitizedName}_${index}`

      const { key, url } = await uploadBufferToS3({
        buffer,
        mimetype,
        folder: "portfolio",
        originalName: originalname,
        customPrefix,
      })

      uploadedImages.push({
        index,
        url,
        key,
      })
    }

    // Combine existing and new images
    const allImages = [...existingImages, ...uploadedImages.map((img) => img.url)]

    console.log(`[Portfolio Upload] Total images after upload: ${allImages.length}`)
    console.log(`[Portfolio Upload] Image URLs:`, allImages)

    // Update database with JSON array
    await db.query("UPDATE users SET portfolio_images = ? WHERE id = ?", [
      JSON.stringify(allImages),
      userId,
    ])
    
    console.log(`[Portfolio Upload] Successfully saved ${allImages.length} images to database`)

    return res.json({
      message: `${req.files.length} portfolio image(s) uploaded successfully`,
      uploaded: uploadedImages,
      total_images: allImages.length,
      portfolio: allImages,
    })
  } catch (error) {
    console.error("[Portfolio] Error uploading portfolio images:", error)
    return res.status(500).json({ error: error.message })
  }
}

/**
 * Get portfolio images for authenticated user
 */
const getPortfolioImages = async (req, res) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    const [users] = await db.query("SELECT portfolio_images FROM users WHERE id = ?", [userId])

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    let portfolioImages = []
    if (users[0].portfolio_images) {
      try {
        let portfolioData = users[0].portfolio_images
        
        console.log(`[Portfolio Get] Raw portfolio_data type: ${typeof portfolioData}`)
        console.log(`[Portfolio Get] Raw portfolio_data:`, portfolioData)
        
        // Handle different data types
        if (typeof portfolioData === 'string') {
          // Try to parse as JSON first
          try {
            portfolioData = JSON.parse(portfolioData)
            console.log(`[Portfolio Get] Parsed JSON successfully`)
          } catch (e) {
            // If parsing fails, it's a plain string URL - wrap it in array
            console.log(`[Portfolio Get] Not valid JSON, treating as single URL string`)
            portfolioData = [portfolioData]
          }
        }
        
        // Ensure it's an array
        if (Array.isArray(portfolioData)) {
          portfolioImages = portfolioData.filter(url => url && typeof url === 'string')
          console.log(`[Portfolio Get] Found ${portfolioImages.length} portfolio images`)
        } else {
          console.warn(`[Portfolio Get] portfolio_data is not an array after processing`)
        }
      } catch (e) {
        console.warn("[Portfolio Get] Error parsing portfolio_images:", e.message)
        portfolioImages = []
      }
    } else {
      console.log(`[Portfolio Get] No portfolio_images found for user ${userId}`)
    }

    // Format response to match Flutter app expectations
    const formattedPortfolio = portfolioImages.map((url, index) => ({
      id: index + 1,
      url: url,
      imageUrl: url, // For compatibility
      index: index + 1,
    }))

    return res.json({
      status: true,
      portfolio: formattedPortfolio,
      total: formattedPortfolio.length,
    })
  } catch (error) {
    console.error("[Portfolio] Error getting portfolio images:", error)
    return res.status(500).json({ error: error.message })
  }
}

/**
 * Update portfolio image at specific index
 */
const updatePortfolioImage = async (req, res) => {
  try {
    const userId = req.user?.id
    const { index } = req.params

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded. Use `file` field." })
    }

    const imageIndex = parseInt(index)
    if (isNaN(imageIndex) || imageIndex < 1 || imageIndex > 6) {
      return res.status(400).json({ error: "Index must be between 1 and 6" })
    }

    // Get existing portfolio images
    const [users] = await db.query("SELECT name, portfolio_images FROM users WHERE id = ?", [
      userId,
    ])

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    const userName = users[0].name || "user"
    const sanitizedName = userName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 50)

    let existingImages = []
    if (users[0].portfolio_images) {
      try {
        let portfolioData = users[0].portfolio_images
        
        // Handle different data types
        if (typeof portfolioData === 'string') {
          // Try to parse as JSON first
          try {
            portfolioData = JSON.parse(portfolioData)
          } catch (e) {
            // If parsing fails, it's a plain string URL - wrap it in array
            portfolioData = [portfolioData]
          }
        }
        
        // Ensure it's an array
        if (Array.isArray(portfolioData)) {
          existingImages = portfolioData.filter(url => url && typeof url === 'string')
        }
      } catch (e) {
        console.warn("[Portfolio Update] Error parsing portfolio_images:", e.message)
        existingImages = []
      }
    }

    if (imageIndex > existingImages.length) {
      return res.status(400).json({
        error: `Index ${imageIndex} is out of range. You have ${existingImages.length} images.`,
      })
    }

    // Upload new image
    const { buffer, mimetype, originalname } = req.file
    const customPrefix = `${userId}-${sanitizedName}_${imageIndex}`

    const { key, url } = await uploadBufferToS3({
      buffer,
      mimetype,
      folder: "portfolio",
      originalName: originalname,
      customPrefix,
    })

    // Update the image at the specified index (index is 1-based, array is 0-based)
    existingImages[imageIndex - 1] = url

    // Update database
    await db.query("UPDATE users SET portfolio_images = ? WHERE id = ?", [
      JSON.stringify(existingImages),
      userId,
    ])

    return res.json({
      message: `Portfolio image at index ${imageIndex} updated successfully`,
      index: imageIndex,
      url,
      key,
      portfolio: existingImages,
    })
  } catch (error) {
    console.error("[Portfolio] Error updating portfolio image:", error)
    return res.status(500).json({ error: error.message })
  }
}

/**
 * Delete portfolio image at specific index
 */
const deletePortfolioImage = async (req, res) => {
  try {
    const userId = req.user?.id
    const { index } = req.params

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    const imageIndex = parseInt(index)
    if (isNaN(imageIndex) || imageIndex < 1 || imageIndex > 6) {
      return res.status(400).json({ error: "Index must be between 1 and 6" })
    }

    // Get existing portfolio images
    const [users] = await db.query("SELECT portfolio_images FROM users WHERE id = ?", [userId])

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    let existingImages = []
    if (users[0].portfolio_images) {
      try {
        let portfolioData = users[0].portfolio_images
        
        // Handle different data types
        if (typeof portfolioData === 'string') {
          // Try to parse as JSON first
          try {
            portfolioData = JSON.parse(portfolioData)
          } catch (e) {
            // If parsing fails, it's a plain string URL - wrap it in array
            portfolioData = [portfolioData]
          }
        }
        
        // Ensure it's an array
        if (Array.isArray(portfolioData)) {
          existingImages = portfolioData.filter(url => url && typeof url === 'string')
        }
      } catch (e) {
        console.warn("[Portfolio Delete] Error parsing portfolio_images:", e.message)
        existingImages = []
      }
    }

    if (imageIndex > existingImages.length) {
      return res.status(400).json({
        error: `Index ${imageIndex} is out of range. You have ${existingImages.length} images.`,
      })
    }

    // Remove image at index (index is 1-based, array is 0-based)
    existingImages.splice(imageIndex - 1, 1)

    // Update database
    await db.query("UPDATE users SET portfolio_images = ? WHERE id = ?", [
      JSON.stringify(existingImages),
      userId,
    ])

    return res.json({
      message: `Portfolio image at index ${imageIndex} deleted successfully`,
      portfolio: existingImages,
      total: existingImages.length,
    })
  } catch (error) {
    console.error("[Portfolio] Error deleting portfolio image:", error)
    return res.status(500).json({ error: error.message })
  }
}

/**
 * Clear all portfolio images
 */
const clearPortfolioImages = async (req, res) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    await db.query("UPDATE users SET portfolio_images = NULL WHERE id = ?", [userId])

    return res.json({
      message: "All portfolio images cleared successfully",
      portfolio: [],
    })
  } catch (error) {
    console.error("[Portfolio] Error clearing portfolio images:", error)
    return res.status(500).json({ error: error.message })
  }
}

/**
 * Get portfolio images by user ID (for viewing other users' portfolios)
 */
const getPortfolioImagesByUserId = async (req, res) => {
  try {
    const { user_id } = req.params

    if (!user_id) {
      return res.status(400).json({ error: "User ID is required" })
    }

    const [users] = await db.query("SELECT portfolio_images FROM users WHERE id = ?", [user_id])

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    let portfolioImages = []
    if (users[0].portfolio_images) {
      try {
        let portfolioData = users[0].portfolio_images
        
        if (typeof portfolioData === 'string') {
          try {
            portfolioData = JSON.parse(portfolioData)
          } catch (e) {
            portfolioData = [portfolioData]
          }
        }
        
        if (Array.isArray(portfolioData)) {
          portfolioImages = portfolioData.filter(url => url && typeof url === 'string')
        }
      } catch (e) {
        console.warn("[Portfolio Get By User ID] Error parsing portfolio_images:", e.message)
        portfolioImages = []
      }
    }

    // Format response
    const formattedPortfolio = portfolioImages.map((url, index) => ({
      id: index + 1,
      url: url,
      imageUrl: url,
      index: index + 1,
    }))

    return res.json({
      status: 1,
      user_id: parseInt(user_id),
      portfolio: formattedPortfolio,
      total: formattedPortfolio.length,
    })
  } catch (error) {
    console.error("[Portfolio] Error getting portfolio images by user ID:", error)
    return res.status(500).json({ error: error.message })
  }
}

module.exports = {
  uploadPortfolioImages,
  uploadSinglePortfolioImage,
  getPortfolioImages,
  getPortfolioImagesByUserId,
  updatePortfolioImage,
  deletePortfolioImage,
  clearPortfolioImages,
}

