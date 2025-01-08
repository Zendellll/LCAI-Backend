const router = require("express").Router();
const auth = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const File = require("../models/File");
const fs = require("fs");

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// הגדרת אחסון עם multer
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const originalName = file.originalname;
    const safeFilename = encodeURIComponent(originalName);
    cb(null, safeFilename);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

router.post("/upload", auth, upload.single("file"), async (req, res) => {
  try {
    const file = new File({
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      userId: req.userId,
    });
    await file.save();
    res.status(201).send(file);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/my-files", auth, async (req, res) => {
  try {
    const files = await File.find({ userId: req.userId });
    res.send(files);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/download/:id", async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).send({ message: "File not found" });
    }

    const filePath = path.join(__dirname, "../uploads", file.filename);

    const encodedFilename = decodeURIComponent(file.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).send({ message: "File not found on the server" });
    }
    res.download(filePath, encodedFilename, (err) => {
      if (err) {
        console.error(err);
        res.status(500).send({ message: "Could not download the file." });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

module.exports = router;
