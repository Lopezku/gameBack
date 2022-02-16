const jwt = require("jsonwebtoken");
require("dotenv").config();
exports.auth = (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    let tokenPayload = jwt.verify(token, process.env.TOKEN_ENV);
    console.log("🚀 ~ file: auth.js ~ line 7 ~ tokenPayload", tokenPayload);
    req.token = jwt.verify(token, process.env.TOKEN_ENV);
    next();
  } catch (error) {
    res.status(501).json({ message: "token d'authentification incorrect" });
  }
};
