/**
 * Global API utility for making requests to the backend
 * Uses ENVIRONMENT variable to switch between LIVE and LOCAL credentials
 */

// Determine if we're using live or local environment
const getEnvironment = (): "live" | "local" => {
  // Check ENVIRONMENT variable first (primary method)
  const env = process.env.ENVIRONMENT || process.env.NEXT_PUBLIC_ENVIRONMENT
  if (env === "live" || env === "production") {
    return "live"
  }
  if (env === "local" || env === "development") {
    return "local"
  }
  
  // Fallback to NODE_ENV if ENVIRONMENT is not set
  if (process.env.NODE_ENV === "production") {
    return "live"
  }
  
  // Default to local
  return "local"
}

// Get API base URL from environment variables
// For client-side: use NEXT_PUBLIC_ prefix so it's available in browser
// For server-side: can use regular env vars
const getApiBaseUrl = (): string => {
  const environment = getEnvironment()
  
  // In browser/client-side
  if (typeof window !== "undefined") {
    if (environment === "live") {
      return process.env.NEXT_PUBLIC_API_BASE_URL_LIVE || "https://api.cine.fluttertales.tech/api"
    }
    return process.env.NEXT_PUBLIC_API_BASE_URL_LOCAL || "http://localhost:3001/api"
  }
  
  // On server-side
  if (environment === "live") {
    return process.env.API_BASE_URL_LIVE || process.env.NEXT_PUBLIC_API_BASE_URL_LIVE || "https://api.cine.fluttertales.tech/api"
  }
  return process.env.API_BASE_URL_LOCAL || process.env.NEXT_PUBLIC_API_BASE_URL_LOCAL || "http://localhost:3001/api"
}

// Normalize the base URL (remove trailing slash, ensure it ends with /api if needed)
const normalizeBaseUrl = (url: string): string => {
  let normalized = url.trim()
  
  // Remove trailing slash
  if (normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1)
  }
  
  // If it already ends with /api, return as is
  if (normalized.endsWith("/api")) {
    return normalized
  }
  
  // If it doesn't end with /api, add it
  normalized = normalized + "/api"
  
  return normalized
}

const API_BASE_URL = normalizeBaseUrl(getApiBaseUrl())

/**
 * Build full URL from endpoint
 * @param endpoint - API endpoint (e.g., "/admin-auth/login" or "admin-auth/login")
 * @returns Full URL
 */
const buildUrl = (endpoint: string): string => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint
  
  // If base URL already includes /api, don't add it again
  if (API_BASE_URL.endsWith("/api")) {
    return `${API_BASE_URL}/${cleanEndpoint}`
  }
  
  return `${API_BASE_URL}/${cleanEndpoint}`
}

/**
 * Request options interface
 */
export interface ApiRequestOptions extends RequestInit {
  token?: string
  params?: Record<string, string | number | boolean>
}

/**
 * Make API request
 * @param endpoint - API endpoint (e.g., "admin-auth/login")
 * @param options - Fetch options and custom options
 * @returns Promise with response data
 */
export const apiRequest = async <T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> => {
  const { token, params, ...fetchOptions } = options

  // Build URL
  let url = buildUrl(endpoint)

  // Add query parameters if provided
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value))
    })
    url += `?${searchParams.toString()}`
  }

  // Set default headers
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers || {}),
  }

  // Add authorization token if provided
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  // Make the request
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  })

  // Parse response
  const data = await response.json()

  // Throw error if response is not ok
  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${response.status}`)
  }

  return data
}

/**
 * GET request
 */
export const apiGet = <T = any>(
  endpoint: string,
  options?: Omit<ApiRequestOptions, "method" | "body">
): Promise<T> => {
  return apiRequest<T>(endpoint, { ...options, method: "GET" })
}

/**
 * POST request
 */
export const apiPost = <T = any>(
  endpoint: string,
  body?: any,
  options?: Omit<ApiRequestOptions, "method" | "body">
): Promise<T> => {
  return apiRequest<T>(endpoint, {
    ...options,
    method: "POST",
    body: JSON.stringify(body),
  })
}

/**
 * PUT request
 */
export const apiPut = <T = any>(
  endpoint: string,
  body?: any,
  options?: Omit<ApiRequestOptions, "method" | "body">
): Promise<T> => {
  return apiRequest<T>(endpoint, {
    ...options,
    method: "PUT",
    body: JSON.stringify(body),
  })
}

/**
 * PATCH request
 */
export const apiPatch = <T = any>(
  endpoint: string,
  body?: any,
  options?: Omit<ApiRequestOptions, "method" | "body">
): Promise<T> => {
  return apiRequest<T>(endpoint, {
    ...options,
    method: "PATCH",
    body: JSON.stringify(body),
  })
}

/**
 * DELETE request
 */
export const apiDelete = <T = any>(
  endpoint: string,
  options?: Omit<ApiRequestOptions, "method" | "body">
): Promise<T> => {
  return apiRequest<T>(endpoint, { ...options, method: "DELETE" })
}

// Export the base URL for reference
export { API_BASE_URL }
