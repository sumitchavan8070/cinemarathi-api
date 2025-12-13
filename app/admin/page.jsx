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
        <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
            <h1 style={{color: 'red'}}>DEPLOY TEST 13-DEC</h1>

              <p className="text-sm text-blue-100 mb-2 font-medium">Total Users</p>
              <h3 className="text-4xl font-bold mb-1">{stats.totalUsers}</h3>
              <p className="text-xs text-blue-100 flex items-center gap-1">
                <TrendingUp size={14} />
                +12% this month
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Users className="text-white" size={32} />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-100 mb-2 font-medium">Active Listings</p>
              <h3 className="text-4xl font-bold mb-1">{stats.activeListings}</h3>
              <p className="text-xs text-purple-100 flex items-center gap-1">
                <TrendingUp size={14} />
                +8% this week
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Film className="text-white" size={32} />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-100 mb-2 font-medium">Total Revenue</p>
              <h3 className="text-4xl font-bold mb-1">
                ₹{stats.totalRevenue >= 1000 ? (stats.totalRevenue / 1000).toFixed(0) + 'K' : stats.totalRevenue}
              </h3>
              <p className="text-xs text-green-100 flex items-center gap-1">
                <TrendingUp size={14} />
                +15% this month
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <CreditCard className="text-white" size={32} />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-100 mb-2 font-medium">Growth Rate</p>
              <h3 className="text-4xl font-bold mb-1">{stats.growthRate}%</h3>
              <p className="text-xs text-orange-100 flex items-center gap-1">
                <TrendingUp size={14} />
                vs last quarter
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <TrendingUp className="text-white" size={32} />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <Card className="col-span-2 p-6 bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">User Growth & Revenue</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm text-slate-600">Users</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-slate-600">Revenue</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis yAxisId="left" stroke="#64748b" />
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }} 
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={3} dot={{ fill: '#22c55e', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie Chart */}
        <Card className="p-6 bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
          <h3 className="text-xl font-bold text-slate-900 mb-6">User Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Bar Chart */}
      <Card className="p-6 bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Monthly Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }} 
            />
            <Legend />
            <Bar dataKey="users" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            <Bar dataKey="revenue" fill="#22c55e" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}




