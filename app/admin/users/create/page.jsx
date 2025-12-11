"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, UserPlus, Crown } from "lucide-react"

export default function CreateUserPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    user_type: "",
    gender: "",
    dob: "",
    location: "",
    contact: "",
    bio: "",
    portfolio_url: "",
    availability: "",
    is_verified: false,
    is_premium: false,
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        router.push("/admin/users")
      } else {
        setError(data.error || "Failed to create user")
      }
    } catch (err) {
      setError("Error creating user. Please try again.")
      console.error("[Create User] Error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/users")}
          className="gap-2"
        >
          <ArrowLeft size={16} />
          Back to Users
        </Button>
        <h1 className="text-3xl font-bold text-card-foreground">Create New User</h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter full name"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="user@example.com"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="Minimum 6 characters"
              />
            </div>

            {/* User Type */}
            <div className="space-y-2">
              <Label htmlFor="user_type">
                User Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.user_type}
                onValueChange={(value) => handleSelectChange("user_type", value)}
                required
              >
                <SelectTrigger id="user_type">
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="actor">Actor</SelectItem>
                  <SelectItem value="technician">Technician</SelectItem>
                  <SelectItem value="production_house">Production House</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleSelectChange("gender", value)}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleChange}
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, State"
              />
            </div>

            {/* Contact */}
            <div className="space-y-2">
              <Label htmlFor="contact">Contact Number</Label>
              <Input
                id="contact"
                name="contact"
                type="tel"
                value={formData.contact}
                onChange={handleChange}
                placeholder="+91 1234567890"
              />
            </div>

            {/* Portfolio URL */}
            <div className="space-y-2">
              <Label htmlFor="portfolio_url">Portfolio URL</Label>
              <Input
                id="portfolio_url"
                name="portfolio_url"
                type="url"
                value={formData.portfolio_url}
                onChange={handleChange}
                placeholder="https://example.com/portfolio"
              />
            </div>

            {/* Availability */}
            <div className="space-y-2">
              <Label htmlFor="availability">Availability</Label>
              <Input
                id="availability"
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                placeholder="Available / Busy / Not Available"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              placeholder="Enter user bio or description"
            />
          </div>

          {/* Is Verified */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_verified"
              checked={formData.is_verified}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, is_verified: e.target.checked }))
              }
              className="rounded border-gray-300"
            />
            <Label htmlFor="is_verified" className="cursor-pointer">
              Mark user as verified
            </Label>
          </div>

          {/* Is Premium */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_premium"
                checked={formData.is_premium}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, is_premium: e.target.checked }))
                }
                className="rounded border-gray-300"
              />
              <Label htmlFor="is_premium" className="cursor-pointer flex items-center gap-2">
                <Crown className="text-yellow-600" size={18} />
                <span className="font-medium">Set as Premium User (Lifetime Premium)</span>
              </Label>
            </div>
            {formData.is_premium && (
              <p className="text-xs text-muted-foreground mt-2 ml-6">
                User will be assigned lifetime premium access upon creation
              </p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading} className="gap-2">
              <UserPlus size={16} />
              {loading ? "Creating..." : "Create User"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/users")}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

