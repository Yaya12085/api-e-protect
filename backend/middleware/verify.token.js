const jwt = require("jsonwebtoken");
const secretKey = process.env.SECRET_KEY;

function verifyToken(req, res, next) {
  const token = req.header("Authorization");
  try {
    if (!token) {
      return res
        .status(401)
        .json({ message: "Accès non autorisé. Token manquant." });
    }

    const decoded = jwt.verify(token, secretKey);
    req.user = decoded.utilisateur._id;
    next(); // Appeler next() pour passer à la prochaine étape du middleware
  } catch (error) {
    res.status(401).json({
      message: "Accès non autorisé. Token invalide.",
      secretKey,
      token,
    });
  }
}

module.exports = verifyToken;
