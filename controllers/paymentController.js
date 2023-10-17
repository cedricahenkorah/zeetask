const PaymentService = require("../services/paymentService");
const Payment = require("../models/Payment");
const mongoose = require("mongoose");
const Team = require("../models/Team");

const debitService = new PaymentService();

const debitMobileWallet = async (req, res) => {
  const { customerName, mno, amount, msisdn, teamId, reference } = req.body;

  // check if all the fields are provided
  if (!customerName || !mno || !amount || !msisdn || !teamId || !reference) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // check if the teamId is a valid Id
  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    return res.status(400).json({ message: "Invalid team id" });
  }

  // check if the team exists
  const team = await Team.findById(teamId).lean();

  if (!team) {
    return res.status(400).json({ message: "Team not found" });
  }

  // data to be sent to zeepay API
  const debitData = {
    customerName,
    mno,
    amount,
    msisdn,
    reference,
    description: process.env.DEBIT_DESCRIPTION,
    callback_url: process.env.CALLBACK_URL,
  };

  // data to be saved as a document in the database
  const paymentData = {
    customerName,
    mno,
    amount,
    msisdn,
    reference,
    description: process.env.DEBIT_DESCRIPTION,
    callback_url: process.env.CALLBACK_URL,
    teamId,
  };

  try {
    // call the debitWallet method of the paymentService
    const response = await debitService.debitWallet(debitData, paymentData);

    if (response.code === 400) {
      return res.status(400).json({ message: response.message, response });
    } else {
      res
        .status(200)
        .json({ message: "Payment is pending, hold on...", response });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ response: "Payment failed", error });
  }
};

const callback = async (req, res) => {
  const { zeepay_id, reference, status, code, message, gateway_id } = req.body;
  console.log(req.body);

  // check if all the fields are provided
  if (!zeepay_id || !reference || !status || !code || !message || !gateway_id) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // check if the zeepay id (payment id) exists
    const payment = await Payment.findOne({ zeepay_id });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Log the payment data
    console.log("Found payment: ", payment);

    // check the status of the payment and update the payment status in the database
    if (status === "Success" && code === 200) {
      // if payment is successful
      payment.paymentStatus = "success";
    } else {
      // if payment failed
      payment.paymentStatus = "failed";
    }

    // update the payment status in the database
    const updatedPayment = await payment.save();
    console.log("updated payment", updatedPayment);

    if (updatedPayment) {
      // update the team's subscription status to true
      await debitService.updateTeamSubscription(payment.teamId, true);

      res
        .status(200)
        .json({ message: "Payment updated successfully", updatedPayment });
    } else {
      return res.status(400).json({ message: "Payment not updated" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error processing callback", error });
  }
};

module.exports = { debitMobileWallet, callback };
