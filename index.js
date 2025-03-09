const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const pool = require("./db");

require("dotenv").config();

const app = express();

const cookieParser = require("cookie-parser");

// Adding cookie-parser to express
app.use(cookieParser());
//

const allowedOrigins = [
  "https://lcai-backend.onrender.com",
  "https://lcai-backend-xmgh.onrender.com"
];

const corsOptions = {
  origin: (origin, callback) => {
    // If there's no origin (e.g., mobile apps, curl requests), or if the origin is in the list, allow it
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error(`CORS Error: Origin ${origin} not allowed.`));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

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
const getSubmissionsRoute = require("./routes/getSubmissions");

app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/email", emailRoutes);
// app.use("/api/thankyou", thankyouRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/submissions", getSubmissionsRoute);

if (process.env.NODE_ENV === "production") {
  // serving build dir as static files
  app.use(express.static(path.join(__dirname, "build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  });
}

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
