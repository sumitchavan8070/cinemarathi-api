"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, CheckCircle, Shield, Trash2, UserPlus } from "lucide-react"
import Link from "next/link"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import { apiGet, apiPut, apiDelete } from "@/lib/api"
import { getAdminToken } from "@/lib/admin-auth"

export default function UsersPage() {
  const { isAuthenticated, authLoading } = useAdminAuth()
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || authLoading) return

    const fetchUsers = async () => {
      try {
        const token = getAdminToken()
        const data = await apiGet("/admin/users", { token })
        setUsers(data.users || [])
        setFilteredUsers(data.users || [])
      } catch (error) {
        console.error("[v0] Users fetch error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [isAuthenticated, authLoading])

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredUsers(filtered)
  }, [searchTerm, users])

  const verifyUser = async (id) => {
    try {
      const token = getAdminToken()
      await apiPut(`/admin/users/${id}/verify`, { is_verified: true }, { token })
      setUsers(users.map((user) => (user.id === id ? { ...user, is_verified: true } : user)))
    } catch (error) {
      console.error("[v0] Verify user error:", error)
    }
  }

  const suspendUser = async (id) => {
    try {
      const token = getAdminToken()
      await apiPut(`/admin/users/${id}/suspend`, {}, { token })
      setUsers(users.filter((user) => user.id !== id))
    } catch (error) {
      console.error("[v0] Suspend user error:", error)
    }
  }

  const deleteUser = async (id) => {
    try {
      const token = getAdminToken()
      await apiDelete(`/admin/users/${id}`, { token })
      setUsers(users.filter((user) => user.id !== id))
    } catch (error) {
      console.error("[v0] Delete user error:", error)
    }
  }


  const getStatusBadge = (isVerified) => {
    if (isVerified) {
      return "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30"
    }
    return "bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg shadow-yellow-500/30"
  }

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-slate-500 mt-1">Manage all platform users</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64 h-11 border-2 border-slate-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl transition-all duration-200"
            />
          </div>
          <Link href="/admin/users/create">
            <Button className="gap-2 h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
              <UserPlus size={18} />
              Create User
            </Button>
          </Link>
        </div>
      </div>

      <Card className="overflow-hidden bg-white border-0 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-900 to-slate-800">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Name</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Email</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Role</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Status</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Joined</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                        <Search className="text-slate-400" size={24} />
                      </div>
                      <p className="text-slate-500 font-medium">No users found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-200 group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                          {user.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <span className="text-sm font-semibold text-slate-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold capitalize">
                        {user.role || user.user_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${getStatusBadge(user.is_verified)}`}>
                        {user.is_verified ? "✓ Verified" : "⏳ Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {!user.is_verified && (
                          <Button 
                            size="sm" 
                            onClick={() => verifyUser(user.id)} 
                            className="gap-1.5 h-8 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                          >
                            <CheckCircle size={14} />
                            Verify
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => suspendUser(user.id)}
                          className="gap-1.5 h-8 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          <Shield size={14} />
                          Suspend
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => deleteUser(user.id)} 
                          className="gap-1.5 h-8 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          <Trash2 size={14} />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}




