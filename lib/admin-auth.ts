export const getAdminToken = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("adminToken")
}

export const getAdminUser = (): any | null => {
  if (typeof window === "undefined") return null
  const user = localStorage.getItem("adminUser")
  return user ? JSON.parse(user) : null
}

export const setAdminAuth = (token: string, user: any) => {
  localStorage.setItem("adminToken", token)
  localStorage.setItem("adminUser", JSON.stringify(user))
}

export const clearAdminAuth = () => {
  localStorage.removeItem("adminToken")
  localStorage.removeItem("adminUser")
}

import { apiPost, apiRequest } from "./api"

export const verifyAdminToken = async (token: string): Promise<boolean> => {
  try {
    await apiRequest("/admin-auth/verify", {
      method: "POST",
      token,
    })
    return true
  } catch (error) {
    console.error("[v0] Token verification error:", error)
    return false
  }
}

export const adminLogin = async (email: string, password: string) => {
  return apiPost("/admin-auth/login", { email, password })
}

export const adminLogout = async (token: string) => {
  try {
    await apiPost("/admin-auth/logout", undefined, { token })
  } catch (error) {
    console.error("[v0] Logout error:", error)
  }
}
