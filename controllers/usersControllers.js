const User = require("../models/User");
const Team = require("../models/Team");
const Task = require("../models/Task");
const Token = require("../models/Token");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const validator = require("validator");
const accountCreatedMail = require("../services/AccountCreatedMail");
const UserCreatedMail = require("../services/UserCreatedMail");
const generateResetToken = require("../services/generateResetToken");
const PasswordResetMail = require("../services/PasswordResetMail");
const { login } = require("../controllers/authController");
const jwt = require("jsonwebtoken");

// @desc get all users
// @route GET /users/
// @access Private
const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });

  // check if user(s) exists
  if (!users?.length) {
    return res.status(400).json({ message: "No users found" });
  }

  res.status(200).json(users);
};

// @desc get a single user
// @route GET /users/:id
// @access Private
const getUser = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "No user with that id" });
  }

  const user = await User.findById(id).select("-password");

  if (!user) {
    return res.status(400).json({ message: "No user with that id" });
  }

  res.status(200).json(user);
};

const createAdmin = async (req, res) => {
  const { firstName, lastName, email, password, username } = req.body;

  // check if all fields exist
  if (!firstName || !lastName || !email || !password || !username) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // validate email and password fields
  if (!validator.isEmail(email)) {
    throw new Error("Invalid email");
  }

  if (!validator.isStrongPassword(password)) {
    throw new Error(
      "Password is not strong enough, must be at least 8 characters long, include at least one upppercase letter, one lowercase letter, one number and one special character (e.g., !, @, #, $, etc.)"
    );
  }

  // check if email and username already exists
  const emailExists = await User.findOne({ email }).lean().exec();

  if (emailExists) {
    return res.status(409).json({ message: "Email already exists" });
  }

  const usernameExists = await User.findOne({ username }).lean().exec();

  if (usernameExists) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // generate salt and hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // create new admin user in the db
  const admin = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    username,
    isAdmin: true,
  });

  if (admin) {
    // login
    // create new access token
    // const accessToken = jwt.sign(
    //   {
    //     userInfo: {
    //       username: username,
    //       email: email,
    //     },
    //   },
    //   process.env.ACCESS_TOKEN_SECRET,
    //   { expiresIn: "1hr" }
    // );

    // create refresh token
    // const refreshToken = jwt.sign(
    //   { username: username },
    //   process.env.REFRESH_TOKEN_SECRET,
    //   { expiresIn: "3d" }
    // );

    // create secure cookie with refresh token
    // res.cookie("jwt", refreshToken, {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: "None",
    //   maxAge: 3 * 24 * 60 * 60 * 1000,
    // });

    // update the team members array
    await Team.findByIdAndUpdate(admin.team, {
      $push: { members: admin._id },
    });

    // send mail confirming account creation
    accountCreatedMail(firstName, username, email);

    res.status(201).json({
      message: "Admin created succesfully",
      admin,
      // accessToken,
    });
  } else {
    res.status(400).json({
      message:
        "Invalid admin user data received, could not create the new admin user",
    });
  }
};

// @desc create a new user
// @route POST /users/
// @access Private
const createUser = async (req, res) => {
  const { firstName, lastName, email, password, username, adminId } = req.body;

  // check if all fields exist
  if (!firstName || !lastName || !email || !password || !username) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // validate email and password fields
  if (!validator.isEmail(email)) {
    throw new Error("Invalid email");
  }

  if (!validator.isStrongPassword(password)) {
    throw new Error(
      "Password is not strong enough, must be at least 8 characters long, include at least one upppercase letter, one lowercase letter, one number and one special character (e.g., !, @, #, $, etc.)"
    );
  }

  // check if email and username already exists
  const emailExists = await User.findOne({ email }).lean().exec();

  if (emailExists) {
    return res.status(409).json({ message: "Email already exists" });
  }

  const usernameExists = await User.findOne({ username }).lean().exec();

  if (usernameExists) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // retrieve admin with the adminId
  const adminUser = await User.findById(adminId).exec();

  if (!adminUser) {
    return res.status(404).json({ message: "No admin with that id" });
  }

  // set the name of the admin
  const adminName = adminUser.firstName + " " + adminUser.lastName;

  // set the team id of the admin
  const teamId = adminUser.team;

  // find the team with the teamId
  const team = await Team.findById(teamId).exec();

  // set the team name
  const teamName = team.name;

  // generate salt and hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // create new user in the db
  const user = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    username,
    team,
  });

  if (user) {
    // update the team members array
    await Team.findByIdAndUpdate(teamId, {
      $push: { members: user._id },
    });

    res.status(201).json({ message: "User created succesfully" });

    // send mail confirming account creation
    UserCreatedMail(firstName, username, email, password, teamName, adminName);
  } else {
    res.status(400).json({
      message: "Invalid user data received, could not create the new user",
    });
  }
};

const getCurrentUser = async (req, res) => {
  const accessToken = req.headers.authorization.split(" ")[1]; // Assuming the access token is in the Authorization header

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const username = decoded.userInfo.username;

    // Find the user by their username
    const user = await User.findOne({ username }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

// @desc update a user
// @route POST /users/:id
// @access Private
const updateUser = async (req, res) => {
  const { id } = req.params;

  // check if the user id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "No user with that id" });
  }

  const { firstName, lastName, email, username } = req.body;

  // check if all fields exist
  if (!firstName || !lastName || !email || !username) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const user = await User.findById(id).exec();

  // check if the user exists
  if (!user) {
    return res.status(400).json({ message: "No user with that id" });
  }

  // check if the username and email already exists
  const emailExists = await User.findOne({ email }).lean().exec();

  if (emailExists && emailExists._id.toString() !== id) {
    return res.status(409).json({ message: "Email already exists" });
  }

  const usernameExists = await User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (usernameExists && usernameExists._id.toString() !== id) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // update the user in the db
  user.firstName = firstName;
  user.lastName = lastName;
  user.email = email;
  user.username = username;

  const updatedUser = await user.save();

  if (updatedUser) {
    res.status(200).json({ message: "User updated successfully" });
  } else {
    return res.status(400).json({ message: "Error updating user" });
  }
};

// @desc delete a user
// @route DELETE /users/:id
// @access Private
const deleteUser = async (req, res) => {
  const { id } = req.params;

  // check if the user id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "No user with that id" });
  }

  // find and delete the user from the db
  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "No user with that id" });
  }

  const deletedUser = await user.deleteOne();

  if (deletedUser) {
    res.status(200).json({ message: "User deleted successfully" });
  } else {
    return res.status(400).json({ message: "Error deleting user" });
  }
};

const updateIsAdmin = async (req, res) => {
  const { id } = req.params;
  const { isAdmin } = req.body;

  // check if the user id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "No user with that id" });
  }

  // check if the currently logged in user is an admin
  const isAdminUser = req.user.isAdmin;

  // allow only admins to update the isAdmin field
  if (!isAdminUser) {
    return res
      .status(403)
      .json({ message: "Only admins can update the isAdmin field" });
  }

  // find and update the user in the db
  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "No user with that id" });
  }

  user.isAdmin = isAdmin;

  try {
    await user.save();

    return res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Error updating user" });
  }
};

const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // check if the user id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "No user with that id" });
  }

  // check if the currently logged in user is an admin
  const isAdminUser = req.user.isAdmin;

  // allow only admins to update the status field
  if (!isAdminUser) {
    return res
      .status(403)
      .json({ message: "Only admins can update the status field" });
  }

  // find and update the user in the db
  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "No user with that id" });
  }

  user.status = status;

  try {
    await user.save();

    return res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Error updating user" });
  }
};

const changePassword = async (req, res) => {
  const { id } = req.params;

  // check if the user id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "No user with that id" });
  }

  const { password } = req.body;

  // check if password field exist
  if (!password) {
    return res.status(400).json({ message: "Password field is required" });
  }

  // check if user exists
  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "No user with that id" });
  }

  // hash and update the password
  try {
    user.password = await bcrypt.hash(password, 10);
    const updatedUser = await user.save();
    if (updatedUser) {
      res.json({ message: "Password updated successfully" });
    }
  } catch (error) {
    res.status(500).json({ message: "Password failed to update" });
  }
};

const resetPasswordRequest = async (req, res) => {
  const { email } = req.body;

  // check if the email of the user exists
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "No user with that email" });
  }

  // generate a unique reset token
  const resetToken = generateResetToken();

  // create a new token document and associate it with the user
  const tokenDoc = new Token({
    userId: user._id,
    token: resetToken,
  });

  await tokenDoc.save();

  // send the reset token to the user's email
  const resetLink = `https://[website]/reset-password/${resetToken}`;

  PasswordResetMail(resetLink);
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  // check if the token exists in the db and validate its expiration
  const resetToken = await Token.findOne({ token });

  if (!resetToken || resetToken.isExpired()) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  // find the user associated with the token
  const user = await User.findById(resetToken.userId);

  if (!user) {
    return res.status(400).json({ message: "No user with that token" });
  }

  // update the user's password
  user.password = newPassword;

  await user.save();

  // delete the reset token
  await resetToken.remove();

  return res.status(200).json({ message: "Password reset successfully" });
};

module.exports = {
  getUser,
  getAllUsers,
  getCurrentUser,
  createUser,
  updateUser,
  deleteUser,
  updateIsAdmin,
  updateStatus,
  resetPasswordRequest,
  resetPassword,
  changePassword,
  createAdmin,
};
