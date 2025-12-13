"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Save, AlertCircle, CheckCircle, Settings, CreditCard } from "lucide-react"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    platformName: "CineMarathi",
    supportEmail: "support@cinemarathi.com",
    commissionRate: 15,
    maxFileSize: 100,
    maintenanceMode: false,
    emailNotifications: true,
  })

  const [saved, setSaved] = useState(false)

  const handleChange = (field, value) => {
    setSettings({
      ...settings,
      [field]: value,
    })
    setSaved(false)
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">Manage platform configuration and preferences</p>
      </div>

      {/* General Settings */}
      <Card className="p-4 sm:p-6 bg-white border-0 shadow-xl">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <Settings className="text-white" size={18} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">General Settings</h2>
        </div>
        <div className="space-y-4 sm:space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Platform Name</label>
            <Input
              value={settings.platformName}
              onChange={(e) => handleChange("platformName", e.target.value)}
              className="w-full h-11 border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Support Email</label>
            <Input
              value={settings.supportEmail}
              onChange={(e) => handleChange("supportEmail", e.target.value)}
              type="email"
              className="w-full h-11 border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-all duration-200"
            />
          </div>
        </div>
      </Card>

      {/* Commission Settings */}
      <Card className="p-6 bg-white border-0 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
            <CreditCard className="text-white" size={20} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Commission & Billing</h2>
        </div>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Commission Rate (%)</label>
            <Input
              type="number"
              value={settings.commissionRate}
              onChange={(e) => handleChange("commissionRate", Number.parseFloat(e.target.value))}
              className="w-full h-11 border-2 border-slate-200 focus:border-green-500 focus:ring-green-500 rounded-xl transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Max File Upload Size (MB)</label>
            <Input
              type="number"
              value={settings.maxFileSize}
              onChange={(e) => handleChange("maxFileSize", Number.parseFloat(e.target.value))}
              className="w-full h-11 border-2 border-slate-200 focus:border-green-500 focus:ring-green-500 rounded-xl transition-all duration-200"
            />
          </div>
        </div>
      </Card>

      {/* System Settings */}
      <Card className="p-6 bg-white border-0 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <AlertCircle className="text-white" size={20} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">System Settings</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-5 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border-2 border-red-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <AlertCircle size={24} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Maintenance Mode</p>
                <p className="text-sm text-slate-600">Disable user access temporarily</p>
              </div>
            </div>
            <button
              onClick={() => handleChange("maintenanceMode", !settings.maintenanceMode)}
              className={`relative inline-flex h-9 w-16 items-center rounded-full transition-all duration-300 shadow-lg ${
                settings.maintenanceMode ? "bg-gradient-to-r from-red-500 to-red-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`inline-block h-7 w-7 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                  settings.maintenanceMode ? "translate-x-8" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle size={24} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Email Notifications</p>
                <p className="text-sm text-slate-600">Send notifications to users</p>
              </div>
            </div>
            <button
              onClick={() => handleChange("emailNotifications", !settings.emailNotifications)}
              className={`relative inline-flex h-9 w-16 items-center rounded-full transition-all duration-300 shadow-lg ${
                settings.emailNotifications ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-slate-300"
              }`}
            >
              <span
                className={`inline-block h-7 w-7 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                  settings.emailNotifications ? "translate-x-8" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <Button 
          onClick={handleSave} 
          className="gap-2 h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Save size={18} />
          Save Settings
        </Button>
        {saved && (
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
            <CheckCircle size={18} className="text-green-600" />
            <span className="text-green-700 font-semibold text-sm">Settings saved successfully!</span>
          </div>
        )}
      </div>
    </div>
  )
}




