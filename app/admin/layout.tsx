"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BarChart3, Users, Film, CreditCard, Settings, LogOut, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/casting", label: "Casting Calls", icon: Film },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [adminUser, setAdminUser] = useState<any>(null)
  const [isVerified, setIsVerified] = useState(false)
  const router = useRouter()
  const [isLoginPage, setIsLoginPage] = useState(false)

  useEffect(() => {
    // Check if we're on the login page
    if (typeof window !== "undefined") {
      setIsLoginPage(window.location.pathname === "/admin/login")
    }
  }, [])

  useEffect(() => {
    // Skip auth check for login page
    if (isLoginPage) {
      setIsVerified(true)
      return
    }

    const verifyAdmin = async () => {
      const token = localStorage.getItem("adminToken")
      const user = localStorage.getItem("adminUser")

      if (!token || !user) {
        router.push("/admin/login")
        return
      }

      try {
        const response = await fetch("/api/admin-auth/verify", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          localStorage.removeItem("adminToken")
          localStorage.removeItem("adminUser")
          router.push("/admin/login")
          return
        }

        setAdminUser(JSON.parse(user))
        setIsVerified(true)
      } catch (error) {
        console.error("[v0] Token verification failed:", error)
        router.push("/admin/login")
      }
    }

    verifyAdmin()
  }, [router, isLoginPage])

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      await fetch("/api/admin-auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
    } catch (error) {
      console.error("[v0] Logout error:", error)
    } finally {
      localStorage.removeItem("adminToken")
      localStorage.removeItem("adminUser")
      router.push("/admin/login")
    }
  }

  // Show loading only if not on login page and not verified
  if (!isLoginPage && !isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  // For login page, just render children without sidebar
  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold text-sidebar-foreground">CineMarathi</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-sidebar-accent rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          {sidebarOpen && adminUser && (
            <div className="mb-4 p-3 bg-sidebar-accent rounded-lg">
              <p className="text-xs text-sidebar-foreground font-medium">{adminUser.name}</p>
              <p className="text-xs text-muted-foreground">{adminUser.email}</p>
            </div>
          )}
          <Button onClick={handleLogout} variant="destructive" className="w-full flex items-center gap-2">
            <LogOut size={18} />
            {sidebarOpen && "Logout"}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="bg-card border-b border-border h-16 flex items-center px-8 sticky top-0 z-10">
          <h2 className="text-xl font-semibold text-card-foreground">Admin Panel</h2>
        </header>

        {/* Content Area */}
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
