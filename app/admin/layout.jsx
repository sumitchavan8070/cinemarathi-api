"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { BarChart3, Users, Film, CreditCard, Settings, LogOut, Menu, X, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { verifyAdminToken, adminLogout } from "@/lib/admin-auth"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/premium-users", label: "Premium Users", icon: Crown },
  { href: "/admin/casting", label: "Casting Calls", icon: Film },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [adminUser, setAdminUser] = useState(null)
  const [isVerified, setIsVerified] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const isLoginPage = pathname === "/admin/login"

  useEffect(() => {
    // Skip auth check for login page
    if (isLoginPage) {
      setIsVerified(true)
      setAdminUser(null)
      return
    }

    const verifyAdmin = async () => {
      const token = localStorage.getItem("adminToken")
      const user = localStorage.getItem("adminUser")

      if (!token || !user) {
        setIsVerified(false)
        if (typeof window !== "undefined") {
          window.location.href = "/admin/login"
        } else {
          router.replace("/admin/login")
        }
        return
      }

      try {
        const isValid = await verifyAdminToken(token)

        if (!isValid) {
          localStorage.removeItem("adminToken")
          localStorage.removeItem("adminUser")
          setIsVerified(false)
          if (typeof window !== "undefined") {
            window.location.href = "/admin/login"
          } else {
            router.replace("/admin/login")
          }
          return
        }

        setAdminUser(JSON.parse(user))
        setIsVerified(true)
      } catch (error) {
        console.error("[v0] Token verification failed:", error)
        localStorage.removeItem("adminToken")
        localStorage.removeItem("adminUser")
        setIsVerified(false)
        if (typeof window !== "undefined") {
          window.location.href = "/admin/login"
        } else {
          router.replace("/admin/login")
        }
      }
    }

    verifyAdmin()
  }, [router, pathname])

  const handleLogout = async () => {
    try {
      // Get token before clearing
      const token = localStorage.getItem("adminToken")
      
      // Clear localStorage first
      localStorage.removeItem("adminToken")
      localStorage.removeItem("adminUser")
      
      // Clear state
      setAdminUser(null)
      setIsVerified(false)
      
      // Call logout API if token exists
      if (token) {
        try {
          await adminLogout(token)
        } catch (error) {
          console.error("[v0] Logout API error:", error)
        }
      }
      
      // Redirect to login - use window.location for production
      if (typeof window !== "undefined") {
        window.location.href = "/admin/login"
      } else {
        router.replace("/admin/login")
      }
    } catch (error) {
      console.error("[v0] Logout error:", error)
      // Still redirect even if there's an error
      localStorage.removeItem("adminToken")
      localStorage.removeItem("adminUser")
      if (typeof window !== "undefined") {
        window.location.href = "/admin/login"
      } else {
        router.replace("/admin/login")
      }
    }
  }

  // For login page, render without sidebar or layout
  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    )
  }

  // Show loading if not verified yet (but not on login page)
  if (!isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700/50 transition-all duration-300 flex flex-col shadow-2xl`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-700/50 flex items-center justify-between bg-slate-900/50">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Film className="text-white" size={20} />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                CineMarathi
              </h1>
            </div>
          )}
          {!sidebarOpen && (
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg mx-auto">
              <Film className="text-white" size={20} />
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-all duration-200 text-slate-300 hover:text-white"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50 scale-105"
                    : "text-slate-300 hover:bg-slate-700/50 hover:text-white hover:scale-105"
                }`}
              >
                <Icon size={20} className={isActive ? "text-white" : "text-slate-400 group-hover:text-white"} />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
          {sidebarOpen && adminUser && (
            <div className="mb-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {adminUser.name?.charAt(0)?.toUpperCase() || "A"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{adminUser.name}</p>
                  <p className="text-xs text-slate-400 truncate">{adminUser.email}</p>
                </div>
              </div>
            </div>
          )}
          <Button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <LogOut size={18} />
            {sidebarOpen && "Logout"}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Admin Panel
          </h2>
          {adminUser && (
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-slate-900">{adminUser.name}</p>
                <p className="text-xs text-slate-500">{adminUser.email}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                {adminUser.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
            </div>
          )}
        </header>

        {/* Content Area */}
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}




