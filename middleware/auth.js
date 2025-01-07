const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const token = req.cookies.authToken;
    if (!token) {
      return res.status(401).send({ error: "Please authenticate." });
    }

    // Verify the JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId;

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).send({ error: "Invalid token. Please authenticate." });
  }
};

module.exports = auth;
