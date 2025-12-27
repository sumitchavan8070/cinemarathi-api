const express = require("express")
const router = express.Router()
const {
  registerDeviceToken,
  unregisterDeviceToken,
  getUserDeviceTokens,
  sendToDevice,
  sendToMultipleDevices,
  sendToUser,
  subscribeToTopic,
  unsubscribeFromTopic,
  sendToTopic,
} = require("../../controllers/fcmController")
const { verifyToken: authenticateToken } = require("../../middleware/auth")
const { isAdmin } = require("../../middleware/auth")

// Device Token Management Routes (User endpoints)
// Register/Update FCM token for authenticated user
router.post("/device/register", authenticateToken, registerDeviceToken)
// Unregister (clear) FCM token for authenticated user
router.post("/device/unregister", authenticateToken, unregisterDeviceToken)
// Get FCM token for authenticated user
router.get("/device/tokens", authenticateToken, getUserDeviceTokens)

// Notification Sending Routes
// User can send to their own device
router.post("/send/device", authenticateToken, sendToDevice)

// Admin-only routes for sending notifications
router.post("/send/multiple", authenticateToken, isAdmin, sendToMultipleDevices)
router.post("/send/user", authenticateToken, isAdmin, sendToUser)
router.post("/send/topic", authenticateToken, isAdmin, sendToTopic)

// Topic Management Routes (Admin only)
router.post("/topic/subscribe", authenticateToken, isAdmin, subscribeToTopic)
router.post("/topic/unsubscribe", authenticateToken, isAdmin, unsubscribeFromTopic)

module.exports = router

