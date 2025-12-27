"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Image, Upload, Trash2, Edit2, Loader2 } from "lucide-react"
import { getAdminToken } from "@/lib/admin-auth"
import { apiGet, apiDelete } from "@/lib/api"
import { toast } from "sonner"

export default function BannersPage() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [updating, setUpdating] = useState(null)

  const fetchBanners = async () => {
    try {
      setLoading(true)
      const token = getAdminToken()
      const data = await apiGet("/admin/banners", { token })
      setBanners(data.banners || [])
    } catch (error) {
      console.error("[Banners] Error fetching banners:", error)
      toast.error(error?.message || "Failed to load banners")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBanners()
  }, [])

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB")
      return
    }

    try {
      setUploading(true)
      const token = getAdminToken()
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/admin/banners", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to upload banner")
      }

      toast.success("Banner uploaded successfully")
      await fetchBanners()
      // Reset file input
      e.target.value = ""
    } catch (error) {
      console.error("[Banners] Error uploading:", error)
      toast.error(error?.message || "Failed to upload banner")
    } finally {
      setUploading(false)
    }
  }

  const handleUpdate = async (filename, e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB")
      return
    }

    try {
      setUpdating(filename)
      const token = getAdminToken()
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`/api/admin/banners/${encodeURIComponent(filename)}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update banner")
      }

      toast.success("Banner updated successfully")
      await fetchBanners()
      // Reset file input
      e.target.value = ""
    } catch (error) {
      console.error("[Banners] Error updating:", error)
      toast.error(error?.message || "Failed to update banner")
    } finally {
      setUpdating(null)
    }
  }

  const handleDelete = async (filename) => {
    if (!confirm(`Are you sure you want to delete ${filename}?`)) {
      return
    }

    try {
      setDeleting(filename)
      const token = getAdminToken()
      await apiDelete(`/admin/banners/${encodeURIComponent(filename)}`, { token })
      toast.success("Banner deleted successfully")
      await fetchBanners()
    } catch (error) {
      console.error("[Banners] Error deleting:", error)
      toast.error(error?.message || "Failed to delete banner")
    } finally {
      setDeleting(null)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB"
    return (bytes / (1024 * 1024)).toFixed(2) + " MB"
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
            App Banners
          </h1>
          <p className="text-slate-600 mt-1">Manage banner images for the app</p>
        </div>
        <div className="relative">
          <Button
            onClick={() => document.getElementById("upload-input")?.click()}
            disabled={uploading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Banner
              </>
            )}
          </Button>
          <Input
            id="upload-input"
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Banners Grid */}
      {banners.length === 0 ? (
        <Card className="p-12 text-center">
          <Image className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No banners yet</h3>
          <p className="text-slate-600 mb-4">Upload your first banner image to get started</p>
          <Button
            onClick={() => document.getElementById("upload-input")?.click()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Banner
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <Card key={banner.key} className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative aspect-video bg-slate-100">
                <img
                  src={banner.url}
                  alt={banner.filename}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-slate-900 truncate">{banner.filename}</h3>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  {formatFileSize(banner.size)} • {new Date(banner.lastModified).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById(`update-input-${banner.filename}`)?.click()}
                      disabled={updating === banner.filename}
                      className="w-full"
                    >
                      {updating === banner.filename ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Edit2 className="w-3 h-3 mr-2" />
                          Update
                        </>
                      )}
                    </Button>
                    <Input
                      id={`update-input-${banner.filename}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUpdate(banner.filename, e)}
                      className="hidden"
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(banner.filename)}
                    disabled={deleting === banner.filename}
                  >
                    {deleting === banner.filename ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

