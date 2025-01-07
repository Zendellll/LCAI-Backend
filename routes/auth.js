const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// רישום משתמש חדש
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (password.length < 6) {
      return res
        .status(400)
        .send({ message: "Password must be at least 6 characters long" });
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).send({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ message: "User already exists" });
    }

    const user = new User({ username, email, password });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).send({ user, token });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// התחברות משתמש
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send({ message: "Invalid login credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // שמירת ה-token ב-cookie
    res.cookie("authToken", token, {
      httpOnly: true, // לא ניתן לגשת אליו דרך JavaScript
      secure: process.env.NODE_ENV === "production", // true אם ב-production
      maxAge: 3600000, // 1 שעה
    });

    res.send({ user, token });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.post("/logout", (req, res) => {
  try {
    res.clearCookie("authToken", {
      httpOnly: true, // אותו דבר כמו בהגדרת ה-cookie
      secure: process.env.NODE_ENV === "production", // אם ב-production
      maxAge: 0, // מנקה את ה-cookie
    });

    res.status(200).send({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});
// בצד השרת, בנתיב '/verifyToken'
router.get("/verifyToken", async (req, res) => {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).send({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId); // למצוא את המשתמש עם ה-ID
    res.send({ user }); // מחזיר את המידע של המשתמש
  } catch (error) {
    res.status(401).send({ message: "Invalid or expired token" });
  }
});

module.exports = router;
