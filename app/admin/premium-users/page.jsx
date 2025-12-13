"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Search, Crown, Trash2, UserPlus, CheckCircle } from "lucide-react"
import { apiGet, apiPut, apiDelete } from "@/lib/api"
import { getAdminToken } from "@/lib/admin-auth"

export default function PremiumUsersPage() {
  const [searchedUsers, setSearchedUsers] = useState([])
  const [premiumUsers, setPremiumUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [planType, setPlanType] = useState("lifetime")

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    // Search users when searchTerm changes
    if (searchTerm.trim() === "") {
      setSearchedUsers([])
      setSearching(false)
      return
    }

    const searchUsers = async () => {
      setSearching(true)
      try {
        const token = getAdminToken()
        const data = await apiGet("/admin/users", { token })
        const users = data.users || []
        
        // Filter users based on search term
        const filtered = users.filter(
          (user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
        
        setSearchedUsers(filtered)
      } catch (error) {
        console.error("[Premium Users] Search error:", error)
      } finally {
        setSearching(false)
      }
    }

    // Debounce search
    const timeoutId = setTimeout(searchUsers, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const fetchData = async () => {
    try {
      const token = getAdminToken()
      const premiumData = await apiGet("/admin/premium-users", { token })
      setPremiumUsers(premiumData.premium_users || [])
    } catch (error) {
      console.error("[Premium Users] Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignPremium = async () => {
    if (!selectedUser) return

    try {
      const token = getAdminToken()
      await apiPost(`/admin/users/${selectedUser.id}/assign-premium`, {
        is_lifetime: planType === "lifetime",
        plan_id: null, // Let API determine the plan
      }, { token })
      
      setAssignDialogOpen(false)
      setSelectedUser(null)
      await fetchData() // Refresh premium users list
      // Re-trigger search if we have a search term
      if (searchTerm.trim() !== "") {
        const currentSearch = searchTerm
        setSearchTerm("")
        setTimeout(() => setSearchTerm(currentSearch), 100)
      }
    } catch (error) {
      console.error("[Premium Users] Assign error:", error)
      alert(error.message || "Error assigning premium access")
    }
  }

  const handleRemovePremium = async (userId) => {
    if (!confirm("Are you sure you want to remove premium access from this user?")) {
      return
    }

    try {
      const token = getAdminToken()
      await apiDelete(`/admin/users/${userId}/remove-premium`, { token })
      await fetchData() // Refresh premium users list
      // Re-trigger search if we have a search term
      if (searchTerm.trim() !== "") {
        const currentSearch = searchTerm
        setSearchTerm("")
        setTimeout(() => setSearchTerm(currentSearch), 100)
      }
    } catch (error) {
      console.error("[Premium Users] Remove error:", error)
      alert(error.message || "Error removing premium access")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Premium Users Management
          </h1>
          <p className="text-slate-500 mt-1">Manage premium and lifetime subscriptions</p>
        </div>
      </div>

      {/* Premium Users List */}
      <Card className="p-6 bg-white border-0 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <Crown className="text-white" size={24} />
            </div>
            <div>
              <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Premium Users
              </span>
              <span className="ml-2 px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full text-sm font-bold">
                {premiumUsers.length}
              </span>
            </div>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-900 to-slate-800">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">User</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Email</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Plan</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Status</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Start Date</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {premiumUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                        <Crown className="text-slate-400" size={24} />
                      </div>
                      <p className="text-slate-500 font-medium">No premium users found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                premiumUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-200 group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                          {user.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <span className="text-sm font-semibold text-slate-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{user.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                          {user.plan_name || `Plan #${user.plan_id}`}
                        </span>
                        {user.is_lifetime && (
                          <span className="px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full text-xs font-bold shadow-lg shadow-yellow-500/30">
                            Lifetime
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-xs font-bold shadow-lg shadow-green-500/30">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(user.start_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        size="sm"
                        onClick={() => handleRemovePremium(user.id)}
                        className="gap-1.5 h-8 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <Trash2 size={14} />
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Search and Assign Premium */}
      <Card className="p-6 bg-white border-0 shadow-xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <UserPlus className="text-white" size={20} />
            </div>
            Search Users to Assign Premium
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <Input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full max-w-md h-11 border-2 border-slate-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl transition-all duration-200"
            />
          </div>
          {searchTerm.trim() && (
            <p className="text-sm text-slate-600 mt-3 font-medium">
              {searching ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  Searching...
                </span>
              ) : (
                <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-lg font-semibold">
                  Found {searchedUsers.length} user(s)
                </span>
              )}
            </p>
          )}
        </div>

        {searchTerm.trim() !== "" && !searching && (
          <div className="overflow-x-auto mt-6">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-900 to-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white">User Type</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white">Joined</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white">Subscription Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {searchedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                          <Search className="text-slate-400" size={24} />
                        </div>
                        <p className="text-slate-500 font-medium">No users found matching "{searchTerm}"</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  searchedUsers.map((user) => {
                    // Check if user has premium subscription
                    const hasPremium = premiumUsers.some(pu => pu.id === user.id)
                    return (
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
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          {hasPremium ? (
                            <span className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-xs font-bold shadow-lg shadow-green-500/30">
                              Has Premium
                            </span>
                          ) : (
                            <span className="px-3 py-1.5 bg-gradient-to-r from-slate-400 to-slate-500 text-white rounded-full text-xs font-bold shadow-lg shadow-slate-500/30">
                              No Premium
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {hasPremium ? (
                            <Button
                              size="sm"
                              disabled
                              className="gap-1.5 h-8 bg-slate-300 text-slate-500 font-semibold rounded-lg cursor-not-allowed"
                            >
                              <Crown size={14} />
                              Already Premium
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user)
                                setAssignDialogOpen(true)
                              }}
                              className="gap-1.5 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                            >
                              <Crown size={14} />
                              Assign Premium
                            </Button>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Assign Premium Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Premium Access</DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Assigning premium access to:
                </p>
                <p className="font-medium">{selectedUser.name}</p>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
              </div>

              <div className="space-y-2">
                <Label>Plan Type</Label>
                <Select
                  value={planType}
                  onValueChange={(value) => setPlanType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lifetime">Lifetime Premium</SelectItem>
                    <SelectItem value="custom">Custom Duration (1 Year)</SelectItem>
                  </SelectContent>
                </Select>
                {planType === "lifetime" && (
                  <p className="text-xs text-muted-foreground">
                    User will have lifetime access - never expires
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignPremium} className="gap-2">
              <CheckCircle size={16} />
              Assign Premium
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

