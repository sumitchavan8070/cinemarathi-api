"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { CheckCircle, XCircle, Eye, Trash2, Plus, Film } from "lucide-react"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiGet, apiPut, apiPost, apiDelete } from "@/lib/api"
import { getAdminToken } from "@/lib/admin-auth"

export default function CastingPage() {
  const { isAuthenticated, authLoading } = useAdminAuth()
  const [castings, setCastings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCasting, setSelectedCasting] = useState(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [productionHouses, setProductionHouses] = useState([])
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    production_house_id: "",
    project_title: "",
    role: "",
    gender: "",
    min_age: "",
    max_age: "",
    skills_required: "",
    location: "",
    budget_per_day: "",
    audition_date: "",
    description: "",
  })

  useEffect(() => {
    if (!isAuthenticated || authLoading) return
    fetchCastings()
    fetchProductionHouses()
  }, [isAuthenticated, authLoading])

  const fetchProductionHouses = async () => {
    try {
      const token = getAdminToken()
      const data = await apiGet("/admin/users", { 
        token,
        params: { user_type: "production_house" }
      })
      setProductionHouses(data.users || [])
    } catch (error) {
      console.error("[v0] Failed to fetch production houses:", error)
    }
  }

  const fetchCastings = async () => {
    try {
      const token = getAdminToken()
      const data = await apiGet("/admin/casting-calls", { token })
      // The API now returns total_applications in the query
      setCastings(data.casting_calls || data || [])
    } catch (error) {
      console.error("[v0] Castings fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  const approveCasting = async (id) => {
    try {
      const token = getAdminToken()
      await apiPut(`/admin/casting-calls/${id}/approve`, { is_approved: true }, { token })
      fetchCastings() // Refresh the list
    } catch (error) {
      console.error("[v0] Approve casting error:", error)
      alert(error.message || "Error approving casting call")
    }
  }

  const rejectCasting = async (id) => {
    try {
      const token = getAdminToken()
      await apiPut(`/admin/casting-calls/${id}/reject`, { is_approved: false }, { token })
      fetchCastings() // Refresh the list
    } catch (error) {
      console.error("[v0] Reject casting error:", error)
      alert(error.message || "Error rejecting casting call")
    }
  }

  const handleDelete = async () => {
    if (!selectedCasting) return

    try {
      const token = getAdminToken()
      await apiDelete(`/admin/casting-calls/${selectedCasting.id}`, { token })
      setDeleteDialogOpen(false)
      setSelectedCasting(null)
      fetchCastings() // Refresh the list
    } catch (error) {
      console.error("[v0] Delete casting error:", error)
      alert(error.message || "Error deleting casting call")
    }
  }

  const handleCreateCasting = async () => {
    if (!formData.production_house_id || !formData.project_title || !formData.role) {
      alert("Please fill in required fields: Production House, Project Title, and Role")
      return
    }

    setCreating(true)
    try {
      const token = getAdminToken()
      await apiPost("/admin/casting-calls", {
        ...formData,
        production_house_id: parseInt(formData.production_house_id),
        min_age: formData.min_age ? parseInt(formData.min_age) : null,
        max_age: formData.max_age ? parseInt(formData.max_age) : null,
        budget_per_day: formData.budget_per_day ? parseFloat(formData.budget_per_day) : null,
      }, { token })
      
      setCreateDialogOpen(false)
      setFormData({
        production_house_id: "",
        project_title: "",
        role: "",
        gender: "",
        min_age: "",
        max_age: "",
        skills_required: "",
        location: "",
        budget_per_day: "",
        audition_date: "",
        description: "",
      })
      fetchCastings() // Refresh the list
    } catch (error) {
      console.error("[v0] Create casting error:", error)
      alert(error.message || "Error creating casting call")
    } finally {
      setCreating(false)
    }
  }

  const getStatusBadge = (casting) => {
    // Check if is_approved column exists and is set
    const isApproved = casting.is_approved === true || casting.is_approved === 1
    const auditionDate = casting.audition_date ? new Date(casting.audition_date) : null
    const now = new Date()

    // If is_approved is null/undefined, check by audition date
    if (casting.is_approved === null || casting.is_approved === undefined) {
      if (auditionDate && auditionDate < now) {
        return { className: "bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-lg shadow-slate-500/30", text: "closed" }
      }
      return { className: "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30", text: "active" }
    }

    if (!isApproved) {
      return { className: "bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg shadow-yellow-500/30", text: "pending" }
    }
    if (auditionDate && auditionDate < now) {
      return { className: "bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-lg shadow-slate-500/30", text: "closed" }
    }
    return { className: "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30", text: "approved" }
  }

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading casting calls...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Casting Management
          </h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">Manage all casting calls and applications</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl border border-purple-200">
            <div className="text-xs text-slate-600 font-medium mb-0.5">Total Castings</div>
            <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {castings.length}
            </div>
          </div>
          <Button 
            onClick={() => setCreateDialogOpen(true)} 
            className="gap-2 h-11 w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Create Casting Call</span>
            <span className="sm:hidden">Create</span>
          </Button>
        </div>
      </div>

      {castings.length === 0 ? (
        <Card className="p-12 text-center bg-white border-0 shadow-xl">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
              <Film className="text-purple-600" size={32} />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900 mb-1">No casting calls found</p>
              <p className="text-slate-500 text-sm">Create your first casting call to get started</p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6">
          {castings.map((casting) => {
            const status = getStatusBadge(casting)
            const isApproved = casting.is_approved === true || casting.is_approved === 1
            const hasApprovalColumn = casting.is_approved !== null && casting.is_approved !== undefined

            return (
              <Card key={casting.id} className="p-4 sm:p-6 bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01] group">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start gap-3 mb-4">
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                        <Film className="text-white" size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1 truncate">{casting.project_title}</h3>
                        <p className="text-xs sm:text-sm text-slate-500">
                          <span className="font-semibold text-slate-700">Production:</span> <span className="truncate block">{casting.production_house_name}</span>
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs sm:text-sm text-slate-600">
                        <span className="font-semibold text-slate-800">Role:</span> {casting.role}
                      </p>
                      {casting.location && (
                        <p className="text-xs sm:text-sm text-slate-600">
                          <span className="font-semibold text-slate-800">Location:</span> {casting.location}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge className={`${status.className} px-3 sm:px-4 py-1.5 text-xs font-bold shadow-lg self-start sm:self-auto`}>
                    {status.text}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6 py-3 sm:py-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-100">
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-1 font-medium">Gender</p>
                    <p className="text-xs sm:text-sm font-bold text-slate-900">{casting.gender || "Any"}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-1 font-medium">Applications</p>
                    <p className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      {Number(casting.total_applications) || 0}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-1 font-medium">Posted</p>
                    <p className="text-xs sm:text-sm font-semibold text-slate-700">
                      {casting.created_at ? new Date(casting.created_at).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>

                {casting.budget_per_day && (
                  <div className="mb-4 px-3 sm:px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <p className="text-xs sm:text-sm font-semibold text-slate-700">
                      <span className="text-green-600">Budget:</span> ₹{casting.budget_per_day} <span className="text-slate-500">per day</span>
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => {
                      setSelectedCasting(casting)
                      setViewDialogOpen(true)
                    }}
                    className="gap-1.5 h-8 sm:h-9 text-xs sm:text-sm bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex-1 sm:flex-initial"
                  >
                    <Eye size={12} className="sm:hidden" />
                    <Eye size={14} className="hidden sm:block" />
                    <span className="hidden sm:inline">View Details</span>
                    <span className="sm:hidden">View</span>
                  </Button>
                  {hasApprovalColumn && !isApproved && (
                    <>
                      <Button 
                        onClick={() => approveCasting(casting.id)} 
                        className="gap-1.5 h-8 sm:h-9 text-xs sm:text-sm bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex-1 sm:flex-initial"
                      >
                        <CheckCircle size={12} className="sm:hidden" />
                        <CheckCircle size={14} className="hidden sm:block" />
                        <span className="hidden sm:inline">Approve</span>
                        <span className="sm:hidden">Approve</span>
                      </Button>
                      <Button 
                        onClick={() => rejectCasting(casting.id)} 
                        className="gap-1.5 h-8 sm:h-9 text-xs sm:text-sm bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex-1 sm:flex-initial"
                      >
                        <XCircle size={12} className="sm:hidden" />
                        <XCircle size={14} className="hidden sm:block" />
                        <span className="hidden sm:inline">Reject</span>
                        <span className="sm:hidden">Reject</span>
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={() => {
                      setSelectedCasting(casting)
                      setDeleteDialogOpen(true)
                    }}
                    className="gap-1.5 h-8 sm:h-9 text-xs sm:text-sm bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex-1 sm:flex-initial"
                  >
                    <Trash2 size={12} className="sm:hidden" />
                    <Trash2 size={14} className="hidden sm:block" />
                    <span className="hidden sm:inline">Delete</span>
                    <span className="sm:hidden">Delete</span>
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedCasting?.project_title}</DialogTitle>
          </DialogHeader>
          {selectedCasting && (
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Production House</p>
                <p className="text-card-foreground">{selectedCasting.production_house_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Role</p>
                <p className="text-card-foreground">{selectedCasting.role}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Gender</p>
                  <p className="text-card-foreground">{selectedCasting.gender || "Any"}</p>
                </div>
                {selectedCasting.min_age && selectedCasting.max_age && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Age Range</p>
                    <p className="text-card-foreground">
                      {selectedCasting.min_age} - {selectedCasting.max_age} years
                    </p>
                  </div>
                )}
              </div>
              {selectedCasting.location && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Location</p>
                  <p className="text-card-foreground">{selectedCasting.location}</p>
                </div>
              )}
              {selectedCasting.budget_per_day && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Budget per Day</p>
                  <p className="text-card-foreground">₹{selectedCasting.budget_per_day}</p>
                </div>
              )}
              {selectedCasting.audition_date && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Audition Date</p>
                  <p className="text-card-foreground">{new Date(selectedCasting.audition_date).toLocaleString()}</p>
                </div>
              )}
              {selectedCasting.skills_required && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Skills Required</p>
                  <p className="text-card-foreground">{selectedCasting.skills_required}</p>
                </div>
              )}
              {selectedCasting.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                  <p className="text-card-foreground whitespace-pre-wrap">{selectedCasting.description}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Applications</p>
                <p className="text-card-foreground">{Number(selectedCasting.total_applications) || 0}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Casting Call Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Casting Call</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="production_house_id">
                  Production House <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.production_house_id}
                  onValueChange={(value) => setFormData({ ...formData, production_house_id: value })}
                >
                  <SelectTrigger id="production_house_id">
                    <SelectValue placeholder="Select production house" />
                  </SelectTrigger>
                  <SelectContent>
                    {productionHouses.map((house) => (
                      <SelectItem key={house.id} value={house.id.toString()}>
                        {house.name} ({house.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project_title">
                  Project Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="project_title"
                  value={formData.project_title}
                  onChange={(e) => setFormData({ ...formData, project_title: e.target.value })}
                  placeholder="Enter project title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">
                  Role <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g., Lead Actor, Supporting Role"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="any">Any</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="min_age">Min Age</Label>
                <Input
                  id="min_age"
                  type="number"
                  value={formData.min_age}
                  onChange={(e) => setFormData({ ...formData, min_age: e.target.value })}
                  placeholder="18"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_age">Max Age</Label>
                <Input
                  id="max_age"
                  type="number"
                  value={formData.max_age}
                  onChange={(e) => setFormData({ ...formData, max_age: e.target.value })}
                  placeholder="50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Mumbai, Maharashtra"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget_per_day">Budget per Day (₹)</Label>
                <Input
                  id="budget_per_day"
                  type="number"
                  value={formData.budget_per_day}
                  onChange={(e) => setFormData({ ...formData, budget_per_day: e.target.value })}
                  placeholder="5000"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="audition_date">Audition Date</Label>
                <Input
                  id="audition_date"
                  type="datetime-local"
                  value={formData.audition_date}
                  onChange={(e) => setFormData({ ...formData, audition_date: e.target.value })}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="skills_required">Skills Required</Label>
                <Input
                  id="skills_required"
                  value={formData.skills_required}
                  onChange={(e) => setFormData({ ...formData, skills_required: e.target.value })}
                  placeholder="e.g., Acting, Dancing, Singing"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Enter project description and requirements..."
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={creating}>
              Cancel
            </Button>
            <Button onClick={handleCreateCasting} disabled={creating} className="gap-2">
              <Plus size={16} />
              {creating ? "Creating..." : "Create Casting Call"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Casting Call</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this casting call? This action cannot be undone and will also delete all
              associated applications.
            </p>
            {selectedCasting && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="font-medium">{selectedCasting.project_title}</p>
                <p className="text-sm text-muted-foreground">{selectedCasting.production_house_name}</p>
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
    </div>
  )
}

