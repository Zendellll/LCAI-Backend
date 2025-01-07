const router = require("express").Router();
const auth = require("../middleware/auth");
const multer = require("multer");
const path = require("path"); // ייבוא מודול path
const File = require("../models/File");
const fs = require("fs");

// הגדרת אחסון עם multer
const storage = multer.diskStorage({
  destination: "./uploads/", // המיקום שבו הקבצים יישמרו
  filename: (req, file, cb) => {
    // יצירת שם קובץ ייחודי, שמירה על שם הקובץ המקורי
    const uniqueSuffix = Date.now(); // תוסף ייחודי המבוסס על זמן
    const originalName = file.originalname; // השם המקורי של הקובץ
    const extension = path.extname(originalName); // סיומת הקובץ
    const filename = `${originalName}-${uniqueSuffix}`; // יצירת שם ייחודי לקובץ
    cb(null, filename); // שמירת שם הקובץ עם התוסף הייחודי
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

// הגדרת מסלול להעלאת קבצים
router.post("/upload", auth, upload.single("file"), async (req, res) => {
  try {
    console.log("Received upload request", req.body); // לוג לקבלת הבקשה
    console.log("Received upload file", req.file); // לוג לקבלת הבקשה
    const safeFilename = encodeURIComponent(req.file.originalname); // קידוד שם הקובץ

    console.log("File upload successful:", req.file);

    const file = new File({
      filename: req.file.filename, // השם החדש שנשמר בשרת
      originalName: safeFilename, // שמירת השם המקורי של הקובץ
      path: req.file.path, // נתיב הקובץ
      mimetype: req.file.mimetype, // סוג הקובץ
      size: req.file.size, // גודל הקובץ
      userId: req.userId, // מזהה המשתמש
    });
    await file.save(); // שמירה במסד הנתונים
    console.log("File saved to DB:", file);
    res.status(201).send(file); // שליחה של תשובת העלאה
  } catch (error) {
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

    const filePath = path.join(__dirname, "../uploads", file.filename); // יצירת נתיב מלא לקובץ

    // ודא שהנתיב תקין ושם הקובץ מקודד כראוי
    const encodedFilename = encodeURIComponent(file.filename); // השתמש בשם המקורי

    // קובץ יכול להיות קריא, אז נוודא גם שהקובץ קיים
    if (!fs.existsSync(filePath)) {
      return res.status(404).send({ message: "File not found on the server" });
    }
    // הורדת הקובץ עם שם מקודד
    res.download(filePath, encodedFilename, (err) => {
      if (err) {
        console.error(err); // הצגת שגיאה אם קיימת
        res.status(500).send({ message: "Could not download the file." });
      }
    });
  } catch (error) {
    console.error(error); // הצגת שגיאה במקרה של שגיאה כללית
    res.status(500).send({ message: "Internal Server Error" });
  }
});

module.exports = router;
