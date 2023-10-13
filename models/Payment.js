const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const paymentSchema = new Schema(
  {
    amount: {
      type: String,
      required: true,
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
    },
    customerName: {
      type: String,
      required: true,
    },
    mno: {
      type: String,
      required: true,
    },
    msisdn: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    callback_url: {
      type: String,
      required: false,
    },
    paymentStatus: {
      type: String,
      default: "created",
    },
    zeepay_id: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
