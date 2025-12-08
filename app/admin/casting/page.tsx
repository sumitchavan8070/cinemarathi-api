"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { CheckCircle, XCircle, Eye, Trash2 } from "lucide-react"
import { useAdminAuth } from "@/hooks/use-admin-auth"

interface CastingCall {
  id: number
  project_title: string
  production_house_name: string
  production_house_id?: number
  role: string
  gender: string
  min_age: number | null
  max_age: number | null
  skills_required: string | null
  location: string | null
  budget_per_day: number | null
  audition_date: string | null
  description: string | null
  created_at: string
  is_approved?: boolean | number | null
  total_applications?: number | string
}

export default function CastingPage() {
  const { isAuthenticated, authLoading } = useAdminAuth()
  const [castings, setCastings] = useState<CastingCall[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCasting, setSelectedCasting] = useState<CastingCall | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || authLoading) return
    fetchCastings()
  }, [isAuthenticated, authLoading])

  const fetchCastings = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/admin/casting-calls", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        // The API now returns total_applications in the query
        setCastings(data.casting_calls || data || [])
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        console.error("[v0] Failed to fetch castings:", errorData.error || response.statusText)
      }
    } catch (error) {
      console.error("[v0] Castings fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  const approveCasting = async (id: number) => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`/api/admin/casting-calls/${id}/approve`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_approved: true }),
      })

      if (response.ok) {
        fetchCastings() // Refresh the list
      } else {
        const error = await response.json()
        alert(error.error || "Failed to approve casting call")
      }
    } catch (error) {
      console.error("[v0] Approve casting error:", error)
      alert("Error approving casting call")
    }
  }

  const rejectCasting = async (id: number) => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`/api/admin/casting-calls/${id}/reject`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_approved: false }),
      })

      if (response.ok) {
        fetchCastings() // Refresh the list
      } else {
        const error = await response.json()
        alert(error.error || "Failed to reject casting call")
      }
    } catch (error) {
      console.error("[v0] Reject casting error:", error)
      alert("Error rejecting casting call")
    }
  }

  const handleDelete = async () => {
    if (!selectedCasting) return

    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`/api/admin/casting-calls/${selectedCasting.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setDeleteDialogOpen(false)
        setSelectedCasting(null)
        fetchCastings() // Refresh the list
      } else {
        const error = await response.json()
        alert(error.error || "Failed to delete casting call")
      }
    } catch (error) {
      console.error("[v0] Delete casting error:", error)
      alert("Error deleting casting call")
    }
  }

  const getStatusBadge = (casting: CastingCall) => {
    // Check if is_approved column exists and is set
    const isApproved = casting.is_approved === true || casting.is_approved === 1
    const auditionDate = casting.audition_date ? new Date(casting.audition_date) : null
    const now = new Date()

    // If is_approved is null/undefined, check by audition date
    if (casting.is_approved === null || casting.is_approved === undefined) {
      if (auditionDate && auditionDate < now) {
        return { className: "bg-gray-100 text-gray-800", text: "closed" }
      }
      return { className: "bg-green-100 text-green-800", text: "active" }
    }

    if (!isApproved) {
      return { className: "bg-yellow-100 text-yellow-800", text: "pending" }
    }
    if (auditionDate && auditionDate < now) {
      return { className: "bg-gray-100 text-gray-800", text: "closed" }
    }
    return { className: "bg-green-100 text-green-800", text: "active" }
  }

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading casting calls...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-card-foreground">Casting Management</h1>
        <div className="text-sm text-muted-foreground">
          Total Castings: <span className="font-bold text-card-foreground">{castings.length}</span>
        </div>
      </div>

      {castings.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No casting calls found</p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {castings.map((casting) => {
            const status = getStatusBadge(casting)
            const isApproved = casting.is_approved === true || casting.is_approved === 1
            const hasApprovalColumn = casting.is_approved !== null && casting.is_approved !== undefined

            return (
              <Card key={casting.id} className="p-6 bg-card border border-border hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-card-foreground mb-2">{casting.project_title}</h3>
                    <p className="text-sm text-muted-foreground mb-1">
                      <span className="font-medium">Production:</span> {casting.production_house_name}
                    </p>
                    <p className="text-sm text-muted-foreground mb-1">
                      <span className="font-medium">Role:</span> {casting.role}
                    </p>
                    {casting.location && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Location:</span> {casting.location}
                      </p>
                    )}
                  </div>
                  <Badge className={status.className}>{status.text}</Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6 py-4 border-y border-border">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Gender</p>
                    <p className="text-sm font-semibold text-card-foreground">{casting.gender || "Any"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Applications</p>
                    <p className="text-2xl font-bold text-card-foreground">{Number(casting.total_applications) || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Posted</p>
                    <p className="text-sm text-card-foreground">
                      {casting.created_at ? new Date(casting.created_at).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>

                {casting.budget_per_day && (
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Budget:</span> ₹{casting.budget_per_day} per day
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCasting(casting)
                      setViewDialogOpen(true)
                    }}
                    className="gap-2 bg-transparent"
                  >
                    <Eye size={16} />
                    View Details
                  </Button>
                  {hasApprovalColumn && !isApproved && (
                    <>
                      <Button onClick={() => approveCasting(casting.id)} className="gap-2 bg-green-600 hover:bg-green-700">
                        <CheckCircle size={16} />
                        Approve
                      </Button>
                      <Button onClick={() => rejectCasting(casting.id)} variant="destructive" className="gap-2">
                        <XCircle size={16} />
                        Reject
                      </Button>
                    </>
                  )}
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setSelectedCasting(casting)
                      setDeleteDialogOpen(true)
                    }}
                    className="gap-2"
                  >
                    <Trash2 size={16} />
                    Delete
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
