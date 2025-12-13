"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Trash2, Edit2, Plus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api"
import { getAdminToken } from "@/lib/admin-auth"

export default function SubscriptionsPage() {
  const { isAuthenticated, authLoading } = useAdminAuth()
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState(null)
  const [users, setUsers] = useState([])
  const [plans, setPlans] = useState([])
  const [editForm, setEditForm] = useState({
    plan_id: "",
    start_date: "",
    end_date: "",
    is_active: true,
  })
  const [createForm, setCreateForm] = useState({
    user_id: "",
    plan_id: "",
    start_date: "",
    end_date: "",
    is_active: true,
  })

  useEffect(() => {
    if (!isAuthenticated || authLoading) return
    fetchSubscriptions()
    fetchUsers()
    fetchPlans()
  }, [isAuthenticated, authLoading])

  const fetchSubscriptions = async () => {
    try {
      const token = getAdminToken()
      const data = await apiGet("/admin/subscriptions", { token })
      setSubscriptions(data.subscriptions || [])
    } catch (error) {
      console.error("[v0] Subscriptions fetch error:", error)
      alert(`Error fetching subscriptions: ${error.message || "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const token = getAdminToken()
      const data = await apiGet("/admin/users", { token })
      setUsers(data.users || [])
    } catch (error) {
      console.error("[v0] Failed to fetch users:", error)
    }
  }

  const fetchPlans = async () => {
    try {
      const data = await apiGet("/premium/plans")
      setPlans(data || [])
    } catch (error) {
      console.error("[v0] Failed to fetch plans:", error)
    }
  }

  const handleEdit = (sub) => {
    setSelectedSubscription(sub)
    setEditForm({
      plan_id: sub.plan_id.toString(),
      start_date: sub.start_date ? sub.start_date.split("T")[0] : "",
      end_date: sub.end_date ? sub.end_date.split("T")[0] : "",
      is_active: sub.is_active,
    })
    setEditDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (!selectedSubscription) return

    try {
      const token = getAdminToken()
      await apiPut(`/admin/subscriptions/${selectedSubscription.id}`, {
        plan_id: parseInt(editForm.plan_id),
        start_date: editForm.start_date,
        end_date: editForm.end_date,
        is_active: editForm.is_active,
      }, { token })
      
      setEditDialogOpen(false)
      fetchSubscriptions() // Refresh the list
    } catch (error) {
      console.error("[v0] Update subscription error:", error)
      alert(error.message || "Error updating subscription")
    }
  }

  const handleDelete = async () => {
    if (!selectedSubscription) return

    try {
      const token = getAdminToken()
      await apiDelete(`/admin/subscriptions/${selectedSubscription.id}`, { token })
      setDeleteDialogOpen(false)
      setSelectedSubscription(null)
      fetchSubscriptions() // Refresh the list
    } catch (error) {
      console.error("[v0] Delete subscription error:", error)
      alert(error.message || "Error deleting subscription")
    }
  }

  const handleCreate = async () => {
    if (!createForm.user_id || !createForm.plan_id || !createForm.start_date || !createForm.end_date) {
      alert("Please fill in all required fields")
      return
    }

    try {
      const token = getAdminToken()
      await apiPost("/admin/subscriptions", {
        user_id: parseInt(createForm.user_id),
        plan_id: parseInt(createForm.plan_id),
        start_date: createForm.start_date,
        end_date: createForm.end_date,
        is_active: createForm.is_active ? 1 : 0,
      }, { token })
      
      setCreateDialogOpen(false)
      setCreateForm({
        user_id: "",
        plan_id: "",
        start_date: "",
        end_date: "",
        is_active: true,
      })
      fetchSubscriptions() // Refresh the list
    } catch (error) {
      console.error("[v0] Create subscription error:", error)
      alert(error.message || "Error creating subscription")
    }
  }

  const getStatusBadge = (isActive, endDate) => {
    // Handle is_active as boolean or 0/1 (tinyint)
    const active = isActive === true || isActive === 1 || isActive === '1'
    if (!active) {
      return "bg-red-100 text-red-800"
    }
    if (!endDate) {
      return "bg-green-100 text-green-800"
    }
    const end = new Date(endDate)
    const now = new Date()
    if (isNaN(end.getTime()) || end < now) {
      return "bg-gray-100 text-gray-800"
    }
    return "bg-green-100 text-green-800"
  }

  const getStatusText = (isActive, endDate) => {
    // Handle is_active as boolean or 0/1 (tinyint)
    const active = isActive === true || isActive === 1 || isActive === '1'
    if (!active) {
      return "cancelled"
    }
    if (!endDate) {
      return "active"
    }
    const end = new Date(endDate)
    const now = new Date()
    if (isNaN(end.getTime()) || end < now) {
      return "expired"
    }
    return "active"
  }

  const activeSubscriptions = subscriptions.filter((sub) => {
    // Handle is_active as boolean or 0/1 (tinyint)
    const isActive = sub.is_active === true || sub.is_active === 1 || sub.is_active === '1'
    if (!isActive) return false
    
    // If no end date, consider it active
    if (!sub.end_date) return true
    
    // Check if end date is in the future
    const end = new Date(sub.end_date)
    const now = new Date()
    // Set time to start of day for accurate comparison
    now.setHours(0, 0, 0, 0)
    end.setHours(0, 0, 0, 0)
    
    return !isNaN(end.getTime()) && end >= now
  })
  
  // Total value of active subscriptions (current profit / MRR)
  const totalRevenue = activeSubscriptions.reduce((sum, sub) => {
    const price = Number(sub.price) || 0
    return sum + price
  }, 0)

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading subscriptions...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-card-foreground">Subscriptions</h1>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Active Revenue</p>
            <p className="text-2xl font-bold text-green-600">₹{totalRevenue}</p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus size={18} />
            Create Subscription
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-card border border-border">
          <p className="text-sm text-muted-foreground mb-2">Total Subscriptions</p>
          <h3 className="text-3xl font-bold text-card-foreground">{subscriptions.length}</h3>
          <p className="text-xs text-green-600 mt-2">{activeSubscriptions.length} active</p>
        </Card>
        <Card className="p-6 bg-card border border-border">
          <p className="text-sm text-muted-foreground mb-2">Current Profit</p>
          <h3 className="text-3xl font-bold text-card-foreground">₹{totalRevenue}</h3>
          <p className="text-xs text-green-600 mt-2">Total active subscriptions value</p>
        </Card>
        <Card className="p-6 bg-card border border-border">
          <p className="text-sm text-muted-foreground mb-2">MRR</p>
          <h3 className="text-3xl font-bold text-card-foreground">₹{totalRevenue}</h3>
          <p className="text-xs text-green-600 mt-2">Monthly Recurring</p>
        </Card>
      </div>

      <Card className="overflow-hidden bg-card border border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">User</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Plan</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Period</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No subscriptions found
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => {
                  const status = getStatusText(sub.is_active, sub.end_date)
                  return (
                    <tr key={sub.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-3 text-sm text-card-foreground font-medium">
                        <div>
                          <div>{sub.user_name}</div>
                          <div className="text-xs text-muted-foreground">{sub.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-card-foreground">{sub.plan_name}</td>
                      <td className="px-6 py-3 text-sm font-semibold text-card-foreground">₹{Number(sub.price) || 0}</td>
                      <td className="px-6 py-3 text-sm text-muted-foreground">
                        {sub.start_date ? new Date(sub.start_date).toLocaleDateString() : "N/A"} to{" "}
                        {sub.end_date ? new Date(sub.end_date).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-6 py-3 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                            sub.is_active,
                            sub.end_date,
                          )}`}
                        >
                          {status}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(sub)}
                            className="gap-2 bg-transparent"
                          >
                        <Edit2 size={14} />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                            onClick={() => {
                              setSelectedSubscription(sub)
                              setDeleteDialogOpen(true)
                            }}
                        className="gap-2"
                      >
                        <Trash2 size={14} />
                            Delete
                      </Button>
                    </div>
                  </td>
                </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>



      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2">Plan ID</label>
              <Input
                type="number"
                value={editForm.plan_id}
                onChange={(e) => setEditForm({ ...editForm, plan_id: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <Input
                type="date"
                value={editForm.start_date}
                onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <Input
                type="date"
                value={editForm.end_date}
                onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={editForm.is_active}
                onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="is_active" className="text-sm font-medium">
                Active
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Subscription</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this subscription? This action cannot be undone.
            </p>
            {selectedSubscription && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="font-medium">{selectedSubscription.user_name}</p>
                <p className="text-sm text-muted-foreground">{selectedSubscription.plan_name}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Subscription</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2">User *</label>
              <Select value={createForm.user_id} onValueChange={(value) => setCreateForm({ ...createForm, user_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Plan *</label>
              <Select value={createForm.plan_id} onValueChange={(value) => setCreateForm({ ...createForm, plan_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id.toString()}>
                      {plan.name} - ₹{plan.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Start Date *</label>
              <Input
                type="date"
                value={createForm.start_date}
                onChange={(e) => setCreateForm({ ...createForm, start_date: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date *</label>
              <Input
                type="date"
                value={createForm.end_date}
                onChange={(e) => setCreateForm({ ...createForm, end_date: e.target.value })}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="create_is_active"
                checked={createForm.is_active}
                onChange={(e) => setCreateForm({ ...createForm, is_active: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="create_is_active" className="text-sm font-medium">
                Active
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Subscription</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}




