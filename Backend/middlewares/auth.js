const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied auth" });
  }
  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = { id: decoded.id };
    next();
  } catch (error) {
     console.error("Token verification error:", error);
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = verifyToken;
