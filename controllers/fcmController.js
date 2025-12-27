const admin = require("firebase-admin")
const db = require("../config/database")

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    // Check if service account key is provided as JSON string or file path
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      })
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      })
    } else {
      console.warn("Firebase Admin not initialized: Missing service account configuration")
    }
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error.message)
  }
}

/**
 * Register or update device FCM token for a user
 */
const registerDeviceToken = async (req, res) => {
  try {
    const { device_token } = req.body
    const userId = req.user.id

    if (!device_token) {
      return res.status(400).json({ error: "Device token is required" })
    }

    // Update user's fcm_token in users table
    await db.query(
      `UPDATE users SET fcm_token = ? WHERE id = ?`,
      [device_token, userId]
    )

    res.json({
      message: "Device token registered successfully",
      token: device_token,
    })
  } catch (error) {
    console.error("Error registering device token:", error)
    res.status(500).json({ error: error.message })
  }
}

/**
 * Unregister device FCM token
 */
const unregisterDeviceToken = async (req, res) => {
  try {
    const userId = req.user.id

    // Set fcm_token to NULL for the user
    await db.query(
      `UPDATE users SET fcm_token = NULL WHERE id = ?`,
      [userId]
    )

    res.json({ message: "Device token unregistered successfully" })
  } catch (error) {
    console.error("Error unregistering device token:", error)
    res.status(500).json({ error: error.message })
  }
}

/**
 * Get FCM token for a user
 */
const getUserDeviceTokens = async (req, res) => {
  try {
    const userId = req.user.id

    const [users] = await db.query(
      `SELECT fcm_token FROM users WHERE id = ?`,
      [userId]
    )

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({
      fcm_token: users[0].fcm_token || null,
    })
  } catch (error) {
    console.error("Error getting user FCM token:", error)
    res.status(500).json({ error: error.message })
  }
}

/**
 * Send notification to a single device
 */
const sendToDevice = async (req, res) => {
  try {
    const { device_token, title, body, data, image_url } = req.body

    if (!device_token || !title || !body) {
      return res.status(400).json({
        error: "device_token, title, and body are required",
      })
    }

    if (!admin.apps.length) {
      return res.status(500).json({
        error: "Firebase Admin not initialized. Please configure FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_SERVICE_ACCOUNT_PATH",
      })
    }

    const message = {
      token: device_token,
      notification: {
        title,
        body,
      },
      data: data || {},
      android: {
        priority: "high",
        notification: {
          sound: "default",
          channelId: "default",
          imageUrl: image_url,
        },
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
          },
        },
      },
    }

    if (image_url) {
      message.notification.imageUrl = image_url
    }

    const response = await admin.messaging().send(message)

    res.json({
      success: true,
      message: "Notification sent successfully",
      messageId: response,
    })
  } catch (error) {
    console.error("Error sending notification:", error)
    res.status(500).json({
      error: error.message,
      code: error.code,
    })
  }
}

/**
 * Send notification to multiple devices
 */
const sendToMultipleDevices = async (req, res) => {
  try {
    const { device_tokens, title, body, data, image_url } = req.body

    if (!device_tokens || !Array.isArray(device_tokens) || device_tokens.length === 0) {
      return res.status(400).json({
        error: "device_tokens array is required and must not be empty",
      })
    }

    if (!title || !body) {
      return res.status(400).json({
        error: "title and body are required",
      })
    }

    if (!admin.apps.length) {
      return res.status(500).json({
        error: "Firebase Admin not initialized. Please configure FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_SERVICE_ACCOUNT_PATH",
      })
    }

    const message = {
      notification: {
        title,
        body,
      },
      data: data || {},
      android: {
        priority: "high",
        notification: {
          sound: "default",
          channelId: "default",
          imageUrl: image_url,
        },
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
          },
        },
      },
    }

    if (image_url) {
      message.notification.imageUrl = image_url
    }

    const response = await admin.messaging().sendEachForMulticast({
      tokens: device_tokens,
      ...message,
    })

    res.json({
      success: true,
      message: "Notifications sent",
      successCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses,
    })
  } catch (error) {
    console.error("Error sending notifications:", error)
    res.status(500).json({
      error: error.message,
      code: error.code,
    })
  }
}

/**
 * Send notification to a user
 */
const sendToUser = async (req, res) => {
  try {
    const { user_id, title, body, data, image_url } = req.body

    if (!user_id || !title || !body) {
      return res.status(400).json({
        error: "user_id, title, and body are required",
      })
    }

    // Get FCM token from users table
    const [users] = await db.query(
      `SELECT fcm_token FROM users WHERE id = ?`,
      [user_id]
    )

    if (users.length === 0) {
      return res.status(404).json({
        error: "User not found",
      })
    }

    const device_token = users[0].fcm_token

    if (!device_token) {
      return res.status(404).json({
        error: "No FCM token found for this user",
      })
    }

    if (!admin.apps.length) {
      return res.status(500).json({
        error: "Firebase Admin not initialized. Please configure FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_SERVICE_ACCOUNT_PATH",
      })
    }

    const message = {
      token: device_token,
      notification: {
        title,
        body,
      },
      data: data || {},
      android: {
        priority: "high",
        notification: {
          sound: "default",
          channelId: "default",
          imageUrl: image_url,
        },
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
          },
        },
      },
    }

    if (image_url) {
      message.notification.imageUrl = image_url
    }

    const response = await admin.messaging().send(message)

    res.json({
      success: true,
      message: "Notification sent to user successfully",
      messageId: response,
    })
  } catch (error) {
    console.error("Error sending notification to user:", error)
    res.status(500).json({
      error: error.message,
      code: error.code,
    })
  }
}

/**
 * Subscribe device to a topic
 */
const subscribeToTopic = async (req, res) => {
  try {
    const { device_tokens, topic } = req.body

    if (!device_tokens || !topic) {
      return res.status(400).json({
        error: "device_tokens and topic are required",
      })
    }

    const tokens = Array.isArray(device_tokens) ? device_tokens : [device_tokens]

    if (!admin.apps.length) {
      return res.status(500).json({
        error: "Firebase Admin not initialized. Please configure FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_SERVICE_ACCOUNT_PATH",
      })
    }

    const response = await admin.messaging().subscribeToTopic(tokens, topic)

    res.json({
      success: true,
      message: "Subscribed to topic successfully",
      successCount: response.successCount,
      failureCount: response.failureCount,
      errors: response.errors,
    })
  } catch (error) {
    console.error("Error subscribing to topic:", error)
    res.status(500).json({
      error: error.message,
      code: error.code,
    })
  }
}

/**
 * Unsubscribe device from a topic
 */
const unsubscribeFromTopic = async (req, res) => {
  try {
    const { device_tokens, topic } = req.body

    if (!device_tokens || !topic) {
      return res.status(400).json({
        error: "device_tokens and topic are required",
      })
    }

    const tokens = Array.isArray(device_tokens) ? device_tokens : [device_tokens]

    if (!admin.apps.length) {
      return res.status(500).json({
        error: "Firebase Admin not initialized. Please configure FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_SERVICE_ACCOUNT_PATH",
      })
    }

    const response = await admin.messaging().unsubscribeFromTopic(tokens, topic)

    res.json({
      success: true,
      message: "Unsubscribed from topic successfully",
      successCount: response.successCount,
      failureCount: response.failureCount,
      errors: response.errors,
    })
  } catch (error) {
    console.error("Error unsubscribing from topic:", error)
    res.status(500).json({
      error: error.message,
      code: error.code,
    })
  }
}

/**
 * Send notification to a topic
 */
const sendToTopic = async (req, res) => {
  try {
    const { topic, title, body, data, image_url } = req.body

    if (!topic || !title || !body) {
      return res.status(400).json({
        error: "topic, title, and body are required",
      })
    }

    if (!admin.apps.length) {
      return res.status(500).json({
        error: "Firebase Admin not initialized. Please configure FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_SERVICE_ACCOUNT_PATH",
      })
    }

    const message = {
      topic,
      notification: {
        title,
        body,
      },
      data: data || {},
      android: {
        priority: "high",
        notification: {
          sound: "default",
          channelId: "default",
          imageUrl: image_url,
        },
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
          },
        },
      },
    }

    if (image_url) {
      message.notification.imageUrl = image_url
    }

    const response = await admin.messaging().send(message)

    res.json({
      success: true,
      message: "Notification sent to topic successfully",
      messageId: response,
    })
  } catch (error) {
    console.error("Error sending notification to topic:", error)
    res.status(500).json({
      error: error.message,
      code: error.code,
    })
  }
}

module.exports = {
  registerDeviceToken,
  unregisterDeviceToken,
  getUserDeviceTokens,
  sendToDevice,
  sendToMultipleDevices,
  sendToUser,
  subscribeToTopic,
  unsubscribeFromTopic,
  sendToTopic,
}

