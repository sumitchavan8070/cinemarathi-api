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
import { apiPost } from "@/lib/api"
import { getAdminToken } from "@/lib/admin-auth"

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
      const token = getAdminToken()
      await apiPost("/admin/users", formData, { token })
      router.push("/admin/users")
    } catch (err) {
      setError(err.message || "Error creating user. Please try again.")
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
          className="gap-2 hover:bg-slate-100 rounded-xl transition-all duration-200"
        >
          <ArrowLeft size={16} />
          Back to Users
        </Button>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Create New User
          </h1>
          <p className="text-slate-500 mt-1">Add a new user to the platform</p>
        </div>
      </div>

      <Card className="p-8 bg-white border-0 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl">
              <p className="text-sm font-semibold text-red-700">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-slate-700">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter full name"
                className="h-11 border-2 border-slate-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl transition-all duration-200"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="user@example.com"
                className="h-11 border-2 border-slate-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl transition-all duration-200"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                Password <span className="text-red-500">*</span>
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
                className="h-11 border-2 border-slate-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl transition-all duration-200"
              />
            </div>

            {/* User Type */}
            <div className="space-y-2">
              <Label htmlFor="user_type" className="text-sm font-semibold text-slate-700">
                User Type <span className="text-red-500">*</span>
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
              <Label htmlFor="gender" className="text-sm font-semibold text-slate-700">Gender</Label>
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
              <Label htmlFor="dob" className="text-sm font-semibold text-slate-700">Date of Birth</Label>
              <Input
                id="dob"
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleChange}
                className="h-11 border-2 border-slate-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl transition-all duration-200"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-semibold text-slate-700">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, State"
                className="h-11 border-2 border-slate-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl transition-all duration-200"
              />
            </div>

            {/* Contact */}
            <div className="space-y-2">
              <Label htmlFor="contact" className="text-sm font-semibold text-slate-700">Contact Number</Label>
              <Input
                id="contact"
                name="contact"
                type="tel"
                value={formData.contact}
                onChange={handleChange}
                placeholder="+91 1234567890"
                className="h-11 border-2 border-slate-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl transition-all duration-200"
              />
            </div>

            {/* Portfolio URL */}
            <div className="space-y-2">
              <Label htmlFor="portfolio_url" className="text-sm font-semibold text-slate-700">Portfolio URL</Label>
              <Input
                id="portfolio_url"
                name="portfolio_url"
                type="url"
                value={formData.portfolio_url}
                onChange={handleChange}
                placeholder="https://example.com/portfolio"
                className="h-11 border-2 border-slate-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl transition-all duration-200"
              />
            </div>

            {/* Availability */}
            <div className="space-y-2">
              <Label htmlFor="availability" className="text-sm font-semibold text-slate-700">Availability</Label>
              <Input
                id="availability"
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                placeholder="Available / Busy / Not Available"
                className="h-11 border-2 border-slate-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl transition-all duration-200"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm font-semibold text-slate-700">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              placeholder="Enter user bio or description"
              className="border-2 border-slate-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl transition-all duration-200"
            />
          </div>

          {/* Is Verified */}
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-100">
            <input
              type="checkbox"
              id="is_verified"
              checked={formData.is_verified}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, is_verified: e.target.checked }))
              }
              className="w-5 h-5 rounded border-2 border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
            />
            <Label htmlFor="is_verified" className="cursor-pointer text-sm font-semibold text-slate-700">
              Mark user as verified
            </Label>
          </div>

          {/* Is Premium */}
          <div className="p-5 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="is_premium"
                checked={formData.is_premium}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, is_premium: e.target.checked }))
                }
                className="w-5 h-5 rounded border-2 border-slate-300 text-yellow-600 focus:ring-yellow-500 cursor-pointer"
              />
              <Label htmlFor="is_premium" className="cursor-pointer flex items-center gap-2">
                <Crown className="text-yellow-600" size={20} />
                <span className="font-bold text-slate-900">Set as Premium User (Lifetime Premium)</span>
              </Label>
            </div>
            {formData.is_premium && (
              <p className="text-sm text-slate-600 mt-3 ml-8 font-medium">
                User will be assigned lifetime premium access upon creation
              </p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6 border-t border-slate-200">
            <Button 
              type="submit" 
              disabled={loading} 
              className="gap-2 h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              <UserPlus size={18} />
              {loading ? "Creating..." : "Create User"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/users")}
              disabled={loading}
              className="h-12 border-2 border-slate-300 hover:bg-slate-50 rounded-xl transition-all duration-200"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

