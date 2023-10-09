const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  const { username, password } = req.body;

  // check if all fields exist
  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // check if user exists
  const foundUser = await User.findOne({ usernname }).exec();

  if (!foundUser || !foundUser.status) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // compare passwords
  const match = await bcrypt.compare(password, foundUser.password);

  if (!match) return res.status(401).json({ message: "Unauthorized" });

  // create new access token
  const accessToken = jwt.sign(
    {
      userInfo: {
        username: foundUser.username,
        email: foundUser.email,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1hr" }
  );

  // create refresh token
  const refreshToken = jwt.sign(
    { username: foundUser.username },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "3d" }
  );

  // create secure cookie with refresh token
  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 3 * 24 * 60 * 60 * 1000,
  });

  // send access token
  res.json({ accessToken });
};

const logout = (req, res) => {
  const cookies = req.cookies;

  // check if the cookie exists
  if (!cookies?.jwt) return res.sendStatus(204);

  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });

  res.json({ message: "Cookie cleared" });
};

const refresh = async (req, res) => {
  const cookies = req.cookies;

  // check if the cookie exists
  if (!cookies?.jwt) {
    return res.status(401).json({ msg: "Unauthorized" });
  }

  const refreshToken = cookies.jwt;

  // verify refresh token
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) {
        return res.status(403).json({ msg: "Forbidden" });
      }

      // check if the user exists
      const foundUser = await User.findOne({
        username: decoded.username,
      }).exec();

      if (!foundUser) {
        return res.status(401).json({ msg: "Unauthorized" });
      }

      // create access token
      const accessToken = jwt.sign(
        {
          userInfo: {
            username: foundUser.username,
            email: foundUser.email,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1hr" }
      );

      res.json({ accessToken });
    }
  );
};

module.exports = { login, logout, refresh };
