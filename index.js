const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

const app = express();

const cookieParser = require("cookie-parser");

// הוספת cookie-parser ל-Express
app.use(cookieParser());
// הגדרות CORS והבנת JSON
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:3000", // הכתובת של הלקוח בסביבת פרודקשן
  methods: "GET,POST", // סוגי הבקשות שאתה מאשר
  credentials: true, // מאפשר לשלוח cookies עם הבקשה
};

app.use(cors(corsOptions));
app.use(express.json());

// חיבור ל-MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/LCAI",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("MongoDB connected...");
  } catch (err) {
    console.error(err);
    process.exit(1); // סיום במקרה של שגיאה בחיבור
  }
};

// הפעלת החיבור ל-MongoDB
connectDB();

// Routes (מסלולים)
const authRoutes = require("./routes/auth");
const fileRoutes = require("./routes/files");

app.use("/api/auth", authRoutes); // הפניית בקשות למסלולי ההרשמה וההתחברות
app.use("/api/files", fileRoutes); // הפניית בקשות למסלולי הקבצים
app.use("/uploads", express.static("uploads"));

if (process.env.NODE_ENV === "production") {
  // הגשת תיקיית build כקבצים סטטיים
  app.use(express.static(path.join(__dirname, "build")));

  // הגשת index.html לכל הבקשות שאינן API
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  });
}

// שמירת השרת מאזין לפורט הנכון
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
