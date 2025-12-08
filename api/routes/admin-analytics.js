const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { verifyToken: authenticateToken, isAdmin } = require('../../middleware/auth');

router.get('/stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    const connection = await db.getConnection();
    
    const [[{ total_users }]] = await connection.execute('SELECT COUNT(*) as total_users FROM users');
    
    // Try to get actor count (table might not exist)
    let total_actors = 0;
    try {
      const [[{ total_actors: actors }]] = await connection.execute('SELECT COUNT(*) as total_actors FROM actors');
      total_actors = actors;
    } catch (err) {
      // Actors table might not exist
    }
    
    let total_technicians = 0;
    try {
      const [[{ total_technicians: techs }]] = await connection.execute('SELECT COUNT(*) as total_technicians FROM technicians');
      total_technicians = techs;
    } catch (err) {
      // Technicians table might not exist
    }
    
    let total_prod_houses = 0;
    try {
      const [[{ total_prod_houses: prod }]] = await connection.execute('SELECT COUNT(*) as total_prod_houses FROM production_houses');
      total_prod_houses = prod;
    } catch (err) {
      // Production houses table might not exist
    }
    
    const [[{ active_casting_calls }]] = await connection.execute('SELECT COUNT(*) as active_casting_calls FROM casting_calls WHERE audition_date >= CURDATE() OR audition_date IS NULL');
    
    let total_applications = 0;
    try {
      const [[{ total_applications: apps }]] = await connection.execute('SELECT COUNT(*) as total_applications FROM applications');
      total_applications = apps;
    } catch (err) {
      // Applications table might not exist
    }
    
    let total_subscriptions = 0;
    let active_subscriptions = 0;
    try {
      const [[{ total_subscriptions: subs }]] = await connection.execute('SELECT COUNT(*) as total_subscriptions FROM user_subscriptions WHERE is_active = 1');
      total_subscriptions = subs;
      const [[{ active_subscriptions: active }]] = await connection.execute('SELECT COUNT(*) as active_subscriptions FROM user_subscriptions WHERE is_active = 1 AND (end_date >= CURDATE() OR end_date IS NULL)');
      active_subscriptions = active;
    } catch (err) {
      // Subscriptions table might not exist
    }

    connection.release();

    res.json({
      total_users,
      total_actors,
      total_technicians,
      total_prod_houses,
      active_casting_calls,
      total_applications,
      total_subscriptions,
      active_subscriptions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/trends/registrations', authenticateToken, isAdmin, async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [data] = await connection.execute(`
      SELECT DATE(created_at) as date, user_type as role, COUNT(*) as count
      FROM users
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at), user_type
      ORDER BY DATE(created_at) ASC
    `);
    connection.release();

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/analytics/revenue', authenticateToken, isAdmin, async (req, res) => {
  try {
    const connection = await db.getConnection();
    
    let subscriptionRevenue = [];
    let totalRevenue = 0;
    
    try {
      [subscriptionRevenue] = await connection.execute(`
        SELECT pp.name, COUNT(us.id) as count, pp.price, (COUNT(us.id) * pp.price) as total_revenue
        FROM user_subscriptions us
        LEFT JOIN premium_plans pp ON us.plan_id = pp.id
        WHERE us.is_active = 1
        GROUP BY us.plan_id
      `);

      const [[{ totalRevenue: rev }]] = await connection.execute(`
        SELECT COALESCE(SUM(pp.price), 0) as totalRevenue
        FROM user_subscriptions us
        LEFT JOIN premium_plans pp ON us.plan_id = pp.id
        WHERE us.is_active = 1
      `);
      totalRevenue = Number(rev) || 0;
    } catch (err) {
      // Tables might not exist
    }
    
    connection.release();

    res.json({
      by_plan: subscriptionRevenue,
      total_revenue: totalRevenue
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/analytics/active-users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [activeUsers] = await connection.execute(`
      SELECT u.id, u.name, u.user_type as role, 
             COUNT(DISTINCT a.id) as applications
      FROM users u
      LEFT JOIN applications a ON u.id = a.applicant_id
      GROUP BY u.id
      ORDER BY COUNT(DISTINCT a.id) DESC
      LIMIT 20
    `);
    connection.release();

    res.json(activeUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/overview', authenticateToken, isAdmin, async (req, res) => {
  try {
    const connection = await db.getConnection();
    
    // Get basic stats
    const [[{ total_users }]] = await connection.execute('SELECT COUNT(*) as total_users FROM users');
    const [[{ active_casting_calls }]] = await connection.execute('SELECT COUNT(*) as active_casting_calls FROM casting_calls WHERE audition_date >= CURDATE() OR audition_date IS NULL');
    
    // Get total revenue from active subscriptions
    let total_revenue = 0;
    try {
      const [[{ total_revenue: rev }]] = await connection.execute(`
        SELECT COALESCE(SUM(pp.price), 0) as total_revenue
        FROM user_subscriptions us
        LEFT JOIN premium_plans pp ON us.plan_id = pp.id
        WHERE us.is_active = 1 AND (us.end_date >= CURDATE() OR us.end_date IS NULL)
      `);
      total_revenue = Number(rev) || 0;
    } catch (err) {
      // If premium_plans table doesn't exist, revenue is 0
      total_revenue = 0;
    }

    // Calculate growth rate (users this month vs last month)
    const [[{ count: this_month }]] = await connection.execute(`
      SELECT COUNT(*) as count FROM users 
      WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())
    `);
    const [[{ count: last_month }]] = await connection.execute(`
      SELECT COUNT(*) as count FROM users 
      WHERE MONTH(created_at) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) 
      AND YEAR(created_at) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
    `);
    const growthRate = last_month > 0 
      ? Math.round(((this_month - last_month) / last_month) * 100)
      : (this_month > 0 ? 100 : 0);

    // Get user distribution by type
    const [userDistribution] = await connection.execute(`
      SELECT user_type, COUNT(*) as count
      FROM users
      GROUP BY user_type
    `);

    // Convert to pie chart format
    const pieData = userDistribution.map((item) => ({
      name: item.user_type ? (item.user_type.charAt(0).toUpperCase() + item.user_type.slice(1).replace('_', ' ')) : 'Unknown',
      value: item.count
    }));

    // Get monthly user growth data (last 6 months)
    const [monthlyData] = await connection.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%b') as month,
        COUNT(*) as users
      FROM users
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m'), DATE_FORMAT(created_at, '%b')
      ORDER BY DATE_FORMAT(created_at, '%Y-%m') ASC
    `);

    // Get monthly revenue data
    let revenueData = [];
    try {
      [revenueData] = await connection.execute(`
        SELECT 
          DATE_FORMAT(us.start_date, '%b') as month,
          COALESCE(SUM(pp.price), 0) as revenue
        FROM user_subscriptions us
        LEFT JOIN premium_plans pp ON us.plan_id = pp.id
        WHERE us.start_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(us.start_date, '%Y-%m'), DATE_FORMAT(us.start_date, '%b')
        ORDER BY DATE_FORMAT(us.start_date, '%Y-%m') ASC
      `);
    } catch (err) {
      // If tables don't exist, use empty array
      revenueData = [];
    }

    connection.release();

    // Combine monthly data
    const chartData = monthlyData.map((item) => {
      const revenue = revenueData.find((r) => r.month === item.month);
      return {
        name: item.month,
        users: item.users,
        revenue: Number(revenue?.revenue) || 0
      };
    });

    // If no data, provide default structure
    if (chartData.length === 0) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      months.forEach(month => {
        chartData.push({ name: month, users: 0, revenue: 0 });
      });
    }

    res.json({
      stats: {
        totalUsers: total_users || 0,
        activeListings: active_casting_calls || 0,
        totalRevenue: total_revenue,
        growthRate: growthRate
      },
      chartData: chartData,
      pieData: pieData.length > 0 ? pieData : [
        { name: "Actors", value: 0 },
        { name: "Technicians", value: 0 },
        { name: "Production Houses", value: 0 }
      ]
    });
  } catch (error) {
    console.error('[Admin Analytics] Overview error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
