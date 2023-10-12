const express = require("express");
const verifyJWT = require("../middleware/verifyJWT");
const { debitMobileWallet } = require("../controllers/paymentController");

const router = express.Router();

// verify jwt
router.use(verifyJWT);

// debit mobile wallet
router.post("/debit-mobile-wallet", debitMobileWallet);

module.exports = router;
