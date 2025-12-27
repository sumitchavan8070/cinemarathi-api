"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Search, Plus, Edit2, Trash2, Shield, Loader2, Users } from "lucide-react"
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api"
import { getAdminToken } from "@/lib/admin-auth"
import { toast } from "sonner"

export default function RolesPage() {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    permissions: [],
    is_active: true,
  })
  const [permissionInput, setPermissionInput] = useState("")

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      setLoading(true)
      const token = getAdminToken()
      const data = await apiGet("/roles", { token })
      setRoles(data.roles || [])
    } catch (error) {
      console.error("[Roles] Error fetching roles:", error)
      toast.error(error?.message || "Failed to load roles")
    } finally {
      setLoading(false)
    }
  }

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleOpenDialog = (role = null) => {
    if (role) {
      setEditingRole(role)
      setFormData({
        name: role.name || "",
        slug: role.slug || "",
        description: role.description || "",
        permissions: Array.isArray(role.permissions) ? role.permissions : [],
        is_active: role.is_active === 1 || role.is_active === true,
      })
      setPermissionInput(Array.isArray(role.permissions) ? role.permissions.join(", ") : "")
    } else {
      setEditingRole(null)
      setFormData({
        name: "",
        slug: "",
        description: "",
        permissions: [],
        is_active: true,
      })
      setPermissionInput("")
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingRole(null)
    setFormData({
      name: "",
      slug: "",
      description: "",
      permissions: [],
      is_active: true,
    })
    setPermissionInput("")
  }

  const handlePermissionInputChange = (value) => {
    setPermissionInput(value)
    // Parse permissions from comma-separated string
    const perms = value
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
    setFormData({ ...formData, permissions: perms })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = getAdminToken()
      const payload = {
        ...formData,
        permissions: formData.permissions.length > 0 ? formData.permissions : null,
      }

      if (editingRole) {
        await apiPut(`/roles/${editingRole.id}`, payload, { token })
        toast.success("Role updated successfully")
      } else {
        await apiPost("/roles", payload, { token })
        toast.success("Role created successfully")
      }

      handleCloseDialog()
      fetchRoles()
    } catch (error) {
      console.error("[Roles] Error saving role:", error)
      toast.error(error?.message || "Failed to save role")
    }
  }

  const handleDelete = async (role) => {
    if (!confirm(`Are you sure you want to delete "${role.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const token = getAdminToken()
      await apiDelete(`/roles/${role.id}`, { token })
      toast.success("Role deleted successfully")
      fetchRoles()
    } catch (error) {
      console.error("[Roles] Error deleting role:", error)
      toast.error(error?.message || "Failed to delete role")
    }
  }

  const handleToggleActive = async (role) => {
    try {
      const token = getAdminToken()
      await apiPut(
        `/roles/${role.id}`,
        { is_active: !(role.is_active === 1 || role.is_active === true) },
        { token }
      )
      toast.success(`Role ${role.is_active ? "deactivated" : "activated"} successfully`)
      fetchRoles()
    } catch (error) {
      console.error("[Roles] Error toggling role status:", error)
      toast.error(error?.message || "Failed to update role status")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Manage Roles
          </h1>
          <p className="text-slate-600 mt-1">Create and manage user roles and permissions</p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Role
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input
            placeholder="Search roles by name, slug, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Roles Grid */}
      {filteredRoles.length === 0 ? (
        <Card className="p-12 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {searchTerm ? "No roles found" : "No roles yet"}
          </h3>
          <p className="text-slate-600 mb-4">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Create your first role to get started"}
          </p>
          {!searchTerm && (
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Role
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoles.map((role) => (
            <Card key={role.id} className="p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{role.name}</h3>
                    <p className="text-xs text-slate-500">@{role.slug}</p>
                  </div>
                </div>
                {role.is_system === 1 && (
                  <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded">
                    System
                  </span>
                )}
              </div>

              {role.description && (
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{role.description}</p>
              )}

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users className="w-4 h-4" />
                  <span>{role.user_count || 0} users</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${
                      role.is_active === 1 || role.is_active === true
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {role.is_active === 1 || role.is_active === true ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {Array.isArray(role.permissions) && role.permissions.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-slate-700 mb-2">Permissions:</p>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 3).map((perm, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded"
                      >
                        {perm}
                      </span>
                    ))}
                    {role.permissions.length > 3 && (
                      <span className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded">
                        +{role.permissions.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenDialog(role)}
                  disabled={role.is_system === 1}
                  className="flex-1"
                >
                  <Edit2 className="w-3 h-3 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleActive(role)}
                  disabled={role.is_system === 1}
                >
                  {role.is_active === 1 || role.is_active === true ? "Deactivate" : "Activate"}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(role)}
                  disabled={role.is_system === 1 || (role.user_count && role.user_count > 0)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRole ? "Edit Role" : "Create New Role"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Role Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Content Moderator"
                required
                disabled={editingRole?.is_system === 1}
              />
            </div>

            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })
                }
                placeholder="e.g., content-moderator"
                required
                disabled={editingRole?.is_system === 1}
              />
              <p className="text-xs text-slate-500 mt-1">
                Lowercase letters, numbers, hyphens, and underscores only
              </p>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this role can do..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="permissions">Permissions</Label>
              <Input
                id="permissions"
                value={permissionInput}
                onChange={(e) => handlePermissionInputChange(e.target.value)}
                placeholder="e.g., read:posts, write:posts, delete:posts (comma-separated)"
              />
              <p className="text-xs text-slate-500 mt-1">
                Enter permissions separated by commas
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Active Status</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                disabled={editingRole?.is_system === 1}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                {editingRole ? "Update Role" : "Create Role"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}






