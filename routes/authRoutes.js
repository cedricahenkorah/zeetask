const express = require("express");

const router = express.Router();

// login route
router.post("/login");

// refresh jwt
router.get("/refresh");

// logout route
router.post("/logout");

module.exports = router;
