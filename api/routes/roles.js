const express = require("express")
const { verifyToken, isAdmin } = require("../../middleware/auth")
const pool = require("../../config/database")

const router = express.Router()

/**
 * @route   GET /api/roles
 * @desc    Get all roles (with optional filters)
 * @access  Admin only
 */
router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const { is_active, search } = req.query
    const connection = await pool.getConnection()

    let query = `
      SELECT 
        id,
        name,
        slug,
        description,
        permissions,
        is_active,
        is_system,
        created_at,
        updated_at,
        (SELECT COUNT(*) FROM users WHERE role_id = roles.id) as user_count
      FROM roles
      WHERE 1=1
    `
    const params = []

    // Filter by active status
    if (is_active !== undefined) {
      query += " AND is_active = ?"
      params.push(is_active === "true" || is_active === 1 ? 1 : 0)
    }

    // Search by name or slug
    if (search && search.trim() !== "") {
      query += " AND (name LIKE ? OR slug LIKE ? OR description LIKE ?)"
      const searchTerm = `%${search.trim()}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }

    query += " ORDER BY is_system DESC, name ASC"

    const [roles] = await connection.execute(query, params)
    connection.release()

    // Parse JSON permissions if they exist
    const formattedRoles = roles.map((role) => ({
      ...role,
      permissions: role.permissions
        ? typeof role.permissions === "string"
          ? JSON.parse(role.permissions)
          : role.permissions
        : [],
      user_count: parseInt(role.user_count) || 0,
    }))

    res.json({
      status: true,
      message: "Roles fetched successfully",
      roles: formattedRoles,
      total: formattedRoles.length,
    })
  } catch (error) {
    console.error("[Roles API] Error:", error)
    res.status(500).json({
      status: false,
      error: error.message,
    })
  }
})

/**
 * @route   GET /api/roles/:id
 * @desc    Get a single role by ID
 * @access  Admin only
 */
router.get("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const connection = await pool.getConnection()

    const [roles] = await connection.execute(
      `SELECT 
        id,
        name,
        slug,
        description,
        permissions,
        is_active,
        is_system,
        created_at,
        updated_at,
        (SELECT COUNT(*) FROM users WHERE role_id = ?) as user_count
      FROM roles
      WHERE id = ?`,
      [id, id]
    )

    connection.release()

    if (roles.length === 0) {
      return res.status(404).json({
        status: false,
        error: "Role not found",
      })
    }

    const role = roles[0]
    const formattedRole = {
      ...role,
      permissions: role.permissions
        ? typeof role.permissions === "string"
          ? JSON.parse(role.permissions)
          : role.permissions
        : [],
      user_count: parseInt(role.user_count) || 0,
    }

    res.json({
      status: true,
      message: "Role fetched successfully",
      role: formattedRole,
    })
  } catch (error) {
    console.error("[Roles API] Error:", error)
    res.status(500).json({
      status: false,
      error: error.message,
    })
  }
})

/**
 * @route   POST /api/roles
 * @desc    Create a new role
 * @access  Admin only
 */
router.post("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, slug, description, permissions, is_active } = req.body

    // Validation
    if (!name || !slug) {
      return res.status(400).json({
        status: false,
        error: "Name and slug are required",
      })
    }

    // Validate slug format (alphanumeric, hyphens, underscores only)
    if (!/^[a-z0-9_-]+$/.test(slug)) {
      return res.status(400).json({
        status: false,
        error: "Slug must contain only lowercase letters, numbers, hyphens, and underscores",
      })
    }

    const connection = await pool.getConnection()

    // Check if slug already exists
    const [existing] = await connection.execute(
      "SELECT id FROM roles WHERE slug = ?",
      [slug]
    )

    if (existing.length > 0) {
      connection.release()
      return res.status(400).json({
        status: false,
        error: "Role with this slug already exists",
      })
    }

    // Prepare permissions (should be JSON array)
    let permissionsValue = null
    if (permissions) {
      if (Array.isArray(permissions)) {
        permissionsValue = JSON.stringify(permissions)
      } else if (typeof permissions === "string") {
        // Try to parse it
        try {
          JSON.parse(permissions)
          permissionsValue = permissions
        } catch {
          return res.status(400).json({
            status: false,
            error: "Permissions must be a valid JSON array",
          })
        }
      }
    }

    // Insert new role
    const [result] = await connection.execute(
      `INSERT INTO roles (name, slug, description, permissions, is_active, is_system)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [
        name.trim(),
        slug.trim().toLowerCase(),
        description || null,
        permissionsValue,
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
      ]
    )

    // Fetch the created role
    const [newRole] = await connection.execute(
      "SELECT * FROM roles WHERE id = ?",
      [result.insertId]
    )

    connection.release()

    const formattedRole = {
      ...newRole[0],
      permissions: newRole[0].permissions
        ? typeof newRole[0].permissions === "string"
          ? JSON.parse(newRole[0].permissions)
          : newRole[0].permissions
        : [],
    }

    res.status(201).json({
      status: true,
      message: "Role created successfully",
      role: formattedRole,
    })
  } catch (error) {
    console.error("[Roles API] Error:", error)
    
    // Handle duplicate entry error
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        status: false,
        error: "Role with this name or slug already exists",
      })
    }

    res.status(500).json({
      status: false,
      error: error.message,
    })
  }
})

/**
 * @route   PUT /api/roles/:id
 * @desc    Update a role
 * @access  Admin only
 */
router.put("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { name, slug, description, permissions, is_active } = req.body

    const connection = await pool.getConnection()

    // Check if role exists
    const [existing] = await connection.execute(
      "SELECT id, is_system FROM roles WHERE id = ?",
      [id]
    )

    if (existing.length === 0) {
      connection.release()
      return res.status(404).json({
        status: false,
        error: "Role not found",
      })
    }

    // System roles cannot have their name or slug changed
    if (existing[0].is_system === 1 && (name || slug)) {
      connection.release()
      return res.status(403).json({
        status: false,
        error: "Cannot modify name or slug of system roles",
      })
    }

    // Build update query dynamically
    const updates = []
    const params = []

    if (name !== undefined) {
      updates.push("name = ?")
      params.push(name.trim())
    }

    if (slug !== undefined) {
      // Validate slug format
      if (!/^[a-z0-9_-]+$/.test(slug)) {
        connection.release()
        return res.status(400).json({
          status: false,
          error: "Slug must contain only lowercase letters, numbers, hyphens, and underscores",
        })
      }

      // Check if slug is already taken by another role
      const [slugCheck] = await connection.execute(
        "SELECT id FROM roles WHERE slug = ? AND id != ?",
        [slug.trim().toLowerCase(), id]
      )

      if (slugCheck.length > 0) {
        connection.release()
        return res.status(400).json({
          status: false,
          error: "Role with this slug already exists",
        })
      }

      updates.push("slug = ?")
      params.push(slug.trim().toLowerCase())
    }

    if (description !== undefined) {
      updates.push("description = ?")
      params.push(description || null)
    }

    if (permissions !== undefined) {
      let permissionsValue = null
      if (permissions) {
        if (Array.isArray(permissions)) {
          permissionsValue = JSON.stringify(permissions)
        } else if (typeof permissions === "string") {
          try {
            JSON.parse(permissions)
            permissionsValue = permissions
          } catch {
            connection.release()
            return res.status(400).json({
              status: false,
              error: "Permissions must be a valid JSON array",
            })
          }
        }
      }
      updates.push("permissions = ?")
      params.push(permissionsValue)
    }

    if (is_active !== undefined) {
      // System roles cannot be deactivated
      if (existing[0].is_system === 1 && is_active === false) {
        connection.release()
        return res.status(403).json({
          status: false,
          error: "Cannot deactivate system roles",
        })
      }
      updates.push("is_active = ?")
      params.push(is_active ? 1 : 0)
    }

    if (updates.length === 0) {
      connection.release()
      return res.status(400).json({
        status: false,
        error: "No fields to update",
      })
    }

    params.push(id)

    await connection.execute(
      `UPDATE roles SET ${updates.join(", ")} WHERE id = ?`,
      params
    )

    // Fetch updated role
    const [updated] = await connection.execute(
      "SELECT * FROM roles WHERE id = ?",
      [id]
    )

    connection.release()

    const formattedRole = {
      ...updated[0],
      permissions: updated[0].permissions
        ? typeof updated[0].permissions === "string"
          ? JSON.parse(updated[0].permissions)
          : updated[0].permissions
        : [],
    }

    res.json({
      status: true,
      message: "Role updated successfully",
      role: formattedRole,
    })
  } catch (error) {
    console.error("[Roles API] Error:", error)
    
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        status: false,
        error: "Role with this name or slug already exists",
      })
    }

    res.status(500).json({
      status: false,
      error: error.message,
    })
  }
})

/**
 * @route   DELETE /api/roles/:id
 * @desc    Delete a role (system roles cannot be deleted)
 * @access  Admin only
 */
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const connection = await pool.getConnection()

    // Check if role exists and is not a system role
    const [existing] = await connection.execute(
      "SELECT id, is_system, name FROM roles WHERE id = ?",
      [id]
    )

    if (existing.length === 0) {
      connection.release()
      return res.status(404).json({
        status: false,
        error: "Role not found",
      })
    }

    if (existing[0].is_system === 1) {
      connection.release()
      return res.status(403).json({
        status: false,
        error: "Cannot delete system roles",
      })
    }

    // Check if any users are using this role
    const [users] = await connection.execute(
      "SELECT COUNT(*) as count FROM users WHERE role_id = ?",
      [id]
    )

    if (users[0].count > 0) {
      connection.release()
      return res.status(400).json({
        status: false,
        error: `Cannot delete role. ${users[0].count} user(s) are currently assigned this role. Please reassign them first.`,
        user_count: users[0].count,
      })
    }

    // Delete the role
    await connection.execute("DELETE FROM roles WHERE id = ?", [id])
    connection.release()

    res.json({
      status: true,
      message: "Role deleted successfully",
    })
  } catch (error) {
    console.error("[Roles API] Error:", error)
    res.status(500).json({
      status: false,
      error: error.message,
    })
  }
})

/**
 * @route   GET /api/roles/:id/users
 * @desc    Get all users with a specific role
 * @access  Admin only
 */
router.get("/:id/users", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { page = 1, limit = 20 } = req.query
    const pageNum = parseInt(page) || 1
    const limitNum = parseInt(limit) || 20
    const offset = (pageNum - 1) * limitNum

    const connection = await pool.getConnection()

    // Check if role exists
    const [role] = await connection.execute(
      "SELECT id, name FROM roles WHERE id = ?",
      [id]
    )

    if (role.length === 0) {
      connection.release()
      return res.status(404).json({
        status: false,
        error: "Role not found",
      })
    }

    // Get total count
    const [countResult] = await connection.execute(
      "SELECT COUNT(*) as total FROM users WHERE role_id = ?",
      [id]
    )
    const total = countResult[0].total

    // Get users with pagination
    const [users] = await connection.execute(
      `SELECT 
        id,
        name,
        email,
        contact,
        user_type,
        role_id,
        is_verified,
        created_at
      FROM users
      WHERE role_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?`,
      [id, limitNum, offset]
    )

    connection.release()

    res.json({
      status: true,
      message: "Users fetched successfully",
      role: {
        id: role[0].id,
        name: role[0].name,
      },
      users: users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: total,
        total_pages: Math.ceil(total / limitNum),
      },
    })
  } catch (error) {
    console.error("[Roles API] Error:", error)
    res.status(500).json({
      status: false,
      error: error.message,
    })
  }
})

/**
 * @route   PUT /api/roles/assign
 * @desc    Assign/update role for a user
 * @access  Admin only
 */
router.put("/assign", verifyToken, isAdmin, async (req, res) => {
  try {
    const { user_id, role_id } = req.body

    if (!user_id || !role_id) {
      return res.status(400).json({
        status: false,
        error: "user_id and role_id are required",
      })
    }

    const connection = await pool.getConnection()

    // Check if user exists
    const [user] = await connection.execute(
      "SELECT id, name, email FROM users WHERE id = ?",
      [user_id]
    )

    if (user.length === 0) {
      connection.release()
      return res.status(404).json({
        status: false,
        error: "User not found",
      })
    }

    // Check if role exists and is active
    const [role] = await connection.execute(
      "SELECT id, name, is_active FROM roles WHERE id = ?",
      [role_id]
    )

    if (role.length === 0) {
      connection.release()
      return res.status(404).json({
        status: false,
        error: "Role not found",
      })
    }

    if (role[0].is_active === 0) {
      connection.release()
      return res.status(400).json({
        status: false,
        error: "Cannot assign inactive role",
      })
    }

    // Update user's role
    await connection.execute("UPDATE users SET role_id = ? WHERE id = ?", [
      role_id,
      user_id,
    ])

    connection.release()

    res.json({
      status: true,
      message: "Role assigned successfully",
      user: {
        id: user[0].id,
        name: user[0].name,
        email: user[0].email,
        role_id: role_id,
        role_name: role[0].name,
      },
    })
  } catch (error) {
    console.error("[Roles API] Error:", error)
    res.status(500).json({
      status: false,
      error: error.message,
    })
  }
})

/**
 * @route   PUT /api/roles/bulk-assign
 * @desc    Assign role to multiple users
 * @access  Admin only
 */
router.put("/bulk-assign", verifyToken, isAdmin, async (req, res) => {
  try {
    const { user_ids, role_id } = req.body

    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return res.status(400).json({
        status: false,
        error: "user_ids must be a non-empty array",
      })
    }

    if (!role_id) {
      return res.status(400).json({
        status: false,
        error: "role_id is required",
      })
    }

    const connection = await pool.getConnection()

    // Check if role exists and is active
    const [role] = await connection.execute(
      "SELECT id, name, is_active FROM roles WHERE id = ?",
      [role_id]
    )

    if (role.length === 0) {
      connection.release()
      return res.status(404).json({
        status: false,
        error: "Role not found",
      })
    }

    if (role[0].is_active === 0) {
      connection.release()
      return res.status(400).json({
        status: false,
        error: "Cannot assign inactive role",
      })
    }

    // Build placeholders for IN clause
    const placeholders = user_ids.map(() => "?").join(",")

    // Update users' roles
    const [result] = await connection.execute(
      `UPDATE users SET role_id = ? WHERE id IN (${placeholders})`,
      [role_id, ...user_ids]
    )

    connection.release()

    res.json({
      status: true,
      message: `Role assigned to ${result.affectedRows} user(s) successfully`,
      affected_rows: result.affectedRows,
      role: {
        id: role[0].id,
        name: role[0].name,
      },
    })
  } catch (error) {
    console.error("[Roles API] Error:", error)
    res.status(500).json({
      status: false,
      error: error.message,
    })
  }
})

module.exports = router







