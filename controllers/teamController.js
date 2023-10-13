const Team = require("../models/Team");
const User = require("../models/User");
const mongoose = require("mongoose");

const getAllTeams = async (req, res) => {
  // get all teams from the db
  const teams = await Team.find({})
    .populate("admin", "firstName lastName username")
    .populate("members", "firstName lastName username")
    .sort({ createdAt: -1 })
    .lean();

  // check if teams exist
  if (!teams?.length) {
    return res.status(400).json({ message: "No teams found" });
  }

  res.status(200).json(teams);
};

const getTeam = async (req, res) => {
  const { id } = req.params;

  // check if the team id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid team id" });
  }

  // check if the team exists
  const team = await Team.findById(id)
    .populate("admin", "firstName lastName username")
    .populate("members", "firstName lastName username")
    .lean();

  if (!team) {
    return res.status(400).json({ message: "Team not found" });
  }

  res.status(200).json(team);
};

const createTeam = async (req, res) => {
  const { name, admin } = req.body;

  // check if all the fields are provided
  if (!name || !admin) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // check if the admin id is valid
  if (!mongoose.Types.ObjectId.isValid(admin)) {
    return res.status(400).json({ message: "Invalid admin id" });
  }

  // check if the admin exists
  const adminUser = await User.findById(admin);
  if (!adminUser) {
    return res.status(400).json({ message: "Admin not found" });
  }

  // check if the team name is already taken
  const teamExists = await Team.findOne({ name });

  if (teamExists) {
    return res.status(400).json({ message: "Team name already taken" });
  }

  // create the team
  try {
    const team = await Team.create({ name, admin });

    // Update the admin user's team field
    adminUser.team = team._id;
    await adminUser.save();

    res.status(201).json({ message: "Team created successfully", team });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateTeam = async (req, res) => {
  const { id } = req.params;

  // check if the team id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid team id" });
  }

  const { name } = req.body;

  // check if the field exist
  if (!name) {
    return res.status(400).json({ message: "the name field does not exist" });
  }

  // check if the task exists
  const team = await Team.findById(id).exec();

  if (!team) {
    return res.status(400).json({ message: "No team with this id found" });
  }

  // update the team
  team.name = name;

  const updatedTeam = await team.save();

  if (updatedTeam) {
    res
      .status(200)
      .json({ message: "The team has been updated succesfully", updatedTeam });
  } else {
    return res.status(400).json({ message: "The team could not be updated" });
  }
};

const deleteTeam = async (req, res) => {
  const { id } = req.params;

  // check if the team id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid team id" });
  }

  // check if the team exists
  const team = await Team.findById(id).exec();

  if (!team) {
    return res.status(400).json({ message: "No team with this id found" });
  }

  const deletedTeam = await team.deleteOne();

  if (deletedTeam) {
    res.status(200).json({ message: "The team has been deleted succesfully" });
  } else {
    return res.status(400).json({ message: "The team could not be deleted" });
  }
};

module.exports = { getAllTeams, getTeam, createTeam, updateTeam, deleteTeam };
