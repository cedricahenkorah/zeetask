const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
  const { authorization } = req.headers;

  // check if authorization is present
  if (!authorization || !authorization.startsWith("Bearer")) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  // grab the jwt token from the authorization header
  const token = authorization.split(" ")[1];

  // verify the token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.UserInfo.username;

    next();
  } catch (err) {
    console.log(err);
    return res.status(403).json({ message: "Forbidden" });
  }
};

module.exports = verifyJWT;
