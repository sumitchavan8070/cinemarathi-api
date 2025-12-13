"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Users, Film, CreditCard, TrendingUp } from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import { apiGet } from "@/lib/api"
import { getAdminToken } from "@/lib/admin-auth"

export default function AdminDashboard() {
  const { user, loading: authLoading, isAuthenticated } = useAdminAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeListings: 0,
    totalRevenue: 0,
    growthRate: 0,
  })
  const [chartData, setChartData] = useState([])
  const [pieData, setPieData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || authLoading) return

    const fetchAnalytics = async () => {
      try {
        const token = getAdminToken()
        const data = await apiGet("/admin/analytics/overview", { token })
        setStats(data.stats)
        setChartData(data.chartData)
        setPieData(data.pieData)
      } catch (error) {
        console.error("[v0] Analytics fetch error:", error)
        // Set default empty data
        setStats({
          totalUsers: 0,
          activeListings: 0,
          totalRevenue: 0,
          growthRate: 0,
        })
        setChartData([
          { name: "Jan", users: 0, revenue: 0 },
          { name: "Feb", users: 0, revenue: 0 },
          { name: "Mar", users: 0, revenue: 0 },
          { name: "Apr", users: 0, revenue: 0 },
          { name: "May", users: 0, revenue: 0 },
          { name: "Jun", users: 0, revenue: 0 },
        ])
        setPieData([
          { name: "Actors", value: 0 },
          { name: "Technicians", value: 0 },
          { name: "Production Houses", value: 0 },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [isAuthenticated, authLoading])

  const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e"]

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-card border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Users</p>
              <h3 className="text-3xl font-bold text-card-foreground">{stats.totalUsers}</h3>
              <p className="text-xs text-green-600 mt-2">+12% this month</p>
            </div>
            <Users className="text-primary" size={40} />
          </div>
        </Card>

        <Card className="p-6 bg-card border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Active Listings</p>
              <h3 className="text-3xl font-bold text-card-foreground">{stats.activeListings}</h3>
              <p className="text-xs text-green-600 mt-2">+8% this week</p>
            </div>
            <Film className="text-primary" size={40} />
          </div>
        </Card>

        <Card className="p-6 bg-card border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Revenue</p>
              <h3 className="text-3xl font-bold text-card-foreground">
                ₹{stats.totalRevenue >= 1000 ? (stats.totalRevenue / 1000).toFixed(0) + 'K' : stats.totalRevenue}
              </h3>
              <p className="text-xs text-green-600 mt-2">+15% this month</p>
            </div>
            <CreditCard className="text-primary" size={40} />
          </div>
        </Card>

        <Card className="p-6 bg-card border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Growth Rate</p>
              <h3 className="text-3xl font-bold text-card-foreground">{stats.growthRate}%</h3>
              <p className="text-xs text-green-600 mt-2">vs last quarter</p>
            </div>
            <TrendingUp className="text-primary" size={40} />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <Card className="col-span-2 p-6 bg-card border border-border">
          <h3 className="text-lg font-semibold mb-4 text-card-foreground">User Growth & Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="users" stroke="#ef4444" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie Chart */}
        <Card className="p-6 bg-card border border-border">
          <h3 className="text-lg font-semibold mb-4 text-card-foreground">User Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Bar Chart */}
      <Card className="p-6 bg-card border border-border">
        <h3 className="text-lg font-semibold mb-4 text-card-foreground">Monthly Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="users" fill="#ef4444" />
            <Bar dataKey="revenue" fill="#22c55e" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}




