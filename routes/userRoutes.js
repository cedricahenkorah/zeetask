const express = require("express");
const verifyJWT = require("../middleware/verifyJWT");

const router = express.Router();

// verify jwt
// router.use(verifyJWT);

// get all users
router.get("/", getAllUsers);

// get a single user
router.get("/:id", getUser);

// create a user
router.post("/", createUser);

// update a user
router.patch("/:id", updateUser);

// delete a user
router.delete("/:id", deleteUser);

// change password
router.patch("/changepassword/:id", changePassword);

// password reset request
router.post("/reset-password-request", resetPasswordRequest);

// password reset with a token
router.post("reset-password", resetPassword);

// update the status field
router.patch("/:id/update-status", updateStatus);

// update the isAdmin field
router.patch("/:id/update-isAdmin", updateIsAdmin);

module.exports = router;
