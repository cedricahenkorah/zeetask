const express = require("express");
const { login, logout, refresh } = require("../controllers/authController");

const router = express.Router();

// login route
router.post("/login", login);

// refresh jwt
router.get("/refresh", refresh);

// logout route
router.post("/logout", logout);

module.exports = router;
