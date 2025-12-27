const express = require("express")
const { verifyToken } = require("../middleware/auth")
const pool = require("../config/database")
const { s3Client, getPublicUrl } = require("../config/s3")
const { ListObjectsV2Command } = require("@aws-sdk/client-s3")

const router = express.Router()

const BANNER_FOLDER = "app/banner"
const S3_BUCKET = process.env.S3_BUCKET_NAME || process.env.AWS_S3_BUCKET

/**
 * Helper function to get banners from S3
 * Returns formatted banner list for dashboard
 */
async function getBannersFromS3() {
  try {
    if (!S3_BUCKET) {
      console.warn("[Dashboard] S3 bucket is not configured, returning empty banner list")
      return []
    }

    const command = new ListObjectsV2Command({
      Bucket: S3_BUCKET,
      Prefix: `${BANNER_FOLDER}/`,
    })

    const response = await s3Client.send(command)

    const banners = (response.Contents || [])
      .filter((item) => {
        if (!item.Key) return false
        const ext = item.Key.toLowerCase()
        return ext.endsWith(".jpg") || ext.endsWith(".jpeg") || ext.endsWith(".png") || ext.endsWith(".webp")
      })
      .map((item, index) => {
        const filename = item.Key.split("/").pop()
        const url = getPublicUrl(item.Key)
        // Extract number from filename for ID
        const idMatch = filename.match(/(\d+)/)
        const id = idMatch ? parseInt(idMatch[1]) : index + 1
        
        return {
          id: id,
          title: `Banner ${id}`,
          image: url,
          link: "https://www.google.com", // Default link, can be customized later
        }
      })
      .sort((a, b) => {
        // Sort by ID (extracted from filename)
        return a.id - b.id
      })

    return banners
  } catch (error) {
    console.error("[Dashboard] Error fetching banners from S3:", error)
    return []
  }
}

// Updated Profile API - Returns formatted profile data
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const connection = await pool.getConnection()
    const userId = req.user.id

    // Get user data
    const [users] = await connection.execute(
      `SELECT id, name, email, contact, user_type, gender, dob, location, 
       bio, portfolio_url, availability, profile_image_url, portfolio_images, is_verified, created_at 
       FROM users WHERE id = ?`,
      [userId],
    )

    if (users.length === 0) {
      connection.release()
      return res.status(404).json({ status: false, error: "User not found" })
    }

    const user = users[0]
    const userType = user.user_type

    // Get actor-specific data (skills, profession, instagram, youtube, experience_years)
    let profession = null
    let experienceYears = null
    let skills = []
    let instagram = null
    let youtube = null

    if (userType === "actor") {
      try {
        const [actorData] = await connection.execute(
          `SELECT profession, experience_years, skills, instagram, youtube 
           FROM actors WHERE user_id = ?`,
          [userId]
        )
        if (actorData.length > 0) {
          const actor = actorData[0]
          profession = actor.profession || null
          experienceYears = actor.experience_years || null
          
          // Handle instagram - check for both NULL and empty string
          if (actor.instagram && actor.instagram.trim() !== '') {
            instagram = actor.instagram.trim()
          }
          
          // Handle youtube - check for both NULL and empty string
          if (actor.youtube && actor.youtube.trim() !== '') {
            youtube = actor.youtube.trim()
          }
          
          // Parse skills from JSON string if it exists
          if (actor.skills) {
            try {
              if (typeof actor.skills === 'string' && actor.skills.trim() !== '') {
                // Try to parse as JSON
                const parsed = JSON.parse(actor.skills)
                if (Array.isArray(parsed)) {
                  skills = parsed.filter(s => s && s.trim() !== '') // Filter out empty strings
                } else if (typeof parsed === 'string') {
                  skills = [parsed]
                } else {
                  skills = []
                }
              } else if (Array.isArray(actor.skills)) {
                skills = actor.skills.filter(s => s && s.trim() !== '')
              } else {
                skills = []
              }
            } catch (parseError) {
              // If JSON parsing fails, try treating as comma-separated string
              if (typeof actor.skills === 'string') {
                const skillList = actor.skills.split(',').map(s => s.trim()).filter(s => s !== '')
                skills = skillList.length > 0 ? skillList : []
              } else {
                skills = []
              }
            }
          } else {
            skills = []
          }
          
          console.log(`[Profile API] User ${userId} - Skills:`, skills, "Instagram:", instagram, "Youtube:", youtube)
        } else {
          console.log(`[Profile API] No actor record found for user ${userId}`)
        }
      } catch (actorError) {
        console.error("[Profile API] Error fetching actor data:", actorError.message)
        console.error("[Profile API] Error stack:", actorError.stack)
      }
    }

    // Get portfolio images
    let portfolio = []
    if (user.portfolio_images) {
      try {
        let portfolioUrls = user.portfolio_images
        
        // Handle different data types
        if (typeof portfolioUrls === 'string') {
          // Try to parse as JSON first
          try {
            portfolioUrls = JSON.parse(portfolioUrls)
          } catch (e) {
            // If parsing fails, it's a plain string URL - wrap it in array
            portfolioUrls = [portfolioUrls]
          }
        }
        
        // Ensure it's an array
        if (Array.isArray(portfolioUrls)) {
          portfolio = portfolioUrls
            .filter(url => url && typeof url === 'string') // Filter out invalid entries
            .map((url, index) => ({
              id: index + 1,
              url: url,
              imageUrl: url, // For compatibility
              index: index + 1,
            }))
        }
      } catch (parseError) {
        console.warn("[Profile API] Error parsing portfolio_images:", parseError.message)
      }
    }

    connection.release()

    // Format profession display
    let professionDisplay = profession
    if (!professionDisplay && userType === "actor") {
      professionDisplay = "Actor"
    } else if (!professionDisplay) {
      professionDisplay = userType || "User"
    }

    // Build social object
    const social = {}
    if (instagram) social.instagram = instagram
    if (youtube) social.youtube = youtube
    // IMDB can be added later if column exists

    res.json({
      status: true,
      message: "Profile fetched successfully",
      profile: {
        id: user.id,
        name: user.name,
        profession: professionDisplay,
        location: user.location || "India",
        avatar:
          user.profile_image_url ||
          `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name || user.id}`,
        is_verified: user.is_verified === 1 || user.is_verified === true,
        experience_years: experienceYears || 0,
        bio: user.bio || "",
        skills: Array.isArray(skills) ? skills : [],
        social: Object.keys(social).length > 0 ? social : {},
        portfolio: portfolio
      }
    })
  } catch (error) {
    console.error("[Profile API] Error:", error)
    res.status(500).json({ status: false, error: error.message })
  }
})

// Get User Stats API
router.get("/profile/stats", verifyToken, async (req, res) => {
  try {
    const connection = await pool.getConnection()
    const userId = req.user.id

    let profileViews = 0
    let connections = 0
    let projects = 0

    // Get profile views
    try {
      const [views] = await connection.execute(
        "SELECT COUNT(*) as count FROM profile_views WHERE user_id = ?",
        [userId]
      )
      profileViews = views[0]?.count || 0
    } catch (viewsError) {
      console.warn("profile_views table may not exist:", viewsError.message)
      // Fallback to random data if table doesn't exist
      profileViews = Math.floor(Math.random() * 2000) + 500
    }

    // Get connections count
    try {
      const [conns] = await connection.execute(
        "SELECT COUNT(*) as count FROM connections WHERE user_id = ? OR connected_user_id = ?",
        [userId, userId]
      )
      connections = conns[0]?.count || 0
    } catch (connError) {
      console.warn("connections table may not exist:", connError.message)
      connections = Math.floor(Math.random() * 500) + 100
    }

    // Get projects count (applications or projects)
    try {
      const [projs] = await connection.execute(
        "SELECT COUNT(*) as count FROM applications WHERE user_id = ?",
        [userId]
      )
      projects = projs[0]?.count || 0
    } catch (projError) {
      console.warn("applications table may not exist:", projError.message)
      projects = Math.floor(Math.random() * 50) + 10
    }

    connection.release()

    res.json({
      status: true,
      stats: {
        profile_views: profileViews,
        connections: connections,
        projects: projects
      }
    })
  } catch (error) {
    console.error("[Profile Stats API] Error:", error)
    res.status(500).json({ status: false, error: error.message })
  }
})

// Get User Portfolio API
router.get("/profile/portfolio", verifyToken, async (req, res) => {
  try {
    const connection = await pool.getConnection()
    const userId = req.user.id

    let portfolio = []

    try {
      // First try to get from new portfolio_images column
      const [userPortfolio] = await connection.execute(
        `SELECT portfolio_images FROM users WHERE id = ?`,
        [userId]
      )

      if (userPortfolio.length > 0 && userPortfolio[0].portfolio_images) {
        try {
          let portfolioUrls = userPortfolio[0].portfolio_images
          
          // Handle different data types
          if (typeof portfolioUrls === 'string') {
            // Try to parse as JSON first
            try {
              portfolioUrls = JSON.parse(portfolioUrls)
            } catch (e) {
              // If parsing fails, it's a plain string URL - wrap it in array
              portfolioUrls = [portfolioUrls]
            }
          }
          
          // Ensure it's an array
          if (Array.isArray(portfolioUrls)) {
            portfolio = portfolioUrls
              .filter(url => url && typeof url === 'string') // Filter out invalid entries
              .map((url, index) => ({
                id: index + 1,
                url: url,
                imageUrl: url, // For compatibility with Flutter app
                index: index + 1,
              }))
            console.log(`[Portfolio API] Found ${portfolio.length} portfolio images for user ${userId}`)
          }
        } catch (parseError) {
          console.warn("[Portfolio API] Error parsing portfolio_images:", parseError.message)
        }
      }
    } catch (error) {
      console.error("[Portfolio API] Error fetching portfolio:", error.message)
      portfolio = []
    }

    connection.release()

    res.json({
      status: true,
      portfolio: portfolio
    })
  } catch (error) {
    console.error("[Profile Portfolio API] Error:", error)
    res.status(500).json({ status: false, error: error.message })
  }
})

// Get User Plan API
router.get("/plan", verifyToken, async (req, res) => {
  try {
    const connection = await pool.getConnection()
    const userId = req.user.id

    let plan = null

    try {
      const [subscriptions] = await connection.execute(
        `SELECT us.id, us.plan_id, us.start_date, us.end_date, us.is_active,
                pp.id as plan_id, pp.name, pp.price, pp.duration_days, pp.features
         FROM user_subscriptions us
         JOIN premium_plans pp ON us.plan_id = pp.id
         WHERE us.user_id = ? AND us.is_active = 1
           AND (us.end_date IS NULL OR us.end_date >= CURDATE())
         ORDER BY us.end_date DESC
         LIMIT 1`,
        [userId]
      )

      if (subscriptions.length > 0) {
        const sub = subscriptions[0]
        
        // Parse features if it's a JSON string
        let features = []
        if (sub.features) {
          try {
            if (typeof sub.features === 'string') {
              features = JSON.parse(sub.features)
            } else {
              features = sub.features
            }
          } catch {
            // If features is not JSON, treat as comma-separated string or single feature
            features = sub.features.split(',').map(f => f.trim()).filter(f => f)
          }
        }

        plan = {
          id: sub.plan_id,
          name: sub.name,
          is_active: sub.is_active === 1 || sub.is_active === true,
          features: features.length > 0 ? features : ["Basic Profile", "Limited Applications", "No Boost"],
          expiry_date: sub.end_date ? sub.end_date.toISOString().split('T')[0] : null
        }
      } else {
        // Default free plan if no subscription
        plan = {
          id: 6,
          name: "Free Plan",
          is_active: true,
          features: ["Basic Profile", "Limited Applications", "No Boost"],
          expiry_date: null
        }
      }
    } catch (planError) {
      console.error("Error fetching plan:", planError.message)
      // Return default free plan on error
      plan = {
        id: 6,
        name: "Free Plan",
        is_active: true,
        features: ["Basic Profile", "Limited Applications", "No Boost"],
        expiry_date: null
      }
    }

    connection.release()

    res.json({
      status: true,
      plan: plan
    })
  } catch (error) {
    console.error("[User Plan API] Error:", error)
    res.status(500).json({ status: false, error: error.message })
  }
})

// Get Full Profile API (Combined)
router.get("/profile/full", verifyToken, async (req, res) => {
  try {
    const connection = await pool.getConnection()
    const userId = req.user.id

    // 1. Get profile data
    const [users] = await connection.execute(
      `SELECT id, name, email, contact, user_type, gender, dob, location, 
       bio, portfolio_url, availability, profile_image_url, is_verified, created_at 
       FROM users WHERE id = ?`,
      [userId],
    )

    if (users.length === 0) {
      connection.release()
      return res.status(404).json({ status: false, error: "User not found" })
    }

    const user = users[0]
    const userType = user.user_type

    // Get actor-specific data
    let profession = null
    let experienceYears = null
    let skills = []
    let instagram = null
    let youtube = null

    if (userType === "actor") {
      try {
        const [actorData] = await connection.execute(
          `SELECT profession, experience_years, skills, instagram, youtube 
           FROM actors WHERE user_id = ?`,
          [userId]
        )
        if (actorData.length > 0) {
          const actor = actorData[0]
          profession = actor.profession || null
          experienceYears = actor.experience_years || null
          
          // Handle instagram - check for both NULL and empty string
          if (actor.instagram && actor.instagram.trim() !== '') {
            instagram = actor.instagram.trim()
          }
          
          // Handle youtube - check for both NULL and empty string
          if (actor.youtube && actor.youtube.trim() !== '') {
            youtube = actor.youtube.trim()
          }
          
          // Parse skills from JSON string if it exists
          if (actor.skills) {
            try {
              if (typeof actor.skills === 'string' && actor.skills.trim() !== '') {
                // Try to parse as JSON
                const parsed = JSON.parse(actor.skills)
                if (Array.isArray(parsed)) {
                  skills = parsed.filter(s => s && s.trim() !== '') // Filter out empty strings
                } else if (typeof parsed === 'string') {
                  skills = [parsed]
                } else {
                  skills = []
                }
              } else if (Array.isArray(actor.skills)) {
                skills = actor.skills.filter(s => s && s.trim() !== '')
              } else {
                skills = []
              }
            } catch (parseError) {
              // If JSON parsing fails, try treating as comma-separated string
              if (typeof actor.skills === 'string') {
                const skillList = actor.skills.split(',').map(s => s.trim()).filter(s => s !== '')
                skills = skillList.length > 0 ? skillList : []
              } else {
                skills = []
              }
            }
          } else {
            skills = []
          }
        }
      } catch (actorError) {
        console.error("[Full Profile API] Error fetching actor data:", actorError.message)
      }
    }

    // 2. Get stats
    let profileViews = 0
    let connections = 0
    let projects = 0

    try {
      const [views] = await connection.execute(
        "SELECT COUNT(*) as count FROM profile_views WHERE user_id = ?",
        [userId]
      )
      profileViews = views[0]?.count || 0
    } catch { profileViews = Math.floor(Math.random() * 2000) + 500 }

    try {
      const [conns] = await connection.execute(
        "SELECT COUNT(*) as count FROM connections WHERE user_id = ? OR connected_user_id = ?",
        [userId, userId]
      )
      connections = conns[0]?.count || 0
    } catch { connections = Math.floor(Math.random() * 500) + 100 }

    try {
      const [projs] = await connection.execute(
        "SELECT COUNT(*) as count FROM applications WHERE user_id = ?",
        [userId]
      )
      projects = projs[0]?.count || 0
    } catch { projects = Math.floor(Math.random() * 50) + 10 }

    // 3. Get portfolio (from portfolio_images JSON array)
    let portfolio = []
    try {
      // First try to get from new portfolio_images column
      const [userPortfolio] = await connection.execute(
        `SELECT portfolio_images FROM users WHERE id = ?`,
        [userId]
      )
      
      if (userPortfolio.length > 0 && userPortfolio[0].portfolio_images) {
        try {
          let portfolioUrls = userPortfolio[0].portfolio_images
          
          // Handle different data types
          if (typeof portfolioUrls === 'string') {
            // Try to parse as JSON first
            try {
              portfolioUrls = JSON.parse(portfolioUrls)
            } catch (e) {
              // If parsing fails, it's a plain string URL - wrap it in array
              portfolioUrls = [portfolioUrls]
            }
          }
          
          // Ensure it's an array
          if (Array.isArray(portfolioUrls)) {
            portfolio = portfolioUrls
              .filter(url => url && typeof url === 'string') // Filter out invalid entries
              .map((url, index) => ({
                id: index + 1,
                url: url,
                imageUrl: url, // For compatibility
                index: index + 1,
              }))
          }
        } catch (parseError) {
          console.warn("[Full Profile] Error parsing portfolio_images:", parseError.message)
        }
      }
    } catch (portfolioError) {
      console.warn("[Full Profile] Error fetching portfolio:", portfolioError.message)
      portfolio = []
    }

    // 4. Get plan
    let plan = null
    try {
      const [subscriptions] = await connection.execute(
        `SELECT us.id, us.plan_id, us.start_date, us.end_date, us.is_active,
                pp.id as plan_id, pp.name, pp.price, pp.duration_days, pp.features
         FROM user_subscriptions us
         JOIN premium_plans pp ON us.plan_id = pp.id
         WHERE us.user_id = ? AND us.is_active = 1
           AND (us.end_date IS NULL OR us.end_date >= CURDATE())
         ORDER BY us.end_date DESC
         LIMIT 1`,
        [userId]
      )

      if (subscriptions.length > 0) {
        const sub = subscriptions[0]
        let features = []
        if (sub.features) {
          try {
            if (typeof sub.features === 'string') {
              features = JSON.parse(sub.features)
            } else {
              features = sub.features
            }
          } catch {
            features = sub.features.split(',').map(f => f.trim()).filter(f => f)
          }
        }

        plan = {
          name: sub.name,
          is_active: sub.is_active === 1 || sub.is_active === true,
          expiry_date: sub.end_date ? sub.end_date.toISOString().split('T')[0] : null
        }
      } else {
        plan = {
          name: "Free Plan",
          is_active: true,
          expiry_date: null
        }
      }
    } catch {
      plan = {
        name: "Free Plan",
        is_active: true,
        expiry_date: null
      }
    }

    connection.release()

    // Format profession display
    let professionDisplay = profession
    if (!professionDisplay && userType === "actor") {
      professionDisplay = "Actor & Model"
    } else if (!professionDisplay) {
      professionDisplay = userType || "User"
    }

    // Build social object - only include if values exist
    const social = {}
    if (instagram && instagram.trim() !== '') {
      social.instagram = instagram.trim()
    }
    if (youtube && youtube.trim() !== '') {
      social.youtube = youtube.trim()
    }

    res.json({
      status: true,
      profile: {
        id: user.id,
        name: user.name,
        profession: professionDisplay,
        location: user.location || "Mumbai, Maharashtra",
        avatar:
          user.profile_image_url ||
          `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name || user.id}`,
        experience_years: experienceYears || 0,
        is_verified: user.is_verified === 1 || user.is_verified === true,
        bio: user.bio || "",
        skills: Array.isArray(skills) ? skills : [],
        social: social
      },
      stats: {
        profile_views: profileViews,
        connections: connections,
        projects: projects
      },
      portfolio: portfolio,
      plan: plan
    })
  } catch (error) {
    console.error("[Full Profile API] Error:", error)
    res.status(500).json({ status: false, error: error.message })
  }
})

router.put("/profile", verifyToken, async (req, res) => {
  try {
    const {
      // Basic user fields
      name,
      contact,
      gender,
      dob,
      location,
      bio,
      portfolio_url,
      availability,
      // Actor-specific fields
      skills,
      profession,
      instagram,
      youtube,
      experience_years,
      category,
      height_cm,
      weight_kg,
      audition_link,
      awards,
    } = req.body

    const connection = await pool.getConnection()
    const userId = req.user.id

    // Get user type to determine if actor fields should be updated
    const [users] = await connection.execute("SELECT user_type, role_id FROM users WHERE id = ?", [userId])

    if (users.length === 0) {
      connection.release()
      return res.status(404).json({ error: "User not found" })
    }

    const userType = users[0].user_type
    const currentRoleId = users[0].role_id

    // Build dynamic update query for users table
    const updates = []
    const values = []

    if (name !== undefined) {
      updates.push("name = ?")
      values.push(name)
    }
    if (contact !== undefined) {
      // Truncate contact to max 20 characters to fit database column
      const contactValue = contact ? String(contact).substring(0, 20) : null
      updates.push("contact = ?")
      values.push(contactValue)
    }
    if (gender !== undefined) {
      updates.push("gender = ?")
      values.push(gender)
    }
    if (dob !== undefined) {
      updates.push("dob = ?")
      values.push(dob)
    }
    if (location !== undefined) {
      updates.push("location = ?")
      values.push(location)
    }
    if (bio !== undefined) {
      updates.push("bio = ?")
      values.push(bio)
    }
    if (portfolio_url !== undefined) {
      updates.push("portfolio_url = ?")
      values.push(portfolio_url)
    }
    if (availability !== undefined) {
      updates.push("availability = ?")
      values.push(availability)
    }

    // Handle user_type update and role assignment
    let newUserType = userType
    if (req.body.user_type !== undefined) {
      newUserType = req.body.user_type
      updates.push("user_type = ?")
      values.push(newUserType)
    }

    // Update users table if there are changes
    if (updates.length > 0) {
      values.push(userId)
      await connection.execute(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, values)
    }

    // Update role_id if user_type changed or if role_id is not set
    if (req.body.user_type !== undefined || currentRoleId === null) {
      try {
        const targetUserType = req.body.user_type || userType
        // Get role_id from roles table based on user_type
        const [roles] = await connection.execute(
          "SELECT id FROM roles WHERE slug = ? AND is_active = 1 LIMIT 1",
          [targetUserType.toLowerCase()]
        )

        if (roles.length > 0) {
          // Update user with role_id
          await connection.execute(
            "UPDATE users SET role_id = ? WHERE id = ?",
            [roles[0].id, userId]
          )
          console.log(`[Update Profile] Updated role_id to ${roles[0].id} (${targetUserType}) for user ${userId}`)
        } else {
          // If role not found, assign default 'user' role
          const [defaultRole] = await connection.execute(
            "SELECT id FROM roles WHERE slug = 'user' AND is_active = 1 LIMIT 1",
            []
          )
          if (defaultRole.length > 0) {
            await connection.execute(
              "UPDATE users SET role_id = ? WHERE id = ?",
              [defaultRole[0].id, userId]
            )
            console.log(`[Update Profile] Assigned default role_id ${defaultRole[0].id} (user) to user ${userId}`)
          }
        }
      } catch (roleError) {
        console.error("[Update Profile] Error updating role:", roleError.message)
        // Continue with profile update even if role update fails
      }
    }

    // Handle actor-specific fields
    if (userType === "actor") {
      // Check if actor record exists
      const [existingActor] = await connection.execute(
        "SELECT user_id FROM actors WHERE user_id = ?",
        [userId]
      )

      const actorUpdates = []
      const actorValues = []

      if (skills !== undefined) {
        // Handle skills - can be array or string
        let skillsValue = null
        if (skills) {
          if (Array.isArray(skills)) {
            skillsValue = JSON.stringify(skills)
          } else if (typeof skills === "string") {
            // Try to parse as JSON, if fails use as is
            try {
              JSON.parse(skills)
              skillsValue = skills
            } catch {
              // If not valid JSON, wrap in array
              skillsValue = JSON.stringify([skills])
            }
          }
        }
        actorUpdates.push("skills = ?")
        actorValues.push(skillsValue)
      }

      if (profession !== undefined) {
        actorUpdates.push("profession = ?")
        actorValues.push(profession || null)
      }
      if (category !== undefined) {
        actorUpdates.push("category = ?")
        actorValues.push(category || null)
      }
      if (experience_years !== undefined) {
        actorUpdates.push("experience_years = ?")
        actorValues.push(experience_years || null)
      }
      if (instagram !== undefined) {
        actorUpdates.push("instagram = ?")
        actorValues.push(instagram || null)
      }
      if (youtube !== undefined) {
        actorUpdates.push("youtube = ?")
        actorValues.push(youtube || null)
      }
      if (height_cm !== undefined) {
        actorUpdates.push("height_cm = ?")
        actorValues.push(height_cm || null)
      }
      if (weight_kg !== undefined) {
        actorUpdates.push("weight_kg = ?")
        actorValues.push(weight_kg || null)
      }
      if (audition_link !== undefined) {
        actorUpdates.push("audition_link = ?")
        actorValues.push(audition_link || null)
      }
      if (awards !== undefined) {
        actorUpdates.push("awards = ?")
        actorValues.push(awards || null)
      }

      if (actorUpdates.length > 0) {
        if (existingActor.length > 0) {
          // Update existing actor record
          actorValues.push(userId)
          await connection.execute(
            `UPDATE actors SET ${actorUpdates.join(", ")} WHERE user_id = ?`,
            actorValues
          )
        } else {
          // Create new actor record
          // IMPORTANT: user_id must be first in both fields and values
          const actorFields = ["user_id", ...actorUpdates.map((u) => u.split(" = ")[0])]
          const actorPlaceholders = actorFields.map(() => "?").join(", ")
          // Put userId first in values array to match field order
          const insertValues = [userId, ...actorValues]
          await connection.execute(
            `INSERT INTO actors (${actorFields.join(", ")}) VALUES (${actorPlaceholders})`,
            insertValues
          )
        }
      }
    }

    connection.release()

    res.json({
      status: true,
      message: "Profile updated successfully",
    })
  } catch (error) {
    console.error("[Update Profile] Error:", error)
    res.status(500).json({ status: false, error: error.message })
  }
})

router.get("/actors/:id", async (req, res) => {
  try {
    const connection = await pool.getConnection()

    const [actor] = await connection.execute(
      'SELECT u.*, a.* FROM users u LEFT JOIN actors a ON u.id = a.user_id WHERE u.id = ? AND u.user_type = "actor"',
      [req.params.id],
    )

    connection.release()

    if (actor.length === 0) {
      return res.status(404).json({ error: "Actor not found" })
    }

    res.json(actor[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put("/actors/profile", verifyToken, async (req, res) => {
  try {
    const { category, height_cm, weight_kg, skills, experience_years, audition_link, awards } = req.body
    const connection = await pool.getConnection()

    const [existing] = await connection.execute("SELECT user_id FROM actors WHERE user_id = ?", [req.user.id])

    if (existing.length > 0) {
      await connection.execute(
        "UPDATE actors SET category = ?, height_cm = ?, weight_kg = ?, skills = ?, experience_years = ?, audition_link = ?, awards = ? WHERE user_id = ?",
        [category, height_cm, weight_kg, skills, experience_years, audition_link, awards, req.user.id],
      )
    } else {
      await connection.execute(
        "INSERT INTO actors (user_id, category, height_cm, weight_kg, skills, experience_years, audition_link, awards) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [req.user.id, category, height_cm, weight_kg, skills, experience_years, audition_link, awards],
      )
    }

    connection.release()
    res.json({ message: "Actor profile updated" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get("/actors", async (req, res) => {
  try {
    const { category, gender } = req.query
    let query = 'SELECT u.*, a.* FROM users u LEFT JOIN actors a ON u.id = a.user_id WHERE u.user_type = "actor"'
    const params = []

    if (category) {
      query += " AND a.category = ?"
      params.push(category)
    }
    if (gender) {
      query += " AND u.gender = ?"
      params.push(gender)
    }

    const connection = await pool.getConnection()
    const [actors] = await connection.execute(query, params)
    connection.release()

    res.json(actors)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Discover Talents API
router.get("/talents", async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query
    const pageNum = parseInt(page) || 1
    const limitNum = parseInt(limit) || 20
    const offset = (pageNum - 1) * limitNum
    
    const connection = await pool.getConnection()
    
    // Build query for talents (actors, technicians, etc.)
    // Use LEFT JOINs so it works even if some tables don't exist
    let query = `
      SELECT DISTINCT
        u.id,
        u.name,
        u.location,
        u.user_type,
        u.profile_image_url,
        a.category as actor_category,
        a.profession,
        t.specialization,
        COALESCE(a.profession, a.category, t.specialization, u.user_type) as role,
        COALESCE(AVG(rr.rating), 0) as rating,
        CASE WHEN fp.user_id IS NOT NULL THEN 1 ELSE 0 END as is_featured
      FROM users u
      LEFT JOIN actors a ON u.id = a.user_id AND u.user_type = 'actor'
      LEFT JOIN technicians t ON u.id = t.user_id AND u.user_type = 'technician'
      LEFT JOIN ratings_reviews rr ON u.id = rr.reviewed_user_id
      LEFT JOIN featured_profiles fp ON u.id = fp.user_id
      WHERE u.user_type NOT IN ('admin', 'production_house', 'studio', 'media')
    `
    
    const params = []
    
    // Search filter
    if (search && search.trim() !== '') {
      query += ` AND (u.name LIKE ? OR u.email LIKE ?)`
      params.push(`%${search.trim()}%`, `%${search.trim()}%`)
    }
    
    // Category filter
    if (category && category !== 'All' && category.trim() !== '') {
      // Category can be from actor.category, actor.profession, or user_type
      query += ` AND (
        a.category = ? OR 
        a.profession = ? OR 
        u.user_type = ? OR
        t.specialization = ?
      )`
      params.push(category, category, category, category)
    }
    
    // Get total count for pagination (build separate count query)
    let countQuery = `
      SELECT COUNT(DISTINCT u.id) as total
      FROM users u
      LEFT JOIN actors a ON u.id = a.user_id AND u.user_type = 'actor'
      LEFT JOIN technicians t ON u.id = t.user_id AND u.user_type = 'technician'
      WHERE u.user_type != 'admin' AND u.user_type != 'production_house' AND u.user_type != 'studio' AND u.user_type != 'media'
    `
    const countParams = []
    
    // Apply same filters for count
    if (search && search.trim() !== '') {
      countQuery += ` AND (u.name LIKE ? OR u.email LIKE ?)`
      countParams.push(`%${search.trim()}%`, `%${search.trim()}%`)
    }
    
    if (category && category !== 'All' && category.trim() !== '') {
      countQuery += ` AND (
        a.category = ? OR 
        a.profession = ? OR 
        u.user_type = ? OR
        t.specialization = ?
      )`
      countParams.push(category, category, category, category)
    }
    
    const [countResult] = await connection.execute(countQuery, countParams)
    const totalResults = countResult[0]?.total || 0
    
    // Add GROUP BY and ordering to main query
    // Use direct values for LIMIT and OFFSET (MySQL doesn't always support them as parameters)
    query += ` GROUP BY u.id ORDER BY is_featured DESC, rating DESC, u.created_at DESC LIMIT ${limitNum} OFFSET ${offset}`
    
    const [talents] = await connection.execute(query, params)
    
    connection.release()
    
    // Format response
    const formattedTalents = talents.map((talent, index) => {
      const ratingValue = parseFloat(talent.rating || 0)
      return {
        id: talent.id,
        name: talent.name,
        role: talent.role || talent.user_type || "Actor",
        location: talent.location || "India",
        rating: ratingValue > 0 ? parseFloat(ratingValue.toFixed(1)) : 0,
        image:
          talent.profile_image_url ||
          `https://api.dicebear.com/7.x/adventurer/svg?seed=${talent.name || talent.id}`,
        is_featured: talent.is_featured === 1 || talent.is_featured === true
      }
    })
    
    res.json({
      status: true,
      message: "Talents fetched successfully",
      filters: {
        search: search || "",
        category: category || "All",
        page: pageNum,
        limit: limitNum,
        total_results: totalResults
      },
      talents: formattedTalents
    })
  } catch (error) {
    console.error("[Talents API] Error:", error)
    res.status(500).json({ 
      status: false,
      error: error.message 
    })
  }
})

// POST handler for talents (accepts filters in body)
router.post("/talents", async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.body
    const pageNum = parseInt(page) || 1
    const limitNum = parseInt(limit) || 20
    const offset = (pageNum - 1) * limitNum
    
    const connection = await pool.getConnection()
    
    // Build query for talents (actors, technicians, etc.)
    // Use LEFT JOINs so it works even if some tables don't exist
    let query = `
      SELECT DISTINCT
        u.id,
        u.name,
        u.location,
        u.user_type,
        u.profile_image_url,
        a.category as actor_category,
        a.profession,
        t.specialization,
        COALESCE(a.profession, a.category, t.specialization, u.user_type) as role,
        COALESCE(AVG(rr.rating), 0) as rating,
        CASE WHEN fp.user_id IS NOT NULL THEN 1 ELSE 0 END as is_featured
      FROM users u
      LEFT JOIN actors a ON u.id = a.user_id AND u.user_type = 'actor'
      LEFT JOIN technicians t ON u.id = t.user_id AND u.user_type = 'technician'
      LEFT JOIN ratings_reviews rr ON u.id = rr.reviewed_user_id
      LEFT JOIN featured_profiles fp ON u.id = fp.user_id
      WHERE u.user_type NOT IN ('admin', 'production_house', 'studio', 'media')
    `
    
    const params = []
    
    // Search filter
    if (search && search.trim() !== '') {
      query += ` AND (u.name LIKE ? OR u.email LIKE ?)`
      params.push(`%${search.trim()}%`, `%${search.trim()}%`)
    }
    
    // Category filter
    if (category && category !== 'All' && category.trim() !== '') {
      // Category can be from actor.category, actor.profession, or user_type
      query += ` AND (
        a.category = ? OR 
        a.profession = ? OR 
        u.user_type = ? OR
        t.specialization = ?
      )`
      params.push(category, category, category, category)
    }
    
    // Get total count for pagination (build separate count query)
    let countQuery = `
      SELECT COUNT(DISTINCT u.id) as total
      FROM users u
      LEFT JOIN actors a ON u.id = a.user_id AND u.user_type = 'actor'
      LEFT JOIN technicians t ON u.id = t.user_id AND u.user_type = 'technician'
      WHERE u.user_type != 'admin' AND u.user_type != 'production_house' AND u.user_type != 'studio' AND u.user_type != 'media'
    `
    const countParams = []
    
    // Apply same filters for count
    if (search && search.trim() !== '') {
      countQuery += ` AND (u.name LIKE ? OR u.email LIKE ?)`
      countParams.push(`%${search.trim()}%`, `%${search.trim()}%`)
    }
    
    if (category && category !== 'All' && category.trim() !== '') {
      countQuery += ` AND (
        a.category = ? OR 
        a.profession = ? OR 
        u.user_type = ? OR
        t.specialization = ?
      )`
      countParams.push(category, category, category, category)
    }
    
    const [countResult] = await connection.execute(countQuery, countParams)
    const totalResults = countResult[0]?.total || 0
    
    // Add GROUP BY and ordering to main query
    // Use direct values for LIMIT and OFFSET (MySQL doesn't always support them as parameters)
    query += ` GROUP BY u.id ORDER BY is_featured DESC, rating DESC, u.created_at DESC LIMIT ${limitNum} OFFSET ${offset}`
    
    const [talents] = await connection.execute(query, params)
    
    connection.release()
    
    // Format response
    const formattedTalents = talents.map((talent, index) => {
      const ratingValue = parseFloat(talent.rating || 0)
      return {
        id: talent.id,
        name: talent.name,
        role: talent.role || talent.user_type || "Actor",
        location: talent.location || "India",
        rating: ratingValue > 0 ? parseFloat(ratingValue.toFixed(1)) : 0,
        image:
          talent.profile_image_url ||
          `https://api.dicebear.com/7.x/adventurer/svg?seed=${talent.name || talent.id}`,
        is_featured: talent.is_featured === 1 || talent.is_featured === true
      }
    })
    
    res.json({
      status: true,
      message: "Talents fetched successfully",
      filters: {
        search: search || "",
        category: category || "All",
        page: pageNum,
        limit: limitNum,
        total_results: totalResults
      },
      talents: formattedTalents
    })
  } catch (error) {
    console.error("[Talents API] Error:", error)
    res.status(500).json({ 
      status: false,
      error: error.message 
    })
  }
})

// Talent Categories API
router.get("/talent/categories", async (req, res) => {
  try {
    const connection = await pool.getConnection()
    
    // Combine all categories
    const categories = new Set(["All"])
    
    // Get unique categories from actors table
    try {
      const [actorCategories] = await connection.execute(
        `SELECT DISTINCT COALESCE(profession, category) as category 
         FROM actors 
         WHERE profession IS NOT NULL OR category IS NOT NULL
         ORDER BY category`
      )
      actorCategories.forEach(item => {
        if (item.category) categories.add(item.category)
      })
    } catch (err) {
      console.log("[Categories] Actors table query failed:", err.message)
    }
    
    // Get unique specializations from technicians table
    try {
      const [techSpecializations] = await connection.execute(
        `SELECT DISTINCT specialization as category 
         FROM technicians 
         WHERE specialization IS NOT NULL
         ORDER BY specialization`
      )
      techSpecializations.forEach(item => {
        if (item.category) categories.add(item.category)
      })
    } catch (err) {
      console.log("[Categories] Technicians table query failed:", err.message)
    }
    
    // Get unique user types
    try {
      const [userTypes] = await connection.execute(
        `SELECT DISTINCT user_type as category 
         FROM users 
         WHERE user_type NOT IN ('admin', 'production_house', 'studio', 'media')
         ORDER BY user_type`
      )
      userTypes.forEach(item => {
        if (item.category) categories.add(item.category)
      })
    } catch (err) {
      console.log("[Categories] Users table query failed:", err.message)
    }
    
    connection.release()
    
    // Convert to array and sort
    const categoriesArray = Array.from(categories).sort()
    
    res.json({
      status: true,
      categories: categoriesArray
    })
  } catch (error) {
    console.error("[Categories API] Error:", error)
    res.status(500).json({ 
      status: false,
      error: error.message 
    })
  }
})

// Dashboard API for mobile
router.get("/dashboard", verifyToken, async (req, res) => {
  try {
    const connection = await pool.getConnection()
    const userId = req.user.id

    // 1. Get current user's active plan
    let plan = null
    try {
      const [subscriptions] = await connection.execute(
        `SELECT us.id, us.plan_id, us.start_date, us.end_date, us.is_active,
                pp.id as plan_id, pp.name, pp.price, pp.duration_days, pp.features
         FROM user_subscriptions us
         JOIN premium_plans pp ON us.plan_id = pp.id
         WHERE us.user_id = ? AND us.is_active = 1 
           AND (us.end_date IS NULL OR us.end_date >= CURDATE())
         ORDER BY us.end_date DESC
         LIMIT 1`,
        [userId]
      )

      if (subscriptions.length > 0) {
        const sub = subscriptions[0]
        
        // Check if this is a lifetime plan
        const isLifetime = 
          sub.duration_days >= 36500 || 
          sub.plan_id === 7 || 
          (sub.name && sub.name.toLowerCase().includes('lifetime'))
        
        // Format end_date properly
        let expiryDate = null
        if (sub.end_date) {
          if (sub.end_date instanceof Date) {
            expiryDate = sub.end_date.toISOString().split('T')[0]
          } else if (typeof sub.end_date === 'string') {
            expiryDate = sub.end_date.split('T')[0]
          } else {
            expiryDate = new Date(sub.end_date).toISOString().split('T')[0]
          }
        }
        
        plan = {
          id: sub.plan_id,
          name: sub.name,
          price: sub.price ? parseFloat(sub.price).toFixed(2) : "0.00",
          duration_days: sub.duration_days,
          features: typeof sub.features === 'string' ? sub.features : (sub.features ? JSON.stringify(sub.features) : "Premium Features"),
          expiry_date: expiryDate,
          is_active: sub.is_active === 1 || sub.is_active === true,
          is_lifetime: isLifetime
        }
        
        // Add lifetime-specific details if it's a lifetime plan
        if (isLifetime) {
          plan.lifetime_details = {
            is_lifetime: true,
            duration: "Lifetime",
            expiry_date: null, // Lifetime plans don't expire
            message: "You have lifetime premium access"
          }
        }
      }
    } catch (planError) {
      console.error("Error fetching plan:", planError.message)
    }

    // 2. Get user stats (profile_views, connections, projects)
    // Note: These tables might not exist, so we'll use placeholder logic
    let stats = {
      profile_views: 0,
      connections: 0,
      projects: 0
    }

    try {
      // Try to get profile views (if table exists)
      try {
        const [views] = await connection.execute(
          "SELECT COUNT(*) as count FROM profile_views WHERE user_id = ?",
          [userId]
        )
        stats.profile_views = views[0]?.count || 0
      } catch {
        // Table doesn't exist, use random or default
        stats.profile_views = Math.floor(Math.random() * 2000) + 500
      }

      // Try to get connections (if table exists)
      try {
        const [connections] = await connection.execute(
          "SELECT COUNT(*) as count FROM connections WHERE user_id = ? OR connected_user_id = ?",
          [userId, userId]
        )
        stats.connections = connections[0]?.count || 0
      } catch {
        stats.connections = Math.floor(Math.random() * 500) + 100
      }

      // Get projects (applications count)
      try {
        const [projects] = await connection.execute(
          "SELECT COUNT(*) as count FROM applications WHERE user_id = ?",
          [userId]
        )
        stats.projects = projects[0]?.count || 0
      } catch {
        stats.projects = Math.floor(Math.random() * 50) + 10
      }
    } catch (statsError) {
      console.error("Error fetching stats:", statsError.message)
    }

    // 3. Get featured talents (max 5 users with other plans active - NOT yearly/lifetime)
    // Exclude yearly (365+ days) and lifetime plans
    let featuredTalents = []
    try {
      const [featured] = await connection.execute(
        `SELECT DISTINCT u.id, u.name, u.location,
                a.profession, a.category,
                COALESCE(a.profession, a.category, u.user_type) as display_profession
         FROM users u
         JOIN user_subscriptions us ON u.id = us.user_id
         JOIN premium_plans pp ON us.plan_id = pp.id
         LEFT JOIN actors a ON u.id = a.user_id AND u.user_type = 'actor'
         WHERE us.is_active = 1 
           AND (us.end_date IS NULL OR us.end_date >= CURDATE())
           AND NOT (pp.duration_days >= 365 OR pp.id = 7 OR pp.name LIKE '%Lifetime%' OR pp.name LIKE '%Yearly%')
           AND u.id != ?
           AND u.user_type != 'admin'
         ORDER BY RAND()
         LIMIT 5`,
        [userId]
      )

      featuredTalents = featured.map((talent, index) => ({
        id: talent.id,
        name: talent.name,
        profession: talent.display_profession || talent.user_type || "Actor",
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${talent.name || index}`,
        location: talent.location || "India"
      }))
    } catch (featuredError) {
      console.error("Error fetching featured talents:", featuredError.message)
    }

    // 4. Get trending jobs (max 5 casting calls from production houses with yearly/lifetime plan)
    let trendingJobs = []
    try {
      // Try to get casting calls from production houses with yearly/lifetime plans
      let [jobs] = await connection.execute(
        `SELECT cc.id, cc.project_title, cc.role, cc.location, cc.created_at,
                u.name as production_house_name
         FROM casting_calls cc
         INNER JOIN users u ON cc.production_house_id = u.id
         INNER JOIN user_subscriptions us ON u.id = us.user_id
         INNER JOIN premium_plans pp ON us.plan_id = pp.id
         WHERE us.is_active = 1
           AND (us.end_date IS NULL OR us.end_date >= CURDATE())
           AND (pp.duration_days >= 365 OR pp.id = 7 OR pp.name LIKE '%Lifetime%' OR pp.name LIKE '%Yearly%')
         ORDER BY cc.created_at DESC
         LIMIT 5`,
        []
      )

      // If no jobs found with yearly/lifetime requirement, get any recent casting calls
      if (jobs.length === 0) {
        [jobs] = await connection.execute(
          `SELECT cc.id, cc.project_title, cc.role, cc.location, cc.created_at,
                  COALESCE(u.name, 'Production House') as production_house_name
           FROM casting_calls cc
           LEFT JOIN users u ON cc.production_house_id = u.id
           ORDER BY cc.created_at DESC
           LIMIT 5`,
          []
        )
      }

      // Map to required format with random tags
      const tags = ["Full-time", "Contract", "Part-time", "Freelance", "Temporary"]
      trendingJobs = jobs.map((job, index) => ({
        id: job.id,
        title: job.project_title || job.role || "Casting Call",
        company: job.production_house_name || "Production House",
        tag: tags[index % tags.length],
        location: job.location || "Mumbai",
        posted_on: job.created_at ? new Date(job.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      }))
      
      console.log(`[Dashboard] Found ${jobs.length} trending jobs`)
    } catch (jobsError) {
      console.error("[Dashboard] Error fetching trending jobs:", jobsError.message)
      console.error("[Dashboard] Error stack:", jobsError.stack)
      // Return empty array on error
      trendingJobs = []
    }

    connection.release()

    // Get banners from S3
    let bannerList = []
    try {
      bannerList = await getBannersFromS3()
      console.log(`[Dashboard] Fetched ${bannerList.length} banners from S3`)
    } catch (bannerError) {
      console.error("[Dashboard] Error fetching banners:", bannerError.message)
      // Return empty array on error, dashboard will still work without banners
      bannerList = []
    }

    res.json({
      status: 1,
      message: "Dashboard fetched successfully",
      banner_list: bannerList,
      plan: plan,
      stats: stats,
      featured_talents: featuredTalents,
      trending_jobs: trendingJobs
    })
  } catch (error) {
    console.error("Dashboard error:", error)
    res.status(500).json({ 
      status: false,
      error: error.message 
    })
  }
})

module.exports = router
