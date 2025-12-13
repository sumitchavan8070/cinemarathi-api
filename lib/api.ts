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
  
  // In browser/client-side - prefer relative URLs to avoid CORS issues
  // Next.js rewrites will proxy /api/* requests to the actual API server
  if (typeof window !== "undefined") {
    // Check if we should force absolute URLs (for cross-origin scenarios)
    const useAbsoluteUrl = process.env.NEXT_PUBLIC_USE_ABSOLUTE_API === 'true' || 
                          process.env.USE_ABSOLUTE_API === 'true'
    
    if (!useAbsoluteUrl) {
      // Use relative URL - Next.js rewrites will handle it (avoids CORS)
      return "/api"
    }
    
    // Use absolute URL (only if explicitly configured)
    if (environment === "live") {
      return process.env.NEXT_PUBLIC_API_BASE_URL_LIVE || "https://api.cine.fluttertales.tech/api"
    }
    return process.env.NEXT_PUBLIC_API_BASE_URL_LOCAL || "http://localhost:3001/api"
  }
  
  // On server-side - always use absolute URL
  if (environment === "live") {
    return process.env.API_BASE_URL_LIVE || process.env.NEXT_PUBLIC_API_BASE_URL_LIVE || "https://api.cine.fluttertales.tech/api"
  }
  return process.env.API_BASE_URL_LOCAL || process.env.NEXT_PUBLIC_API_BASE_URL_LOCAL || "http://localhost:3001/api"
}

// Normalize the base URL (remove trailing slash, ensure it ends with /api if needed)
const normalizeBaseUrl = (url: string): string => {
  let normalized = url.trim()
  
  // If it's a relative URL, return as is
  if (normalized.startsWith("/")) {
    // Remove trailing slash if present
    if (normalized.endsWith("/") && normalized.length > 1) {
      normalized = normalized.slice(0, -1)
    }
    return normalized
  }
  
  // For absolute URLs, remove trailing slash
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
  
  // If base URL is relative (starts with /), use it directly
  if (API_BASE_URL.startsWith("/")) {
    return `${API_BASE_URL}/${cleanEndpoint}`
  }
  
  // For absolute URLs, ensure proper formatting
  const baseUrl = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL
  return `${baseUrl}/${cleanEndpoint}`
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

  // Determine if this is a cross-origin request
  const isCrossOrigin = typeof window !== "undefined" && url.startsWith("http")
  
  // Make the request
  let response: Response
  try {
    response = await fetch(url, {
      ...fetchOptions,
      headers,
      // Only include credentials and CORS mode for cross-origin requests
      ...(isCrossOrigin ? {
        credentials: 'include' as RequestCredentials, // Include cookies in cross-origin requests
        mode: 'cors' as RequestMode, // Enable CORS
      } : {}),
    })
  } catch (error: any) {
    // Network error or CORS error
    console.error('[API] Fetch error:', error)
    console.error('[API] URL:', url)
    console.error('[API] Headers:', headers)
    console.error('[API] Is cross-origin:', isCrossOrigin)
    
    // Provide more helpful error message
    if (error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
      const errorMsg = isCrossOrigin
        ? `Network/CORS error: Unable to reach the API server at ${url}. ` +
          `Please check if the server is running and CORS is properly configured. ` +
          `Original error: ${error.message}`
        : `Network error: Unable to reach the API server at ${url}. ` +
          `Please check if the server is running. ` +
          `Original error: ${error.message}`
      throw new Error(errorMsg)
    }
    throw error
  }

  // Check if response is ok before parsing
  if (!response.ok) {
    // Try to parse error message from response
    let errorMessage = `Request failed with status ${response.status}`
    try {
      const errorData = await response.json()
      errorMessage = errorData.error || errorData.message || errorMessage
    } catch {
      // If response is not JSON, use status text
      errorMessage = response.statusText || errorMessage
    }
    throw new Error(errorMessage)
  }

  // Parse response
  let data: T
  try {
    const text = await response.text()
    if (!text) {
      return {} as T // Return empty object if response is empty
    }
    data = JSON.parse(text)
  } catch (error: any) {
    console.error('[API] JSON parse error:', error)
    console.error('[API] Response text:', await response.text())
    throw new Error(`Failed to parse response as JSON: ${error.message}`)
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
