const axios = require("axios");
const Payment = require("../models/Payment");
const Team = require("../models/Team");

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

      // check if the response is successful and update the subscription status of the team
      if (response.data.success) {
        await this.updateTeamSubscription(debitData.teamId, true);
      }

      return response.data;
    } catch (error) {
      throw new Error("Payment failed", error.message);
    }
  }

  async updateTeamSubscription(teamId, isSubscribed) {
    // update the subscription status of the team in the database
    await Team.findByIdAndUpdate(teamId, { subscription: isSubscribed });
  }

  async saveTransaction(debitData) {
    // save the transaction details to the database
    await Payment.create(debitData);
  }
}

module.exports = PaymentService;
