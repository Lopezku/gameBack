const jwt = require("jsonwebtoken");
exports.test = (req, res) => {
  res.status(200).json({ message: "token ok" + req.token.userID });
};
