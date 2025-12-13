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
      return "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/30"
    }
    if (!endDate) {
      return "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30"
    }
    const end = new Date(endDate)
    const now = new Date()
    if (isNaN(end.getTime()) || end < now) {
      return "bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-lg shadow-slate-500/30"
    }
    return "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30"
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
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading subscriptions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Subscriptions
          </h1>
          <p className="text-slate-500 mt-1">Manage user subscriptions and premium plans</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 text-right">
            <p className="text-xs text-green-700 font-medium mb-0.5">Active Revenue</p>
            <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              ₹{totalRevenue}
            </p>
          </div>
          <Button 
            onClick={() => setCreateDialogOpen(true)} 
            className="gap-2 h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus size={18} />
            Create Subscription
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <p className="text-sm text-blue-100 mb-2 font-medium">Total Subscriptions</p>
          <h3 className="text-4xl font-bold mb-1">{subscriptions.length}</h3>
          <p className="text-xs text-blue-100 flex items-center gap-1">
            <span className="font-semibold">{activeSubscriptions.length}</span> active
          </p>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <p className="text-sm text-green-100 mb-2 font-medium">Current Profit</p>
          <h3 className="text-4xl font-bold mb-1">₹{totalRevenue}</h3>
          <p className="text-xs text-green-100">Total active subscriptions value</p>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <p className="text-sm text-purple-100 mb-2 font-medium">MRR</p>
          <h3 className="text-4xl font-bold mb-1">₹{totalRevenue}</h3>
          <p className="text-xs text-purple-100">Monthly Recurring Revenue</p>
        </Card>
      </div>

      <Card className="overflow-hidden bg-white border-0 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-900 to-slate-800">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">User</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Plan</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Period</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Status</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                        <CreditCard className="text-slate-400" size={24} />
                      </div>
                      <p className="text-slate-500 font-medium">No subscriptions found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => {
                  const status = getStatusText(sub.is_active, sub.end_date)
                  return (
                    <tr key={sub.id} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-200 group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                            {sub.user_name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{sub.user_name}</div>
                            <div className="text-xs text-slate-500">{sub.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                          {sub.plan_name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          ₹{Number(sub.price) || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {sub.start_date ? new Date(sub.start_date).toLocaleDateString() : "N/A"} to{" "}
                        {sub.end_date ? new Date(sub.end_date).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-bold ${getStatusBadge(
                            sub.is_active,
                            sub.end_date,
                          )}`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleEdit(sub)}
                            className="gap-1.5 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                          >
                            <Edit2 size={14} />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedSubscription(sub)
                              setDeleteDialogOpen(true)
                            }}
                            className="gap-1.5 h-8 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
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




