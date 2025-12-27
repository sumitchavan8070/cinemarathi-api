const { s3Client, uploadBufferToS3, getPublicUrl } = require("../config/s3")
const { ListObjectsV2Command, DeleteObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3")

const BANNER_FOLDER = "app/banner"
const S3_BUCKET = process.env.S3_BUCKET_NAME || process.env.AWS_S3_BUCKET

/**
 * List all banner images from S3
 * GET /api/admin/banners
 */
const listBanners = async (req, res) => {
  try {
    if (!S3_BUCKET) {
      return res.status(500).json({ error: "S3 bucket is not configured" })
    }

    const command = new ListObjectsV2Command({
      Bucket: S3_BUCKET,
      Prefix: `${BANNER_FOLDER}/`,
    })

    const response = await s3Client.send(command)

    const banners = (response.Contents || [])
      .filter((item) => item.Key && item.Key.endsWith(".jpg") || item.Key.endsWith(".jpeg") || item.Key.endsWith(".png") || item.Key.endsWith(".webp"))
      .map((item) => {
        const filename = item.Key.split("/").pop()
        const url = getPublicUrl(item.Key)
        return {
          key: item.Key,
          filename,
          url,
          size: item.Size,
          lastModified: item.LastModified,
        }
      })
      .sort((a, b) => {
        // Sort by filename (1.jpg, 2.jpg, etc.)
        const aNum = parseInt(a.filename.replace(/\D/g, "")) || 0
        const bNum = parseInt(b.filename.replace(/\D/g, "")) || 0
        return aNum - bNum
      })

    res.json({
      message: "Banners retrieved successfully",
      banners,
      count: banners.length,
    })
  } catch (error) {
    console.error("[Banner] Error listing banners:", error)
    res.status(500).json({ error: error.message })
  }
}

/**
 * Upload a new banner image
 * POST /api/admin/banners
 * multipart/form-data with "file" field
 */
const uploadBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded. Use 'file' field." })
    }

    const { buffer, mimetype, originalname } = req.file

    // Extract number from filename or use timestamp
    const filenameMatch = originalname.match(/(\d+)\.(jpg|jpeg|png|webp)$/i)
    const bannerNumber = filenameMatch ? filenameMatch[1] : Date.now()

    // Generate key with specific filename format: app/banner/{number}.{ext}
    const ext = originalname.split(".").pop().toLowerCase()
    const key = `${BANNER_FOLDER}/${bannerNumber}.${ext}`

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimetype || "image/jpeg",
    })

    await s3Client.send(command)

    const url = getPublicUrl(key)

    res.json({
      message: "Banner uploaded successfully",
      banner: {
        key,
        filename: `${bannerNumber}.${ext}`,
        url,
      },
    })
  } catch (error) {
    console.error("[Banner] Error uploading banner:", error)
    res.status(500).json({ error: error.message })
  }
}

/**
 * Update/replace a banner image
 * PUT /api/admin/banners/:filename
 * multipart/form-data with "file" field
 */
const updateBanner = async (req, res) => {
  try {
    const { filename } = req.params

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded. Use 'file' field." })
    }

    if (!filename) {
      return res.status(400).json({ error: "Filename is required" })
    }

    const { buffer, mimetype } = req.file
    const key = `${BANNER_FOLDER}/${filename}`

    // Upload/replace the file
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimetype || "image/jpeg",
    })

    await s3Client.send(command)

    const url = getPublicUrl(key)

    res.json({
      message: "Banner updated successfully",
      banner: {
        key,
        filename,
        url,
      },
    })
  } catch (error) {
    console.error("[Banner] Error updating banner:", error)
    res.status(500).json({ error: error.message })
  }
}

/**
 * Delete a banner image
 * DELETE /api/admin/banners/:filename
 */
const deleteBanner = async (req, res) => {
  try {
    const { filename } = req.params

    if (!filename) {
      return res.status(400).json({ error: "Filename is required" })
    }

    const key = `${BANNER_FOLDER}/${filename}`

    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    })

    await s3Client.send(command)

    res.json({
      message: "Banner deleted successfully",
      deleted: {
        key,
        filename,
      },
    })
  } catch (error) {
    console.error("[Banner] Error deleting banner:", error)
    res.status(500).json({ error: error.message })
  }
}

module.exports = {
  listBanners,
  uploadBanner,
  updateBanner,
  deleteBanner,
}






