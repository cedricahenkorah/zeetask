const axios = require("axios");
const Payment = require("../models/Payment");

class PaymentService {
  async debitWallet(debitData) {
    try {
      // send a POST request to the debit mobile wallet API
      const response = await axios.post(
        `${process.env.DEBIT_WALLET_URL}`,
        debitData
      );

      // save the transaction details to the database
      await this.saveTransaction(debitData);

      return response.data;
    } catch (error) {
      throw new Error("Payment failed", error.message);
    }
  }

  async saveTransaction(debitData) {
    // save the transaction details to the database
    await Payment.create(debitData);
  }
}

module.exports = PaymentService;
