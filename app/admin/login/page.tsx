"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { LogIn } from "lucide-react"

export default function AdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/admin-auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Login failed")
        setLoading(false)
        return
      }

      localStorage.setItem("adminToken", data.token)
      localStorage.setItem("adminUser", JSON.stringify(data.user))

      router.push("/admin")
    } catch (err) {
      setError("Connection error. Please try again.")
      console.error("[v0] Login error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border border-border">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-card-foreground mb-2">CineMarathi</h1>
            <p className="text-muted-foreground">Admin Panel</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cinemarathi.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive text-destructive rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full gap-2 bg-primary hover:bg-primary/90">
              <LogIn size={18} />
              {loading ? "Logging in..." : "Login"}
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Credentials: admin users with role = 'admin' from database
            </p>
          </form>
        </div>
      </Card>
    </div>
  )
}
