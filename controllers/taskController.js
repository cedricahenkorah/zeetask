const Task = require("../models/Task");
const User = require("../models/User");
const mongoose = require("mongoose");

const getAllTasks = async (req, res) => {
  const tasks = await Task.find({})
    .populate("team", "name")
    .populate("assignedTo", "firstName lastName username")
    .sort({ createdAt: -1 })
    .lean();

  // check if tasks exist
  if (!tasks?.length) {
    return res.status(400).json({ message: "No tasks found" });
  }

  res.status(200).json(tasks);
};

const getTask = async (req, res) => {
  const { id } = req.params;

  // check if the task id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid task id" });
  }

  // check if the team exists
  const task = await Task.findById(id)
    .populate("team", "name")
    .populate("assignedTo", "firstName lastName username")
    .lean();

  if (!task) {
    return res.status(400).json({ message: "Task not found" });
  }

  res.status(200).json(task);
};

const createTask = async (req, res) => {
  const { team, assignedTo, title, description, dueDate } = req.body;

  // check if all the fields are provided
  if (!team || !assignedTo || !title || !description) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // check if the team id are valid
  if (!mongoose.Types.ObjectId.isValid(team)) {
    return res.status(400).json({ message: "Invalid team id" });
  }

  // check if the assignedTo id are valid
  if (
    !Array.isArray(assignedTo) ||
    assignedTo.some((id) => !mongoose.Types.ObjectId.isValid(id))
  ) {
    return res
      .status(400)
      .json({ message: "Invalid user ID(s) in assignedTo" });
  }

  // create the task
  try {
    const task = await Task.create({
      team,
      assignedTo,
      title,
      description,
      dueDate,
    });

    res.status(200).json({ message: "Task created successfully", task });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateTask = async (req, res) => {
  const { id } = req.params;

  // check if the task id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid task id" });
  }

  const { assignedTo, title, description, dueDate, completed } = req.body;

  // check if all the fields exists
  // if (
  //   !assignedTo ||
  //   !title ||
  //   !description ||
  //   dueDate ||
  //   typeof completed !== "boolean"
  // ) {
  //   return res.status(400).json({ message: "All fields are required" });
  // }

  // check if the task exist
  const task = await Task.findById(id).exec();

  if (!task) {
    return res.status(400).json({ message: "Task not found" });
  }

  // update the task
  task.assignedTo = assignedTo;
  task.title = title;
  task.description = description;
  task.dueDate = dueDate;
  task.completed = completed;

  const updatedTask = await task.save();

  if (updatedTask) {
    res.status(200).json({ message: "Task updated successfully", updatedTask });
  } else {
    return res.status(400).json({ message: "Task could not be updated" });
  }
};

const deleteTask = async (req, res) => {
  const { id } = req.params;

  // check if the task id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ask id" });
  }

  // check if the task exist
  const task = await Task.findById(id).exec();

  if (!task) {
    return res.status(400).json({ message: "Task not found" });
  }

  const deletedTask = await task.deleteOne();

  if (deletedTask) {
    res.status(200).json({ message: "Task deleted successfully" });
  } else {
    return res.status(400).json({ message: "Task could not be deleted" });
  }
};

const markComplete = async (req, res) => {
  const { id } = req.params;

  // check if the task id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid task id" });
  }

  const { completed } = req.body;

  if (typeof completed !== "boolean") {
    return res.status(400).json({ message: "All fields are required" });
  }

  // check if the task exist
  const task = await Task.findById(id).exec();

  if (!task) {
    return res.status(400).json({ message: "Task not found" });
  }

  // check the task as complete and update the db
  task.completed = completed;

  const updatedTask = await task.save();

  if (updatedTask) {
    res.status(200).json({ message: "Task marked as complete", updatedTask });
  } else {
    return res
      .status(400)
      .json({ message: "Task could not be marked as complete" });
  }
};

module.exports = {
  getAllTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  markComplete,
};
