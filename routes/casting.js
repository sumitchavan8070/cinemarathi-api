const express = require("express")
const { verifyToken } = require("../middleware/auth")
const pool = require("../config/database")

const router = express.Router()

router.post("/calls", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "production_house") {
      return res.status(403).json({ error: "Only production houses can create casting calls" })
    }

    const {
      project_title,
      role,
      gender,
      min_age,
      max_age,
      skills_required,
      location,
      budget_per_day,
      audition_date,
      description,
    } = req.body
    const connection = await pool.getConnection()

    const [result] = await connection.execute(
      "INSERT INTO casting_calls (production_house_id, project_title, role, gender, min_age, max_age, skills_required, location, budget_per_day, audition_date, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        req.user.id,
        project_title,
        role,
        gender,
        min_age,
        max_age,
        skills_required,
        location,
        budget_per_day,
        audition_date,
        description,
      ],
    )

    connection.release()

    res.status(201).json({
      message: "Casting call created",
      castingCallId: result.insertId,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get("/calls", async (req, res) => {
  try {
    const connection = await pool.getConnection()
    const [calls] = await connection.execute(
      "SELECT cc.*, u.name as production_house_name FROM casting_calls cc JOIN users u ON cc.production_house_id = u.id ORDER BY cc.created_at DESC",
    )
    connection.release()

    res.json(calls)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get("/calls/:id", async (req, res) => {
  try {
    const connection = await pool.getConnection()
    const [calls] = await connection.execute(
      "SELECT cc.*, u.name as production_house_name FROM casting_calls cc JOIN users u ON cc.production_house_id = u.id WHERE cc.id = ?",
      [req.params.id],
    )
    connection.release()

    if (calls.length === 0) {
      return res.status(404).json({ error: "Casting call not found" })
    }

    res.json(calls[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post("/apply", verifyToken, async (req, res) => {
  try {
    const { casting_call_id, audition_link } = req.body
    const connection = await pool.getConnection()

    // Check if already applied
    const [existing] = await connection.execute(
      "SELECT id FROM applications WHERE casting_call_id = ? AND applicant_id = ?",
      [casting_call_id, req.user.id],
    )

    if (existing.length > 0) {
      connection.release()
      return res.status(400).json({ error: "Already applied to this casting call" })
    }

    const [result] = await connection.execute(
      "INSERT INTO applications (casting_call_id, applicant_id, audition_link) VALUES (?, ?, ?)",
      [casting_call_id, req.user.id, audition_link || null],
    )

    connection.release()

    res.status(201).json({
      message: "Application submitted",
      applicationId: result.insertId,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get("/applications/my", verifyToken, async (req, res) => {
  try {
    const connection = await pool.getConnection()
    const [applications] = await connection.execute(
      "SELECT a.*, cc.project_title, cc.role, u.name as production_house FROM applications a JOIN casting_calls cc ON a.casting_call_id = cc.id JOIN users u ON cc.production_house_id = u.id WHERE a.applicant_id = ?",
      [req.user.id],
    )
    connection.release()

    res.json(applications)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put("/applications/:id/status", verifyToken, async (req, res) => {
  try {
    const { status } = req.body
    const validStatuses = ["applied", "shortlisted", "selected", "rejected"]

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" })
    }

    const connection = await pool.getConnection()

    // Verify ownership
    const [app] = await connection.execute(
      "SELECT cc.production_house_id FROM applications a JOIN casting_calls cc ON a.casting_call_id = cc.id WHERE a.id = ?",
      [req.params.id],
    )

    if (app.length === 0 || app[0].production_house_id !== req.user.id) {
      connection.release()
      return res.status(403).json({ error: "Not authorized" })
    }

    await connection.execute("UPDATE applications SET status = ? WHERE id = ?", [status, req.params.id])

    connection.release()

    res.json({ message: "Application status updated" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
