"use client"

import { useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, CheckCircle, Mail, Lock, FileText, ArrowLeft, Film } from "lucide-react"
import { apiPost } from "@/lib/api"

export default function DeleteAccountPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    reason: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setLoading(true)

    // Validation
    if (!formData.email || !formData.password || !formData.reason) {
      setError("Please fill in all fields")
      setLoading(false)
      return
    }

    if (formData.reason.trim().length < 10) {
      setError("Please provide a detailed reason (at least 10 characters)")
      setLoading(false)
      return
    }

    try {
      await apiPost("/auth/delete-account-request", formData)
      setSuccess(true)
      setFormData({ email: "", password: "", reason: "" })
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 5000)
    } catch (err) {
      setError(err.message || "Error submitting delete account request. Please try again.")
      console.error("[Delete Account] Error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
      {/* Header/Navigation */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200">
                <Film className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  CineMarathi
                </h1>
                <p className="text-xs text-slate-500">Account Management</p>
              </div>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="space-y-6 sm:space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-rose-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <AlertTriangle className="text-white" size={36} />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
              Delete Account Request
            </h1>
            <p className="text-slate-600 mt-3 text-base sm:text-lg max-w-2xl mx-auto">
              Submit a request to delete your account. Our team will review your request and process it accordingly.
            </p>
          </div>

          {/* Warning Card */}
          <Card className="p-5 sm:p-6 lg:p-8 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 shadow-xl">
            <div className="flex items-start gap-4">
              <AlertTriangle className="text-amber-600 flex-shrink-0 mt-1" size={28} />
              <div className="space-y-3">
                <h3 className="font-bold text-amber-900 text-xl">Important Notice</h3>
                <ul className="text-sm sm:text-base text-amber-800 space-y-2 list-disc list-inside">
                  <li>This action will submit a request for account deletion</li>
                  <li>Your account will not be deleted immediately</li>
                  <li>Our team will review your request within 24-48 hours</li>
                  <li>All your data will be permanently removed once approved</li>
                  <li>This action cannot be undone</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Form Card */}
          <Card className="p-5 sm:p-6 lg:p-8 bg-white border-0 shadow-2xl">
            {error && (
              <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="text-red-600 flex-shrink-0" size={22} />
                  <p className="text-sm font-semibold text-red-700">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0" size={22} />
                  <div>
                    <p className="text-sm font-semibold text-green-700">
                      Request submitted successfully!
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Your delete account request has been received. Our team will review it shortly.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Mail size={18} className="text-slate-500" />
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-12 border-2 border-slate-200 focus:border-red-500 focus:ring-red-500 rounded-xl transition-all duration-200 text-base"
                  disabled={loading}
                />
                <p className="text-xs text-slate-500">
                  Enter the email address associated with your account
                </p>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Lock size={18} className="text-slate-500" />
                  Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your account password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="h-12 border-2 border-slate-200 focus:border-red-500 focus:ring-red-500 rounded-xl transition-all duration-200 text-base"
                  disabled={loading}
                />
                <p className="text-xs text-slate-500">
                  Enter your password to verify your identity
                </p>
              </div>

              {/* Reason Field */}
              <div className="space-y-2">
                <Label htmlFor="reason" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <FileText size={18} className="text-slate-500" />
                  Reason for Deletion <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="reason"
                  name="reason"
                  placeholder="Please provide a detailed reason for deleting your account (minimum 10 characters)..."
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="border-2 border-slate-200 focus:border-red-500 focus:ring-red-500 rounded-xl transition-all duration-200 resize-none text-base"
                  disabled={loading}
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    Please provide a detailed explanation for your account deletion request
                  </p>
                  <p className={`text-xs font-medium ${
                    formData.reason.length < 10 
                      ? "text-slate-500" 
                      : formData.reason.length < 50 
                        ? "text-amber-600" 
                        : "text-green-600"
                  }`}>
                    {formData.reason.length} characters
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={loading || !formData.email || !formData.password || formData.reason.trim().length < 10}
                  className="w-full h-14 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-base sm:text-lg rounded-xl shadow-lg hover:shadow-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting Request...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <AlertTriangle size={20} />
                      <span>Submit Delete Account Request</span>
                    </div>
                  )}
                </Button>
              </div>

              {/* Additional Info */}
              <div className="pt-6 border-t border-slate-200">
                <p className="text-xs sm:text-sm text-slate-500 text-center leading-relaxed">
                  By submitting this form, you acknowledge that you understand the consequences of account deletion.
                  If you have any concerns, please contact our support team before submitting this request.
                </p>
              </div>
            </form>
          </Card>

          {/* Footer */}
          <div className="text-center pt-6">
            <p className="text-sm text-slate-500">
              Need help? <Link href="/contact" className="text-purple-600 hover:text-purple-700 font-semibold">Contact Support</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

