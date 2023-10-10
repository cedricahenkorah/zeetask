const express = require("express");
const verifyJWT = require("../middleware/verifyJWT");
const {
  getAllTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
} = require("../controllers/teamController");

const router = express.Router();

// verify jwt
router.use(verifyJWT);

// get all teams
router.get("/", getAllTeams);

// get a single team
router.get("/:id", getTeam);

// create a team
router.post("/", createTeam);

// update a team
router.patch("/:id", updateTeam);

// delete a team
router.delete("/:id", deleteTeam);

module.exports = router;
