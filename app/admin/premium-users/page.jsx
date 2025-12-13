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
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-card-foreground">Premium Users Management</h1>
      </div>

      {/* Premium Users List */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-card-foreground flex items-center gap-2">
            <Crown className="text-yellow-500" size={20} />
            Lifetime/Premium Users ({premiumUsers.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">User</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Plan</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Start Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {premiumUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No premium users found
                  </td>
                </tr>
              ) : (
                premiumUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-3 text-sm text-card-foreground">{user.name}</td>
                    <td className="px-6 py-3 text-sm text-card-foreground">{user.email}</td>
                    <td className="px-6 py-3 text-sm text-muted-foreground">
                      {user.plan_name || `Plan #${user.plan_id}`}
                      {user.is_lifetime && (
                        <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          Lifetime
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-muted-foreground">
                      {new Date(user.start_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemovePremium(user.id)}
                        className="gap-2"
                      >
                        <Trash2 size={16} />
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
      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-card-foreground mb-4">
            Search Users to Assign Premium
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
            <Input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full max-w-md"
            />
          </div>
          {searchTerm.trim() && (
            <p className="text-sm text-muted-foreground mt-2">
              {searching ? "Searching..." : `Found ${searchedUsers.length} user(s)`}
            </p>
          )}
        </div>

        {searchTerm.trim() !== "" && !searching && (
          <div className="overflow-x-auto mt-4">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">User Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Joined</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Subscription Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {searchedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      No users found matching "{searchTerm}"
                    </td>
                  </tr>
                ) : (
                  searchedUsers.map((user) => {
                    // Check if user has premium subscription
                    const hasPremium = premiumUsers.some(pu => pu.id === user.id)
                    return (
                      <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-3 text-sm text-card-foreground">{user.name}</td>
                        <td className="px-6 py-3 text-sm text-card-foreground">{user.email}</td>
                        <td className="px-6 py-3 text-sm text-muted-foreground">{user.role || user.user_type}</td>
                        <td className="px-6 py-3 text-sm text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-3 text-sm">
                          {hasPremium ? (
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              Has Premium
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                              No Premium
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3">
                          {hasPremium ? (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled
                              className="gap-2"
                            >
                              <Crown size={16} />
                              Already Premium
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user)
                                setAssignDialogOpen(true)
                              }}
                              className="gap-2"
                            >
                              <Crown size={16} />
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

