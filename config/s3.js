const { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } = require("@aws-sdk/client-s3")
const crypto = require("crypto")

const S3_REGION = process.env.S3_REGION || process.env.AWS_REGION || "ap-south-1"
const S3_BUCKET = process.env.S3_BUCKET_NAME || process.env.AWS_S3_BUCKET
const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID
const S3_SECRET_ACCESS_KEY =
  process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY

// Basic safety check so we fail fast in logs if config is missing
if (!S3_BUCKET) {
  console.warn("[S3] S3_BUCKET_NAME/AWS_S3_BUCKET is not set. Uploads will fail until configured.")
}

const s3Client = new S3Client({
  region: S3_REGION,
  credentials:
    S3_ACCESS_KEY_ID && S3_SECRET_ACCESS_KEY
      ? {
          accessKeyId: S3_ACCESS_KEY_ID,
          secretAccessKey: S3_SECRET_ACCESS_KEY,
        }
      : undefined,
})

const generateKey = (folder, originalName, customPrefix = null) => {
  const safeFolder = (folder || "uploads").replace(/[^a-zA-Z0-9/_-]/g, "_")
  const ext = originalName && originalName.includes(".") ? originalName.split(".").pop() : "bin"
  const random = crypto.randomBytes(8).toString("hex")
  const timestamp = Date.now()
  
  // If customPrefix is provided, use it; otherwise use timestamp-random
  const filename = customPrefix 
    ? `${customPrefix}-${timestamp}-${random}.${ext}`
    : `${timestamp}-${random}.${ext}`
  
  return `${safeFolder.replace(/\/+$/, "")}/${filename}`
}

const getPublicUrl = (key) => {
  if (!key) return null

  if (process.env.S3_PUBLIC_BASE_URL) {
    return `${process.env.S3_PUBLIC_BASE_URL.replace(/\/+$/, "")}/${key}`
  }

  if (!S3_BUCKET) return null

  // Standard public S3 URL
  return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`
}

const uploadBufferToS3 = async ({ buffer, mimetype, folder, originalName, customPrefix = null }) => {
  if (!S3_BUCKET) {
    throw new Error("S3 bucket is not configured. Please set S3_BUCKET_NAME or AWS_S3_BUCKET.")
  }

  const key = generateKey(folder, originalName, customPrefix)

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimetype || "application/octet-stream",
    // ACL removed - use bucket policy for public access instead
  })

  await s3Client.send(command)

  const url = getPublicUrl(key)

  return { key, url }
}

module.exports = {
  s3Client,
  uploadBufferToS3,
  getPublicUrl,
  generateKey,
}



