const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { Pool } = require("pg");

require("dotenv").config();

const app = express();

const cookieParser = require("cookie-parser");

// Adding cookie-parser to express
app.use(cookieParser());
//
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:3000", // הכתובת של הלקוח בסביבת פרודקשן
  methods: "GET,POST", // סוגי הבקשות שאתה מאשר
  credentials: true, // מאפשר לשלוח cookies עם הבקשה
};

app.use(cors(corsOptions));
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // If you're using SSL (often required on Render's free tier):
  ssl: {
    rejectUnauthorized: false,
  },
});

// 2. Connect to Postgres (not strictly required every time you query,
//    but doing it once is a good way to verify your credentials)
pool
  .connect()
  .then(() => console.log("Connected to PostgreSQL!"))
  .catch((err) => console.error("Connection error", err.stack));


// Routes (מסלולים)
const authRoutes = require("./routes/auth");
const fileRoutes = require("./routes/files");
// const thankyouRoutes = require("./routes/ty");
const emailRoutes = require("./routes/email");

app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/email", emailRoutes);
// app.use("/api/thankyou", thankyouRoutes);
app.use("/uploads", express.static("uploads"));

if (process.env.NODE_ENV === "production") {
  // serving build dir as static files
  app.use(express.static(path.join(__dirname, "build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  });
}

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
