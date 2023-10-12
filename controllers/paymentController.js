const PaymentService = require("../services/paymentService");

const debitService = new PaymentService();

const debitMobileWallet = async (req, res) => {
  const { customerName, mno, amount, msisdn, reference, teamId } = req.body;

  // check if all the fields are provided
  if (!customerName || !mno || !amount || !msisdn || !reference || !teamId) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // check if the teamId is a valid Id
  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    return res.status(400).json({ message: "Invalid team id" });
  }

  // check if the team exists
  const team = await Team.findById(id).lean();

  if (!team) {
    return res.status(400).json({ message: "Team not found" });
  }

  const paymentData = {
    customerName,
    mno,
    amount,
    msisdn,
    reference,
    description: process.env.DEBIT_DESCRIPTION,
    callback_url: process.env.CALLBACK_URL,
  };

  try {
    // call the debitWallet method of the paymentService
    const response = await debitService.debitWallet(paymentData);
    res.status(200).json({ message: "Payment was successful", response });
  } catch (error) {
    res.status(400).json({ message: "Payment failed", error });
  }
};

module.exports = { debitMobileWallet };
