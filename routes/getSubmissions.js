// routes/getSubmissions.js
const express = require("express");
const router = express.Router();

// Import the pool from index.js (or wherever it's defined)
const { pool } = require("../index");

/**
 * GET /api/submissions
 * Fetches all rows from the "submissions" table and returns them as JSON
 */
router.get("/", async (req, res) => {
  try {
    const queryText = `SELECT * FROM submissions;`;
    const result = await pool.query(queryText);

    // Send all submissions back as an array of objects
    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching data",
    });
  }
});

module.exports = router;
