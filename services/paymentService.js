const axios = require("axios");
const Payment = require("../models/Payment");
const Team = require("../models/Team");

class PaymentService {
  async debitWallet(debitData, paymentData) {
    try {
      // save the transaction details to the database
      const debitPayment = await this.saveTransaction(paymentData);
      console.log(debitPayment);

      // set the reference in debitPayment to the ._id of the created payment
      debitData.reference = debitPayment._id;

      // send a POST request to the debit mobile wallet API
      const response = await axios.post(
        process.env.DEBIT_WALLET_URL,
        debitData,
        {
          headers: {
            Authorization: "Bearer " + process.env.DEBIT_ACCESS_TOKEN,
            "Content-Type": "application/json",
          },
        }
      );

      // log the response first ...
      console.log(response.data);

      // check if the response is successful and update the status of the payment to "pending" and set the xeepay_id in the debitPayment
      if (response.data.code === 411) {
        // set the zeepay_id in the debitPayment to match the zeepay_id from the response
        debitPayment.zeepay_id = response.data.zeepay_id;

        // update the payment status to "pending" in the database
        debitPayment.paymentStatus = "pending";

        // save the updated debitPayment to the database
        await debitPayment.save();
      }

      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error("Payment failed", error);
    }
  }

  async updateTeamSubscription(teamId, isSubscribed) {
    // update the subscription status of the team in the database
    return await Team.findByIdAndUpdate(teamId, { subscription: isSubscribed });
  }

  async saveTransaction(paymentData) {
    // save the transaction details to the database
    return await Payment.create(paymentData);
  }
}

module.exports = PaymentService;
