"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Save, AlertCircle, CheckCircle } from "lucide-react"

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
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold text-card-foreground">Settings</h1>

      {/* General Settings */}
      <Card className="p-6 bg-card border border-border">
        <h2 className="text-xl font-semibold mb-6 text-card-foreground">General Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">Platform Name</label>
            <Input
              value={settings.platformName}
              onChange={(e) => handleChange("platformName", e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">Support Email</label>
            <Input
              value={settings.supportEmail}
              onChange={(e) => handleChange("supportEmail", e.target.value)}
              type="email"
              className="w-full"
            />
          </div>
        </div>
      </Card>

      {/* Commission Settings */}
      <Card className="p-6 bg-card border border-border">
        <h2 className="text-xl font-semibold mb-6 text-card-foreground">Commission & Billing</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">Commission Rate (%)</label>
            <Input
              type="number"
              value={settings.commissionRate}
              onChange={(e) => handleChange("commissionRate", Number.parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">Max File Upload Size (MB)</label>
            <Input
              type="number"
              value={settings.maxFileSize}
              onChange={(e) => handleChange("maxFileSize", Number.parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </Card>

      {/* System Settings */}
      <Card className="p-6 bg-card border border-border">
        <h2 className="text-xl font-semibold mb-6 text-card-foreground">System Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-yellow-600" />
              <div>
                <p className="font-medium text-card-foreground">Maintenance Mode</p>
                <p className="text-sm text-muted-foreground">Disable user access temporarily</p>
              </div>
            </div>
            <button
              onClick={() => handleChange("maintenanceMode", !settings.maintenanceMode)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                settings.maintenanceMode ? "bg-red-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  settings.maintenanceMode ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium text-card-foreground">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Send notifications to users</p>
            </div>
            <button
              onClick={() => handleChange("emailNotifications", !settings.emailNotifications)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                settings.emailNotifications ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  settings.emailNotifications ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex gap-4">
        <Button onClick={handleSave} className="gap-2 bg-green-600 hover:bg-green-700">
          <Save size={18} />
          Save Settings
        </Button>
        {saved && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle size={16} />
            Settings saved successfully!
          </div>
        )}
      </div>
    </div>
  )
}




