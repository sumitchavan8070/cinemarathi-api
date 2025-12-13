/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    // Determine environment from ENVIRONMENT variable
    const environment = process.env.ENVIRONMENT || process.env.NEXT_PUBLIC_ENVIRONMENT || 'local'
    const isLive = environment === 'live' || environment === 'production'
    
    // Get API base URL from environment variable
    let apiBaseUrl
    if (isLive) {
      apiBaseUrl = process.env.API_BASE_URL_LIVE || process.env.NEXT_PUBLIC_API_BASE_URL_LIVE || 'https://api.cine.fluttertales.tech'
    } else {
      apiBaseUrl = process.env.API_BASE_URL_LOCAL || process.env.NEXT_PUBLIC_API_BASE_URL_LOCAL || 'http://localhost:3001'
    }
    
    // Remove /api suffix if present (we'll add it in the destination)
    let baseUrl = apiBaseUrl.trim()
    if (baseUrl.endsWith('/api')) {
      baseUrl = baseUrl.slice(0, -4)
    }
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1)
    }
    
    return [
      {
        source: '/api/:path*',
        destination: `${baseUrl}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
