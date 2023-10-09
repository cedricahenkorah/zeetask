const express = require("express");
const verifyJWT = require("../middleware/verifyJWT");

const router = express.Router();

// verify jwt
router.use(verifyJWT);

// get all tasks
router.get("/");

// get a single task
router.get("/:id");

// create a task
router.post("/");

// update a task
router.patch("/:id");

// delete a task
router.delete("/:id");

module.exports = router;
