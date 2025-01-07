const router = require("express").Router();
const auth = require("../middleware/auth");
const multer = require("multer");
const path = require("path"); // ייבוא מודול path
const File = require("../models/File");
const fs = require("fs");

// הגדרת אחסון עם Multer בזיכרון
const storage = multer.memoryStorage(); // שינוי לאחסון בזיכרון
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// הגדרת מסלול להעלאת קבצים
router.post("/upload", auth, upload.single("file"), async (req, res) => {
  try {
    // אם לא הועלה קובץ
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    console.log("Received file:", req.file);

    const safeFilename = encodeURIComponent(req.file.originalname);

    // שמירה בקובץ DB בצורה של Buffer
    const file = new File({
      filename: req.file.originalname, // השם המקורי
      originalName: safeFilename, // שמירת שם הקובץ המקורי
      mimetype: req.file.mimetype, // סוג הקובץ
      size: req.file.size, // גודל הקובץ
      userId: req.userId, // מזהה המשתמש
      data: req.file.buffer, // שמירת תוכן הקובץ כ-buffer
    });

    await file.save(); // שמירה במסד הנתונים
    console.log("File saved to DB:", file);
    res.status(201).send(file); // שליחה של תשובת העלאה
  } catch (error) {
    console.error(error);
    res.status(400).send(error); // טיפול בשגיאות
  }
});

// הגדרת מסלול להצגת קבצים שהעלו המשתמשים
router.get("/my-files", auth, async (req, res) => {
  try {
    console.log("my-filesmy-filesmy-filesmy-filesmy-filesmy-filesmy-files");

    const files = await File.find({ userId: req.userId }); // שליפה לפי מזהה המשתמש
    res.send(files); // שליחה של רשימת הקבצים
  } catch (error) {
    res.status(500).send(error); // טיפול בשגיאות
  }
});

// הגדרת מסלול להורדת קובץ
router.get("/download/:id", async (req, res) => {
  try {
    const file = await File.findById(req.params.id); // שליפת הקובץ לפי ה-ID

    if (!file) {
      return res.status(404).send({ message: "File not found" }); // אם הקובץ לא נמצא
    }

    // שליחה של הקובץ כ-binary response
    res.set("Content-Type", file.mimetype); // הגדרת סוג התוכן
    res.set(
      "Content-Disposition",
      `attachment; filename=${encodeURIComponent(file.originalName)}`
    );
    res.send(file.data); // שליחה של תוכן ה-buffer
  } catch (error) {
    console.error(error); // הצגת שגיאה במקרה של שגיאה כללית
    res.status(500).send({ message: "Internal Server Error" });
  }
});

module.exports = router;
