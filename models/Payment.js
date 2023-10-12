const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const paymentSchema = new Schema(
  {
    status: {
      type: Boolean,
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
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
    reference: {
      type: String,
      required: true,
    },
    callback_url: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

modules.export = mongoose.model("Payment", paymentSchema);
