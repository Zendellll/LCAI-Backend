const express = require("express");
const router = express.Router();

// Import the pool from index.js
const { pool } = require("../index");

router.post("/", async (req, res) => {
  try {
    const createTableQuery = 'CREATE TABLE IF NOT EXISTS submissions (\n' +
        '  id SERIAL PRIMARY KEY,\n' +
        '  name VARCHAR(100) NOT NULL,\n' +
        '  email VARCHAR(100) NOT NULL,\n' +
        '  message TEXT NOT NULL,\n' +
        '  created_at TIMESTAMP DEFAULT NOW()\n' +
        ');\n'
    const res = await pool.query(createTableQuery);
    console.log("Response for table creation - ", res);
    // 1. Extract form data from req.body
    const { name, email, message } = req.body;

    // 2. Insert into Postgres
    //    Suppose you have a table called "submissions" with columns (id, name, email, message)
    const insertQuery = `
      INSERT INTO submissions (name, email, message)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;

    const result = await pool.query(insertQuery, [name, email, message]);

    // 3. Return the newly inserted row
    return res.status(201).json({
      success: true,
      submission: result.rows[0],
    });
  } catch (error) {
    console.error("Error inserting data:", error);
    return res.status(500).json({
      success: false,
      message: "Error inserting data",
    });
  }
});

module.exports = router;
