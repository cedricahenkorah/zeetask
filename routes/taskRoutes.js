const express = require("express");
const verifyJWT = require("../middleware/verifyJWT");
const {
  getAllTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  markComplete,
} = require("../controllers/taskController");

const router = express.Router();

// verify jwt
// router.use(verifyJWT);

// get all tasks
router.get("/", getAllTasks);

// get a single task
router.get("/:id", getTask);

// create a task
router.post("/", createTask);

// update a task
router.patch("/:id", updateTask);

// delete a task
router.delete("/:id", deleteTask);

// mark task as complete
router.patch("/markComplete/:id", markComplete);

module.exports = router;
