const express = require("express");
const verifyJWT = require("../middleware/verifyJWT");

const router = express.Router();

// verify jwt
router.use(verifyJWT);

// get all teams
router.get("/");

// get a single team
router.get("/:id");

// create a team
router.post("/");

// update a team
router.patch("/:id");

// delete a team
router.delete("/:id");

module.exports = router;
