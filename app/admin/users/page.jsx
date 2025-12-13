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
    return isVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
  }

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading users...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-card-foreground">User Management</h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Link href="/admin/users/create">
            <Button className="gap-2">
              <UserPlus size={16} />
              Create User
            </Button>
          </Link>
        </div>
      </div>

      <Card className="overflow-hidden bg-card border border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Joined</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-3 text-sm text-card-foreground">{user.name}</td>
                  <td className="px-6 py-3 text-sm text-card-foreground">{user.email}</td>
                  <td className="px-6 py-3 text-sm text-muted-foreground">{user.role}</td>
                  <td className="px-6 py-3 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(user.is_verified)}`}>
                      {user.is_verified ? "verified" : "pending"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex gap-2">
                      {!user.is_verified && (
                        <Button size="sm" variant="outline" onClick={() => verifyUser(user.id)} className="gap-2">
                          <CheckCircle size={16} />
                          Verify
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => suspendUser(user.id)}
                        className="gap-2 text-orange-600 hover:text-orange-700"
                      >
                        <Shield size={16} />
                        Suspend
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteUser(user.id)} className="gap-2">
                        <Trash2 size={16} />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}




