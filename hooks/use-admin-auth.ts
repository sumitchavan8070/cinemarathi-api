"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getAdminToken, getAdminUser, verifyAdminToken, clearAdminAuth } from "@/lib/admin-auth"

export const useAdminAuth = () => {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const token = getAdminToken()
      const storedUser = getAdminUser()

      if (!token || !storedUser) {
        setLoading(false)
        setIsAuthenticated(false)
        return
      }

      try {
        const isValid = await verifyAdminToken(token)

        if (isValid) {
          setUser(storedUser)
          setIsAuthenticated(true)
        } else {
          clearAdminAuth()
          setIsAuthenticated(false)
          router.push("/admin/login")
        }
      } catch (error) {
        console.error("[v0] Auth check error:", error)
        clearAdminAuth()
        setIsAuthenticated(false)
        router.push("/admin/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  return { user, loading, isAuthenticated }
}
