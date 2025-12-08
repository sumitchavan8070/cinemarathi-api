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

export const verifyAdminToken = async (token: string): Promise<boolean> => {
  try {
    const response = await fetch("/api/admin-auth/verify", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
    return response.ok
  } catch (error) {
    console.error("[v0] Token verification error:", error)
    return false
  }
}

export const adminLogin = async (email: string, password: string) => {
  const response = await fetch("/api/admin-auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Login failed")
  }

  return data
}

export const adminLogout = async (token: string) => {
  try {
    await fetch("/api/admin-auth/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("[v0] Logout error:", error)
  }
}
